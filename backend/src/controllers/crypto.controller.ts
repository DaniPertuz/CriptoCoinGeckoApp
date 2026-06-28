import asyncHandler from '../utils/asyncHandler';
import { sendSuccess } from '../utils/httpResponse';
import * as cryptoService from '../services/crypto.service';

const getDashboardSummary = asyncHandler(async (req, res) => {
  const dashboard = await cryptoService.getDashboardSummary(req.query);
  return sendSuccess(res, dashboard);
});

const getTopCryptocurrencies = asyncHandler(async (req, res) => {
  const coins = await cryptoService.getTopCryptocurrencies(req.query);
  return sendSuccess(res, coins, 200, { count: coins.length });
});

const getGlobalMarketKpis = asyncHandler(async (req, res) => {
  const kpis = await cryptoService.getGlobalMarketKpis(req.query);
  return sendSuccess(res, kpis);
});

const getMarketChart = asyncHandler(async (req, res) => {
  const chart = await cryptoService.getMarketChart({
    id: req.params.id,
    ...req.query,
  });

  return sendSuccess(res, chart);
});

export {
  getDashboardSummary,
  getGlobalMarketKpis,
  getMarketChart,
  getTopCryptocurrencies,
};
