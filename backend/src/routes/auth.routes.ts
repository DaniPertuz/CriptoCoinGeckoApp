import { Router } from 'express';

import * as authController from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import validate from '../middlewares/validate.middleware';
import * as authValidator from '../validators/auth.validator';

const router = Router();

router.post('/register', validate(authValidator.register), authController.register);
router.post('/login', validate(authValidator.login), authController.login);
router.post('/google', validate(authValidator.googleLogin), authController.googleLogin);
router.get('/me', requireAuth, authController.me);

export default router;
