import { ZodType } from 'zod';
import { Request, Response, NextFunction } from 'express';

type ValidationSchemas<TBody = any, TParams = any, TQuery = any> = {
  body?: ZodType<TBody>;
  params?: ZodType<TParams>;
  query?: ZodType<TQuery>;
};

export const validate = <TBody = any, TParams = any, TQuery = any>(
  schemas: ValidationSchemas<TBody, TParams, TQuery>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        const result = schemas.body.safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({
            message: 'Validation failed (body)',
            errors: result.error.issues.map((issue) => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          });
        }
      }

      if (schemas.params) {
        const result = schemas.params.safeParse(req.params);
        if (!result.success) {
          return res.status(400).json({
            message: 'Validation failed (params)',
            errors: result.error.issues.map((issue) => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          });
        }
      }

      if (schemas.query) {
        const result = schemas.query.safeParse(req.query);
        if (!result.success) {
          return res.status(400).json({
            message: 'Validation failed (query)',
            errors: result.error.issues.map((issue) => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          });
        }
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
