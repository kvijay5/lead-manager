import { RequestHandler } from 'express';
import { ZodTypeAny } from 'zod';

export interface ValidationTargets {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

export const validate = (schemas: ValidationTargets): RequestHandler => {
  return (req, _res, next) => {
    try {
      if (schemas.params) {
        const parsedParams = schemas.params.parse(req.params);
        req.params = parsedParams as Record<string, string>;
      }
      if (schemas.query) {
        const parsedQuery = schemas.query.parse(req.query);
        Object.defineProperty(req, 'query', {
          value: parsedQuery,
          writable: true,
          configurable: true,
          enumerable: true,
        });
      }
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
