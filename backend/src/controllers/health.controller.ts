import asyncHandler from '../utils/asyncHandler';
import { sendSuccess } from '../utils/httpResponse';

const check = asyncHandler(async (req, res) => {
  return sendSuccess(res, {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export {
  check,
};
