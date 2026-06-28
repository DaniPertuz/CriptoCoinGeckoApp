import type { Response } from 'express';

const sendSuccess = <TData, TMeta = unknown>(
  res: Response,
  data: TData,
  statusCode = 200,
  meta?: TMeta,
) => {
  const body = {
    success: true,
    data,
  } as {
    success: true;
    data: TData;
    meta?: TMeta;
  };

  if (meta) {
    body.meta = meta;
  }

  return res.status(statusCode).json(body);
};

export {
  sendSuccess,
};
