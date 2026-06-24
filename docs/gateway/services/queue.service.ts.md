# `services/queue.service.ts`

## Overview
This file manages the asynchronous message queue using BullMQ and Redis. It provides the interface to enqueue background jobs for the AI workers.

## Source Code & Implementation
```typescript
import { Queue } from 'bullmq';
import { redisClient } from '../utils/redis';

export const taskQueue = new Queue('task-queue', { connection: redisClient as any });

export const queueService = {
  enqueueTask: async (taskId: string, payload: any) => {
    return await taskQueue.add('process-task', { taskId, payload }, {
      jobId: taskId, // Ensure no duplicates
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
  }
};
```

## Key Mechanisms
- **Idempotency**: Passing `jobId: taskId` ensures that if the system crashes during enqueueing and retries, BullMQ will natively drop duplicates.
- **Reliability**: Uses an exponential backoff strategy for 3 `attempts` to guarantee delivery if workers temporarily go offline.
