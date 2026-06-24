# `services/db.service.ts`

## Overview
The Prisma-powered data access layer for the worker. Ensures that the worker never interacts with raw SQL, maintaining schema safety.

## Source Code & Implementation
```typescript
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function updateTaskStatus(
  id: string,
  status: string,
  result?: any,
  error?: string
) {
  return prisma.task.update({
    where: { id },
    data: {
      status,
      result: result || undefined,
      error: error || undefined,
    },
  });
}
```

## Key Mechanisms
- **Singleton Client**: Initializes `PrismaClient` once and exports it, keeping the database connection pool minimal.
- **State Transitioning**: `updateTaskStatus` encapsulates the core requirement of Engine B—mutating the state of a Task inside Postgres safely. 
- **Optional Overwrites**: Allows cleanly updating `result` or `error` strings only if they exist via the `|| undefined` fallback (which instructs Prisma to ignore that field).
