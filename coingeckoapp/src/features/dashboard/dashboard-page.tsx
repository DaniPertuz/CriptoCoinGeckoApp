import { useQuery } from '@tanstack/react-query';
import { Activity, BarChart3, Coins, RefreshCw, Store, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/state';
import { api } from '../../lib/api';
import {
  formatCompactCurrency,
  formatCurrency,
  formatDateTime,
  formatPercent,
  percentageClass,
} from '../../lib/formatters';
import type { CryptoMarketCoin, MarketChartPoint } from '../../lib/types';
import { useTheme } from '../theme/use-theme';

type ChartColors = {
  border: string;
  grid: string;
  muted: string;
  primary: string;
  text: string;
  tooltipBackground: string;
  tooltipBorder: string;
};

const chartColorsByTheme: Record<'light' | 'dark', ChartColors> = {
  light: {
    border: '#cbd5e1',
    grid: '#e2e8f0',
    muted: '#64748b',
    primary: '#0f172a',
    text: '#0f172a',
    tooltipBackground: '#ffffff',
    tooltipBorder: '#e2e8f0',
  },
  dark: {
    border: '#475569',
    grid: '#334155',
    muted: '#cbd5e1',
    primary: '#f8fafc',
    text: '#f8fafc',
    tooltipBackground: '#0f172a',
    tooltipBorder: '#334155',
  },
};

function useChartColors() {
  const { theme } = useTheme();

  return chartColorsByTheme[theme];
}

function tooltipStyles(colors: ChartColors) {
  return {
    contentStyle: {
      backgroundColor: colors.tooltipBackground,
      border: `1px solid ${colors.tooltipBorder}`,
      borderRadius: '8px',
      color: colors.text,
    },
    itemStyle: {
      color: colors.text,
    },
    labelStyle: {
      color: colors.text,
    },
  };
}

function sparklineData(values: number[]) {
  return values.map((value, index) => ({
    index,
    value,
  }));
}

function chartPointData(points: MarketChartPoint[]) {
  return points.map((point) => ({
    time: new Date(point.timestamp).toLocaleDateString('es-CO', {
      month: 'short',
      day: 'numeric',
    }),
    value: point.value,
  }));
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const updateMatches = () => setMatches(mediaQuery.matches);

    updateMatches();
    mediaQuery.addEventListener('change', updateMatches);

    return () => mediaQuery.removeEventListener('change', updateMatches);
  }, [query]);

  return matches;
}

function KpiCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">{value}</p>
          {helper ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helper}</p> : null}
        </div>
        <div className="rounded-md bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function DominanceChart({ data }: { data: Array<{ symbol: string; percentage: number; }>; }) {
  const colors = useChartColors();
  const tooltip = tooltipStyles(colors);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dominancia de mercado</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer height="100%" minHeight={1} minWidth={1} width="100%">
            <BarChart data={data.slice(0, 8)} layout="vertical" margin={{ left: 10, right: 16 }}>
              <CartesianGrid horizontal={false} stroke={colors.grid} />
              <XAxis
                axisLine={{ stroke: colors.border }}
                dataKey="percentage"
                tick={{ fill: colors.muted }}
                tickFormatter={(value) => `${value.toFixed(0)}%`}
                tickLine={{ stroke: colors.border }}
                type="number"
              />
              <YAxis
                axisLine={{ stroke: colors.border }}
                dataKey="symbol"
                tick={{ fill: colors.muted }}
                tickLine={{ stroke: colors.border }}
                type="category"
                width={46}
              />
              <Tooltip
                contentStyle={tooltip.contentStyle}
                formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Dominancia']}
                itemStyle={tooltip.itemStyle}
                labelStyle={tooltip.labelStyle}
              />
              <Bar dataKey="percentage" fill={colors.primary} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function Sparkline({ values, positive }: { values: number[]; positive: boolean; }) {
  const { theme } = useTheme();
  const data = sparklineData(values);
  const stroke = positive ? (theme === 'dark' ? '#34d399' : '#059669') : (theme === 'dark' ? '#fb7185' : '#e11d48');

  if (!data.length) {
    return <span className="text-xs text-slate-400 dark:text-slate-500">Sin datos</span>;
  }

  return (
    <div className="h-12 w-36">
      <ResponsiveContainer height="100%" minHeight={1} minWidth={1} width="100%">
        <LineChart data={data}>
          <Line
            dataKey="value"
            dot={false}
            isAnimationActive={false}
            stroke={stroke}
            strokeWidth={2}
            type="monotone"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function CryptoTable({
  coins,
  onSelectCoin,
}: {
  coins: CryptoMarketCoin[];
  onSelectCoin: (coin: CryptoMarketCoin) => void;
}) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  return (
    <Card className="min-w-0">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Top 10 por capitalización</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {!isDesktop ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {coins.map((coin) => (
              <div className="space-y-4 p-4" key={coin.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="w-7 shrink-0 text-sm font-medium text-slate-500 dark:text-slate-400">
                      #{coin.marketCapRank}
                    </span>
                    <img alt="" className="h-9 w-9 shrink-0 rounded-full" src={coin.image} />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-950 dark:text-slate-50">{coin.name}</p>
                      <p className="text-xs uppercase text-slate-500 dark:text-slate-400">{coin.symbol}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">
                      {formatCurrency(coin.currentPrice)}
                    </p>
                    <p className={`mt-1 text-xs ${percentageClass(coin.priceChangePercentage24h)}`}>
                      {formatPercent(coin.priceChangePercentage24h)} 24h
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Market cap</p>
                    <p className="mt-1 font-medium">{formatCompactCurrency(coin.marketCap)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Volumen</p>
                    <p className="mt-1 font-medium">{formatCompactCurrency(coin.totalVolume)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">1h</p>
                    <p className={`mt-1 font-medium ${percentageClass(coin.priceChangePercentage1h)}`}>
                      {formatPercent(coin.priceChangePercentage1h)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">7d</p>
                    <p className={`mt-1 font-medium ${percentageClass(coin.priceChangePercentage7d)}`}>
                      {formatPercent(coin.priceChangePercentage7d)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="shrink-0">
                    <Sparkline
                      positive={(coin.priceChangePercentage7d ?? coin.priceChangePercentage24h ?? 0) >= 0}
                      values={coin.sparkline7d}
                    />
                  </div>
                  <Button
                    className="shrink-0 whitespace-nowrap hover:cursor-pointer"
                    onClick={() => onSelectCoin(coin)}
                    variant="secondary"
                  >
                    Ver gráfica
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
        <div className="h-96 overflow-x-auto overflow-y-auto">
          <table className="w-full min-w-230 text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Activo</th>
                {["Precio", "1h", "24h", "7d", "market cap", "Volumen"].map((label) => (
                  <th key={label} className="px-5 py-3 text-right whitespace-nowrap">{label}</th>
                ))}
                <th className="px-5 py-3">7d</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {coins.map((coin) => (
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/60" key={coin.id}>
                  <td className="px-5 py-4 font-medium text-slate-500 dark:text-slate-400">{coin.marketCapRank}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img alt="" className="h-8 w-8 rounded-full" src={coin.image} />
                      <div>
                        <p className="font-medium text-slate-950 dark:text-slate-50">{coin.name}</p>
                        <p className="text-xs uppercase text-slate-500 dark:text-slate-400">{coin.symbol}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right font-medium">{formatCurrency(coin.currentPrice)}</td>
                  <td className={`px-5 py-4 text-right ${percentageClass(coin.priceChangePercentage1h)}`}>
                    {formatPercent(coin.priceChangePercentage1h)}
                  </td>
                  <td className={`px-5 py-4 text-right ${percentageClass(coin.priceChangePercentage24h)}`}>
                    {formatPercent(coin.priceChangePercentage24h)}
                  </td>
                  <td className={`px-5 py-4 text-right ${percentageClass(coin.priceChangePercentage7d)}`}>
                    {formatPercent(coin.priceChangePercentage7d)}
                  </td>
                  <td className="px-5 py-4 text-right">{formatCompactCurrency(coin.marketCap)}</td>
                  <td className="px-5 py-4 text-right">{formatCompactCurrency(coin.totalVolume)}</td>
                  <td className="px-5 py-4">
                    <Sparkline
                      positive={(coin.priceChangePercentage7d ?? coin.priceChangePercentage24h ?? 0) >= 0}
                      values={coin.sparkline7d}
                    />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button onClick={() => onSelectCoin(coin)} variant="secondary" className="whitespace-nowrap hover:cursor-pointer">
                      Ver gráfica
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </CardContent>
    </Card>
  );
}

function CoinDetailChart({ coin }: { coin: CryptoMarketCoin | null; }) {
  const colors = useChartColors();
  const tooltip = tooltipStyles(colors);
  const gradientId = colors.primary === '#f8fafc' ? 'priceGradientDark' : 'priceGradientLight';
  const { data, error, isFetching } = useQuery({
    enabled: Boolean(coin),
    queryFn: () => api.marketChart(coin!.id, 7),
    queryKey: ['market-chart', coin?.id],
    retry: false,
    staleTime: 5 * 60_000,
  });

  if (!coin) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Gráfica detallada: {coin.name}</CardTitle>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Precio, market cap y volumen de los últimos 7 días.</p>
        </div>
        {isFetching ? <RefreshCw className="h-4 w-4 animate-spin text-slate-400 dark:text-slate-500" /> : null}
      </CardHeader>
      <CardContent>
        {error ? (
          <ErrorState message="No se pudo cargar la gráfica de mercado." />
        ) : !data ? (
          <LoadingState label="Cargando gráfica" />
        ) : (
          <div className="grid gap-6 xl:grid-cols-3">
            <div className="h-72 xl:col-span-2">
              <ResponsiveContainer height="100%" minHeight={1} minWidth={1} width="100%">
                <AreaChart data={chartPointData(data.prices)}>
                  <defs>
                    <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor={colors.primary} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" />
                  <XAxis
                    axisLine={{ stroke: colors.border }}
                    dataKey="time"
                    minTickGap={24}
                    tick={{ fill: colors.muted }}
                    tickLine={{ stroke: colors.border }}
                  />
                  <YAxis
                    axisLine={{ stroke: colors.border }}
                    tick={{ fill: colors.muted }}
                    tickFormatter={(value) => formatCompactCurrency(Number(value))}
                    tickLine={{ stroke: colors.border }}
                    width={86}
                  />
                  <Tooltip
                    contentStyle={tooltip.contentStyle}
                    formatter={(value) => [formatCurrency(Number(value)), 'Precio']}
                    itemStyle={tooltip.itemStyle}
                    labelStyle={tooltip.labelStyle}
                  />
                  <Area dataKey="value" fill={`url(#${gradientId})`} stroke={colors.primary} strokeWidth={2} type="monotone" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="grid gap-4">
              <MiniSeries title="Market cap" values={data.marketCaps} />
              <MiniSeries title="Volumen" values={data.totalVolumes} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MiniSeries({ title, values }: { title: string; values: MarketChartPoint[]; }) {
  const colors = useChartColors();
  const tooltip = tooltipStyles(colors);

  return (
    <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
      <p className="mb-3 text-sm font-medium text-slate-600 dark:text-slate-300">{title}</p>
      <div className="h-24">
        <ResponsiveContainer height="100%" minHeight={1} minWidth={1} width="100%">
          <LineChart data={chartPointData(values)}>
            <Tooltip
              contentStyle={tooltip.contentStyle}
              formatter={(value) => [formatCompactCurrency(Number(value)), title]}
              itemStyle={tooltip.itemStyle}
              labelStyle={tooltip.labelStyle}
            />
            <Line dataKey="value" dot={false} stroke={colors.muted} strokeWidth={2} type="monotone" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [selectedCoin, setSelectedCoin] = useState<CryptoMarketCoin | null>(null);
  const { data, error, isFetching, refetch } = useQuery({
    queryFn: api.dashboard,
    queryKey: ['dashboard'],
  });

  if (error) {
    return <ErrorState message="Revisa que el backend esté corriendo y que tu sesión siga activa." onRetry={() => refetch()} />;
  }

  if (!data) {
    return <LoadingState label="Cargando dashboard cripto" />;
  }

  if (!data.topCryptocurrencies.length) {
    return (
      <EmptyState
        action={<Button onClick={() => refetch()}>Reintentar</Button>}
        description="El backend respondió correctamente, pero no devolvió activos para mostrar."
        title="Sin criptomonedas disponibles"
      />
    );
  }

  const kpis = data.kpis;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Dashboard privado</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">Mercado cripto</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Última actualización: {formatDateTime(data.lastUpdated)}</p>
        </div>
        <Button disabled={isFetching} onClick={() => refetch()} variant="secondary" className='hover:cursor-pointer'>
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard icon={Coins} label="Market cap total" value={formatCompactCurrency(kpis.totalMarketCap)} />
        <KpiCard icon={BarChart3} label="Volumen total" value={formatCompactCurrency(kpis.totalVolume)} />
        <KpiCard icon={Activity} label="Criptomonedas activas" value={kpis.activeCryptocurrencies.toLocaleString()} />
        <KpiCard icon={Store} label="Markets" value={kpis.markets.toLocaleString()} />
        <KpiCard
          helper="Cambio global en USD"
          icon={TrendingUp}
          label="Cambio 24h"
          value={formatPercent(kpis.marketCapChangePercentage24hUsd)}
        />
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-2">
        <CryptoTable coins={data.topCryptocurrencies} onSelectCoin={setSelectedCoin} />
        <DominanceChart data={kpis.dominance} />
      </div>

      <CoinDetailChart coin={selectedCoin} />
    </div>
  );
}
