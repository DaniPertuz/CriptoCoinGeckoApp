import env from '../config/env';
import type {
  CoinGeckoGlobalResponse,
  CoinGeckoMarketChartResponse,
  CoinGeckoMarketCoin,
  CryptoMarketChart,
  CryptoMarketCoin,
  DashboardQuery,
  DashboardSummary,
  GlobalMarketKpis,
  MarketChartPoint,
  MarketChartQuery,
  TopCryptocurrenciesQuery,
} from '../types/crypto';
import AppError from '../utils/AppError';

interface CoinGeckoCacheEntry {
  data: unknown;
  expiresAt: number;
  cachedAt: number;
}

const responseCache = new Map<string, CoinGeckoCacheEntry>();
const pendingRequests = new Map<string, Promise<unknown>>();

const normalizeVsCurrency = (vsCurrency: string): string => vsCurrency.trim().toLowerCase();

const getCachedResponse = <TResponse>(cacheKey: string): TResponse | null => {
  if (!env.coingecko.cacheTtlMs) {
    return null;
  }

  const entry = responseCache.get(cacheKey);

  if (!entry || Date.now() > entry.expiresAt) {
    return null;
  }

  return entry.data as TResponse;
};

const getStaleResponse = <TResponse>(cacheKey: string): TResponse | null => {
  const entry = responseCache.get(cacheKey);
  return entry ? (entry.data as TResponse) : null;
};

const setCachedResponse = <TResponse>(cacheKey: string, data: TResponse): void => {
  if (!env.coingecko.cacheTtlMs) {
    return;
  }

  const now = Date.now();

  responseCache.set(cacheKey, {
    data,
    cachedAt: now,
    expiresAt: now + env.coingecko.cacheTtlMs,
  });
};

const getCoinGeckoHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    accept: 'application/json',
  };

  if (env.coingecko.apiKey) {
    headers[env.coingecko.apiKeyHeader] = env.coingecko.apiKey;
  }

  return headers;
};

const requestCoinGecko = async <TResponse>(url: URL): Promise<TResponse> => {
  const cacheKey = url.toString();
  const cachedResponse = getCachedResponse<TResponse>(cacheKey);

  if (cachedResponse) {
    return cachedResponse;
  }

  const pendingRequest = pendingRequests.get(cacheKey);

  if (pendingRequest) {
    return pendingRequest as Promise<TResponse>;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.coingecko.timeoutMs);

  const request = (async () => {
    const response = await fetch(url, {
      headers: getCoinGeckoHeaders(),
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new AppError(
          'CoinGecko rate limit exceeded',
          429,
          'COINGECKO_RATE_LIMITED',
          { status: response.status },
        );
      }

      throw new AppError(
        'CoinGecko request failed',
        response.status >= 500 ? 502 : response.status,
        'COINGECKO_REQUEST_FAILED',
        { status: response.status },
      );
    }

    const data = (await response.json()) as TResponse;
    setCachedResponse(cacheKey, data);
    return data;
  })();

  pendingRequests.set(cacheKey, request);

  try {
    return await request;
  } catch (error) {
    const staleResponse = getStaleResponse<TResponse>(cacheKey);

    if (staleResponse) {
      return staleResponse;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new AppError('CoinGecko request timed out', 504, 'COINGECKO_TIMEOUT');
    }

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('CoinGecko integration is unavailable', 502, 'COINGECKO_UNAVAILABLE');
  } finally {
    clearTimeout(timeout);
    pendingRequests.delete(cacheKey);
  }
};

const mapMarketCoin = (coin: CoinGeckoMarketCoin): CryptoMarketCoin => ({
  id: coin.id,
  symbol: coin.symbol,
  name: coin.name,
  image: coin.image,
  currentPrice: coin.current_price,
  marketCap: coin.market_cap,
  marketCapRank: coin.market_cap_rank,
  totalVolume: coin.total_volume,
  priceChangePercentage1h: coin.price_change_percentage_1h_in_currency ?? null,
  priceChangePercentage24h: coin.price_change_percentage_24h_in_currency ?? coin.price_change_percentage_24h,
  priceChangePercentage7d: coin.price_change_percentage_7d_in_currency ?? null,
  sparkline7d: coin.sparkline_in_7d?.price ?? [],
  lastUpdated: coin.last_updated,
});

