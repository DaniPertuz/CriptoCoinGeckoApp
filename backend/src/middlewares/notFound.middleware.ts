import type { RequestHandler } from 'express';

import AppError from '../utils/AppError';

const notFoundHandler: RequestHandler = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'ROUTE_NOT_FOUND'));
};

export {
  notFoundHandler,
};
