export interface CoinGeckoMarketCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_1h_in_currency?: number | null;
  price_change_percentage_24h: number | null;
  price_change_percentage_24h_in_currency?: number | null;
  price_change_percentage_7d_in_currency?: number | null;
  last_updated: string;
  sparkline_in_7d?: {
    price: number[];
  };
}

export interface CryptoMarketCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  marketCap: number;
  marketCapRank: number;
  totalVolume: number;
  priceChangePercentage1h: number | null;
  priceChangePercentage24h: number | null;
  priceChangePercentage7d: number | null;
  sparkline7d: number[];
  lastUpdated: string;
}

export interface TopCryptocurrenciesQuery {
  vsCurrency?: string;
  limit?: number;
  includeSparkline?: boolean;
}

export interface CoinGeckoGlobalResponse {
  data: {
    active_cryptocurrencies: number;
    markets: number;
    total_market_cap: Record<string, number>;
    total_volume: Record<string, number>;
    market_cap_percentage: Record<string, number>;
    market_cap_change_percentage_24h_usd: number;
    updated_at: number;
  };
}

export interface GlobalMarketKpis {
  activeCryptocurrencies: number;
  markets: number;
  totalMarketCap: number;
  totalVolume: number;
  marketCapChangePercentage24hUsd: number;
  dominance: Array<{
    symbol: string;
    percentage: number;
  }>;
  updatedAt: string;
}

export interface MarketChartPoint {
  timestamp: number;
  value: number;
}

export interface CoinGeckoMarketChartResponse {
  prices: Array<[number, number]>;
  market_caps: Array<[number, number]>;
  total_volumes: Array<[number, number]>;
}

export interface CryptoMarketChart {
  id: string;
  vsCurrency: string;
  days: number | string;
  prices: MarketChartPoint[];
  marketCaps: MarketChartPoint[];
  totalVolumes: MarketChartPoint[];
  lastUpdated: string;
}

export interface MarketChartQuery {
  id: string;
  vsCurrency?: string;
  days?: number | string;
}

export type DashboardQuery = TopCryptocurrenciesQuery;

export interface DashboardSummary {
  topCryptocurrencies: CryptoMarketCoin[];
  kpis: GlobalMarketKpis;
  charts: Array<{
    id: string;
    symbol: string;
    name: string;
    sparkline7d: number[];
  }>;
  lastUpdated: string;
}
