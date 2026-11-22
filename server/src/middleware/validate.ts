import { RequestHandler } from 'express';
import { AnyZodObject, ZodEffects } from 'zod';

export interface ValidationTargets {
  body?: AnyZodObject | ZodEffects<any>;
  query?: AnyZodObject | ZodEffects<any>;
  params?: AnyZodObject | ZodEffects<any>;
}

export const validate = (schemas: ValidationTargets): RequestHandler => {
  return (req, _res, next) => {
    try {
      if (schemas.params) {
        const parsedParams = schemas.params.parse(req.params);
        req.params = parsedParams;
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
