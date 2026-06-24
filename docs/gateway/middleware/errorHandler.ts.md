# `middleware/errorHandler.ts`

## Overview
A centralized fallback catch-all for any exceptions that bypass controller-level `catch` blocks.

## Source Code & Implementation
```typescript
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
};
```

## Key Mechanisms
- Logs the error stack to `console.error` (which can be intercepted by tools like Datadog/Sentry).
- Protects application crashes by sending a unified 500 response if a generic crash occurs in the pipeline.
