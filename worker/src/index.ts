import 'dotenv/config';
import { Worker, Queue } from 'bullmq';
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
      
      const step = await prisma.step.findUnique({
        where: { id: taskId },
        select: { workflowId: true }
      });
      
      if (step?.workflowId) {
        const workflowQueue = new Queue('workflow-queue', { connection: redis as any });
        await workflowQueue.add('continue-workflow', {
          workflowId: step.workflowId
        });
      }
      
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
