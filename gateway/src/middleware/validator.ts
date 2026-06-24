import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validate = (schema: z.ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Extract raw issues array from v4 or v3
        const rawIssues = (error as any).issues || (error as any).errors || [];
        
        // Clean and flatten the issues to prevent massive JSON payloads
        const cleanErrors = rawIssues.map((issue: any) => ({
          path: issue.path?.join('.') || 'unknown',
          message: issue.message,
          code: issue.code
        }));

        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: cleanErrors.length > 0 ? cleanErrors : 'Invalid payload',
        });
      }
      next(error);
    }
  };
};
