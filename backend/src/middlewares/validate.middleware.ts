import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';

type RequestSchemas = {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
};

const validate = (schemas: RequestSchemas): RequestHandler => async (req, res, next) => {
  try {
    if (schemas.body) {
      req.body = await schemas.body.parseAsync(req.body);
    }

    if (schemas.params) {
      req.params = await schemas.params.parseAsync(req.params);
    }

    if (schemas.query) {
      req.query = await schemas.query.parseAsync(req.query);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default validate;
