import 'dotenv/config';
import * as http from 'http';
import { Worker } from 'bullmq';
import Redis from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { startWorkflow, checkAndTriggerNextSteps } from './services/execution.service';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null
});

// This Engine listens for "workflow-queue" events
const orchestrator = new Worker(
  'workflow-queue',  // Queue name for workflow orchestration
  async (job) => {
    console.log(`\nEngine A (Orchestrator) picked up: ${job.name} - ${job.id}`);
    
    if (job.name === 'run-workflow' || job.name === 'process-workflow') {
      const { workflowId } = job.data;
      await startWorkflow(workflowId);
    } else if (job.name === 'continue-workflow') {
      const { workflowId } = job.data;
      await checkAndTriggerNextSteps(workflowId);
    }
  },
  { connection: redis as any }
);

console.log('Engine A (Orchestrator) is running. Waiting for workflows...');

// Health check server for Render
const port = process.env.PORT || 8080;
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'orchestrator', timestamp: new Date().toISOString() }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(port, () => {
  console.log(`Orchestrator health check listening on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await orchestrator.close();
  await prisma.$disconnect();
  server.close();
  process.exit(0);
});
