import { Router } from 'express';

import * as cryptoController from '../controllers/crypto.controller';
import validate from '../middlewares/validate.middleware';
import * as cryptoValidator from '../validators/crypto.validator';

const router = Router();

router.get('/dashboard', validate(cryptoValidator.dashboardSummary), cryptoController.getDashboardSummary);
router.get('/top', validate(cryptoValidator.topCryptocurrencies), cryptoController.getTopCryptocurrencies);
router.get('/global', validate(cryptoValidator.globalMarketKpis), cryptoController.getGlobalMarketKpis);
router.get('/:id/market-chart', validate(cryptoValidator.marketChart), cryptoController.getMarketChart);

export default router;
