import AppError from '../utils/AppError';
import asyncHandler from '../utils/asyncHandler';
import { verifyToken } from '../utils/jwt';
import * as userRepository from '../repositories/user.repository';
import { sanitizeUser } from '../models/user.model';
import { UserRole } from '../types/user';

const requireAuth = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new AppError('Authorization bearer token is required', 401, 'AUTH_TOKEN_REQUIRED');
  }

  const token = authorization.split(' ')[1];

  if (!token) {
    throw new AppError('Authorization bearer token is required', 401, 'AUTH_TOKEN_REQUIRED');
  }

  let payload;

  try {
    payload = verifyToken(token);
  } catch (error) {
    throw new AppError('Invalid or expired authorization token', 401, 'AUTH_TOKEN_INVALID');
  }

  const user = await userRepository.findById(payload.sub);

  if (!user) {
    throw new AppError('Authenticated user no longer exists', 401, 'AUTH_USER_NOT_FOUND');
  }

  req.auth = {
    token,
    payload,
    user: sanitizeUser(user),
  };

  next();
});

const requireRole = (...allowedRoles: UserRole[]) =>
  asyncHandler(async (req, res, next) => {
    if (!req.auth) {
      throw new AppError('Authentication is required', 401, 'AUTH_REQUIRED');
    }

    if (!allowedRoles.includes(req.auth.user.role)) {
      throw new AppError(
        'Insufficient permissions for this action',
        403,
        'INSUFFICIENT_PERMISSIONS',
        {
          allowedRoles,
          currentRole: req.auth.user.role,
        },
      );
    }

    next();
  });

const requireAdmin = requireRole(UserRole.ADMIN);

export {
  requireAdmin,
  requireAuth,
  requireRole,
};
