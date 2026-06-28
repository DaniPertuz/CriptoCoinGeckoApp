import { Router } from 'express';

import * as userController from '../controllers/user.controller';
import { requireAdmin } from '../middlewares/auth.middleware';
import validate from '../middlewares/validate.middleware';
import * as userValidator from '../validators/user.validator';

const router = Router();

router.get('/', validate(userValidator.listUsers), userController.listUsers);
router.post('/', requireAdmin, validate(userValidator.createUser), userController.createUser);
router.get('/:id', validate(userValidator.idParam), userController.getUserById);
router.patch('/:id', requireAdmin, validate(userValidator.updateUser), userController.updateUser);
router.delete('/:id', requireAdmin, validate(userValidator.idParam), userController.deleteUser);

export default router;
