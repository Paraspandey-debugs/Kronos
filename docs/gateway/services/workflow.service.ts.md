# `services/workflow.service.ts`

## Overview
This is the core orchestration service. It bridges the gap between the persistent storage layer (Prisma) and the asynchronous worker layer (BullMQ).

## Source Code & Implementation
```typescript
import { databaseService } from './database.service';
import { queueService } from './queue.service';
import { CreateWorkflowRequest } from '../types/workflow.types';

export const workflowService = {
  createWorkflow: async (data: CreateWorkflowRequest) => {
    // 1. Save to Database
    const task = await databaseService.createTask(data);
    
    // 2. Enqueue for processing
    await queueService.enqueueTask(task.id, task.payload);
    
    return {
      taskId: task.id,
      status: task.status,
    };
  }
};
```

## Flow Control
1. The service first guarantees that the incoming task is safely recorded in PostgreSQL.
2. It then immediately dispatches the payload to the Redis queue, using the database's generated ID as the correlation key.
3. Finally, it returns an acknowledgment mapping. If Redis is down, the DB entry acts as a record of failure that can be recovered later.
