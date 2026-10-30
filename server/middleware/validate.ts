import type { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err: any) {
      if (err instanceof ZodError) {
        const issues = err.issues.map(i => ({
          field: i.path.join('.'),
          message: i.message
        }));
        res.status(400).json({
          error: 'Validation failed',
          details: issues
        });
        return;
      }
      res.status(400).json({ error: 'Malformed request payload' });
    }
  };
}
