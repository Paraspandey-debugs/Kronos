# `services/database.service.ts`

## Overview
This service acts as the data access layer for PostgreSQL using Prisma. By isolating database logic here, controllers remain clean and testable.

## Source Code & Implementation
```typescript
import { prisma } from '../models';

export const databaseService = {
  createTask: async (data: { agentType: string; payload: any; priority?: string }) => {
    return await prisma.task.create({
      data: {
        agentType: data.agentType,
        payload: data.payload,
        priority: data.priority || 'normal',
        status: 'PENDING',
      },
    });
  },
  
  getTaskById: async (id: string) => {
    return await prisma.task.findUnique({
      where: { id },
    });
  }
};
```

## Key Mechanisms
- **`createTask`**: Takes the parsed `agentType` and raw `payload` JSON, persisting it to the database with a default `PENDING` state before it gets pushed to the queue.
- **`prisma.task.create`**: Generates a UUID automatically on the database layer and stores the task.
