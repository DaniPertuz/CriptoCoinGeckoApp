import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import env from '../config/env';
import AppError from '../utils/AppError';

interface ErrorResponseBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    stack?: string;
  };
}

const normalizeError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ZodError) {
    return new AppError(
      'Request validation failed',
      400,
      'VALIDATION_ERROR',
      error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    );
  }

  return new AppError('Unexpected server error', 500, 'INTERNAL_ERROR');
};

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  const normalizedError = normalizeError(error);

  if (env.nodeEnv !== 'test' && normalizedError.statusCode >= 500) {
    console.error(error);
  }

  const response: ErrorResponseBody = {
    success: false,
    error: {
      code: normalizedError.code,
      message: normalizedError.message,
    },
  };

  if (normalizedError.details) {
    response.error.details = normalizedError.details;
  }

  if (env.nodeEnv !== 'production' && error instanceof Error && error.stack) {
    response.error.stack = error.stack;
  }

  return res.status(normalizedError.statusCode).json(response);
};

export {
  errorHandler,
};
