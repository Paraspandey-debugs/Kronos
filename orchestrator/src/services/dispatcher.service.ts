import { Queue } from 'bullmq';
import { WorkflowNode } from '@prisma/client';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null
});

// The queue where we send tasks to the worker (Engine B)
const taskQueue = new Queue('task-queue', { connection: redis as any });

export async function dispatchStep(step: WorkflowNode, resolvedInput: any) {
  await taskQueue.add('execute-task', {
    taskId: step.id,
    agentType: step.agentType || 'unknown',
    payload: resolvedInput,
  });
}
