import { Router } from 'express';

import { requireAuth } from '../middlewares/auth.middleware';
import authRoutes from './auth.routes';
import cryptoRoutes from './crypto.routes';
import healthRoutes from './health.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/cryptocurrencies', cryptoRoutes);
router.use('/users', requireAuth, userRoutes);

export default router;