const mapChartPoints = (points: Array<[number, number]>): MarketChartPoint[] =>
  points.map(([timestamp, value]) => ({
    timestamp,
    value,
  }));

const getTopCryptocurrencies = async ({
  vsCurrency = 'usd',
  limit = 10,
  includeSparkline = true,
}: TopCryptocurrenciesQuery = {}): Promise<CryptoMarketCoin[]> => {
  const url = new URL(`${env.coingecko.apiUrl}/coins/markets`);
  url.searchParams.set('vs_currency', normalizeVsCurrency(vsCurrency));
  url.searchParams.set('order', 'market_cap_desc');
  url.searchParams.set('per_page', String(limit));
  url.searchParams.set('page', '1');
  url.searchParams.set('sparkline', String(includeSparkline));
  url.searchParams.set('price_change_percentage', '1h,24h,7d');

  const coins = await requestCoinGecko<CoinGeckoMarketCoin[]>(url);
  return coins.map(mapMarketCoin);
};

const getGlobalMarketKpis = async ({ vsCurrency = 'usd' }: { vsCurrency?: string } = {}): Promise<GlobalMarketKpis> => {
  const normalizedCurrency = normalizeVsCurrency(vsCurrency);
  const url = new URL(`${env.coingecko.apiUrl}/global`);
  const response = await requestCoinGecko<CoinGeckoGlobalResponse>(url);
  const data = response.data;

  return {
    activeCryptocurrencies: data.active_cryptocurrencies,
    markets: data.markets,
    totalMarketCap: data.total_market_cap[normalizedCurrency] ?? data.total_market_cap.usd ?? 0,
    totalVolume: data.total_volume[normalizedCurrency] ?? data.total_volume.usd ?? 0,
    marketCapChangePercentage24hUsd: data.market_cap_change_percentage_24h_usd,
    dominance: Object.entries(data.market_cap_percentage)
      .map(([symbol, percentage]) => ({
        symbol,
        percentage,
      }))
      .sort((left, right) => right.percentage - left.percentage)
      .slice(0, 10),
    updatedAt: new Date(data.updated_at * 1000).toISOString(),
  };
};

const getMarketChart = async ({
  id,
  vsCurrency = 'usd',
  days = 7,
}: MarketChartQuery): Promise<CryptoMarketChart> => {
  const normalizedCurrency = normalizeVsCurrency(vsCurrency);
  const url = new URL(`${env.coingecko.apiUrl}/coins/${encodeURIComponent(id)}/market_chart`);
  url.searchParams.set('vs_currency', normalizedCurrency);
  url.searchParams.set('days', String(days));

  const chart = await requestCoinGecko<CoinGeckoMarketChartResponse>(url);
  const latestTimestamp = Math.max(
    chart.prices.at(-1)?.[0] ?? 0,
    chart.market_caps.at(-1)?.[0] ?? 0,
    chart.total_volumes.at(-1)?.[0] ?? 0,
  );

  return {
    id,
    vsCurrency: normalizedCurrency,
    days,
    prices: mapChartPoints(chart.prices),
    marketCaps: mapChartPoints(chart.market_caps),
    totalVolumes: mapChartPoints(chart.total_volumes),
    lastUpdated: latestTimestamp ? new Date(latestTimestamp).toISOString() : new Date().toISOString(),
  };
};

const getDashboardSummary = async ({
  vsCurrency = 'usd',
  limit = 10,
  includeSparkline = true,
}: DashboardQuery = {}): Promise<DashboardSummary> => {
  const [topCryptocurrencies, kpis] = await Promise.all([
    getTopCryptocurrencies({ vsCurrency, limit, includeSparkline }),
    getGlobalMarketKpis({ vsCurrency }),
  ]);

  const latestTopUpdate = topCryptocurrencies
    .map((coin) => new Date(coin.lastUpdated).getTime())
    .filter(Number.isFinite)
    .sort((left, right) => right - left)[0];

  return {
    topCryptocurrencies,
    kpis,
    charts: topCryptocurrencies.map((coin) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      sparkline7d: coin.sparkline7d,
    })),
    lastUpdated: new Date(Math.max(latestTopUpdate ?? 0, new Date(kpis.updatedAt).getTime())).toISOString(),
  };
};

export {
  getDashboardSummary,
  getGlobalMarketKpis,
  getMarketChart,
  getTopCryptocurrencies,
};
