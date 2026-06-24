# `index.ts` (Engine B)

## Overview
This file serves as the core entry point for Engine B (the background worker service). It is a standalone Node.js process dedicated exclusively to pulling tasks from the message queue, routing them to the correct agent handler, and syncing state back to the database.

## Source Code & Implementation
```typescript
import 'dotenv/config';
import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { prisma, updateTaskStatus } from './services/db.service';
import { handlerRegistry } from './handlers/registry';

const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null
});

const worker = new Worker(
  'task-queue',
  async (job) => {
    console.log(`\n Engine B picked up job: ${job.id}`);
    const { taskId, agentType, payload } = job.data;

    await updateTaskStatus(taskId, 'RUNNING');

    try {
      const handler = handlerRegistry[agentType];
      if (!handler) {
        throw new Error(`Unknown agentType: ${agentType}`);
      }

      const result = await handler(payload);

      await updateTaskStatus(taskId, 'COMPLETED', result);
      console.log(` Job ${job.id} finished successfully.`);
      return result;
    } catch (error: any) {
      await updateTaskStatus(taskId, 'FAILED', null, error.message);
      console.error(` Job ${job.id} failed:`, error.message);
      throw error; 
    }
  },
  { connection: redis as any, concurrency: 5 }
);

console.log(' Engine B is running. Waiting for jobs...');

process.on('SIGTERM', async () => {
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});
```

## Key Mechanisms
- **`Worker` Execution Context**: Instantiates a BullMQ `Worker` instance bound to `task-queue`. It operates completely async.
- **`maxRetriesPerRequest: null`**: An explicit requirement from the `ioredis` layer when feeding `bullmq`, allowing it to handle network jitters gracefully instead of failing violently.
- **Database Synchronization Pipeline**: For every job, it performs strict transitions (`PENDING` -> `RUNNING` -> `COMPLETED` / `FAILED`), ensuring the external gateway can always poll Postgres to find exactly what state a background process is currently in.
