import 'dotenv/config';
import http from 'http';
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
    console.log(`\nEngine B picked up job: ${job.id}`);
    const { taskId, agentType, payload } = job.data;

    await updateTaskStatus(taskId, 'RUNNING');

    try {
      const handler = handlerRegistry[agentType];
      if (!handler) {
        throw new Error(`Unknown agentType: ${agentType}`);
      }

      const result = await handler(payload);

      await updateTaskStatus(taskId, 'COMPLETED', result);
      console.log(`Job ${job.id} finished successfully.`);
      
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
      console.error(`Job ${job.id} failed:`, error.message);
      throw error; 
    }
  },
  { connection: redis as any, concurrency: 5 }
);

console.log('Engine B is running. Waiting for jobs...');

// Health check server for Render
const port = process.env.PORT || 8081;
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'worker', timestamp: new Date().toISOString() }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(port, () => {
  console.log(`Worker health check listening on port ${port}`);
});

process.on('SIGTERM', async () => {
  await worker.close();
  await prisma.$disconnect();
  server.close();
  process.exit(0);
});
