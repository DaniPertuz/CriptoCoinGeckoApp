import { z } from 'zod';

const booleanLike = z
  .union([z.boolean(), z.enum(['true', 'false'])])
  .default(true)
  .transform((value) => value === true || value === 'true');

const vsCurrency = z.string().trim().min(2).max(12).default('usd');
const limit = z.coerce.number().int().min(1).max(50).default(10);
const days = z.union([z.coerce.number().int().min(1).max(365), z.literal('max')]).default(7);

const topCryptocurrencies = {
  query: z.object({
    vsCurrency,
    limit,
    includeSparkline: booleanLike,
  }),
};

const globalMarketKpis = {
  query: z.object({
    vsCurrency,
  }),
};

const marketChart = {
  params: z.object({
    id: z.string().trim().min(1).max(80),
  }),
  query: z.object({
    vsCurrency,
    days,
  }),
};

const dashboardSummary = {
  query: z.object({
    vsCurrency,
    limit,
    includeSparkline: booleanLike,
  }),
};

export {
  dashboardSummary,
  globalMarketKpis,
  marketChart,
  topCryptocurrencies,
};
