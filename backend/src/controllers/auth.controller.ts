import AppError from '../utils/AppError';
import asyncHandler from '../utils/asyncHandler';
import { sendSuccess } from '../utils/httpResponse';
import * as authService from '../services/auth.service';

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return sendSuccess(res, result, 201);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return sendSuccess(res, result);
});

const googleLogin = asyncHandler(async (req, res) => {
  const result = await authService.loginWithGoogle(req.body);
  return sendSuccess(res, result);
});

const me = asyncHandler(async (req, res) => {
  if (!req.auth) {
    throw new AppError('Authentication context is required', 401, 'AUTH_CONTEXT_REQUIRED');
  }

  const user = await authService.getProfile(req.auth.user.id);
  return sendSuccess(res, user);
});

export {
  register,
  login,
  googleLogin,
  me,
};
