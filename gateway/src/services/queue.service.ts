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
