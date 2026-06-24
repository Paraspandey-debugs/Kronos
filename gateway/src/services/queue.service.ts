import { Queue } from 'bullmq';
import { redisClient } from '../utils/redis';

export const workflowQueue = new Queue('workflow-queue', { connection: redisClient as any });

export const queueService = {
  enqueueWorkflow: async (workflowId: string) => {
    return await workflowQueue.add('process-workflow', { workflowId }, {
      jobId: workflowId, // Ensure no duplicates
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
  }
};
