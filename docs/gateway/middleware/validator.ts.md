# `middleware/validator.ts`

## Overview
A dynamic middleware component that parses and validates incoming Express HTTP requests against any defined Zod schema. 

## Source Code & Implementation
```typescript
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
```

## Key Mechanisms
- **Zod v4 Compatibility**: Safely extracts the error `issues` array introduced in Zod v4 to format a sanitized response.
- **Flattening**: By mapping over `rawIssues`, it strips away the bloated internal Zod state tree and only returns human-readable API errors.
