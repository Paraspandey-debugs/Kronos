import 'dotenv/config';
import http from 'http';
import { Worker, Queue } from 'bullmq';
import Redis from 'ioredis';
import { PrismaClient } from '@prisma/client';

function resolvePayload(payload: any, context: Record<string, any>): any {
  // Handle string references like "$step_0.field"
  if (typeof payload === 'string' && payload.startsWith('$')) {
    const path = payload.slice(1).split('.');
    let current = context;
    for (const key of path) {
      if (current === undefined || current === null) {
        throw new Error(`Unresolved template reference: {{${payload}}}`);
      }
      current = current[key];
    }
    return current;
  }
  // Recursively resolve objects
  if (typeof payload === 'object' && payload !== null) {
    if (Array.isArray(payload)) {
      return payload.map(item => resolvePayload(item, context));
    }
    const resolved: any = {};
    for (const [key, value] of Object.entries(payload)) {
      resolved[key] = resolvePayload(value, context);
    }
    return resolved;
  }
  return payload;
}

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null
});

// This Engine listens for "workflow-started" events
const orchestrator = new Worker(
  'workflow-queue',  // Queue name for workflow orchestration
  async (job) => {
    console.log(`\nEngine A (Orchestrator) picked up: ${job.id}`);
    const { workflowId } = job.data;

    if (job.name === 'continue-workflow' || job.name === 'process-workflow') {
      await processWorkflow(job.data.workflowId);
    }
  },
  { connection: redis as any }
);

async function processWorkflow(workflowId: string) {
  try {
    // 1. Fetch the workflow and its nodes
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { nodes: { orderBy: { stepIndex: 'asc' } } }
    });

    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    // 2. Find the first node that is still PENDING
    const nextNode = workflow.nodes.find((n: any) => n.status === 'PENDING');

    if (!nextNode) {
      // No more nodes = workflow is complete
      await prisma.workflow.update({
        where: { id: workflowId },
        data: { status: 'COMPLETED' }
      });
      console.log(`Workflow ${workflowId} completed!`);
      return { status: 'COMPLETED' };
    }

    // Build context from completed nodes
    const context: Record<string, any> = {};
    for (const node of workflow.nodes) {
      if (node.status === 'COMPLETED' && node.result) {
        context[`step_${node.stepIndex}`] = node.result;
      }
    }

    if (nextNode.type === 'START') {
      const payload = (nextNode.config as any)?.payload || {};
      
      await prisma.workflowNode.update({
        where: { id: nextNode.id },
        data: { 
          status: 'COMPLETED',
          result: payload 
        }
      });
      console.log(`Orchestrator processed START node ${nextNode.id}.`);
      
      const workflowQueue = new Queue('workflow-queue', { connection: redis as any });
      await workflowQueue.add('continue-workflow', { workflowId });
      
      return { status: 'CONTINUED' };
    } 
    else if (nextNode.type === 'AGENT') {
      const resolvedPayload = resolvePayload((nextNode.config as any)?.payload, context);

      const taskQueue = new Queue('task-queue', { connection: redis as any });
      await taskQueue.add('execute-task', {
        taskId: nextNode.id,
        agentType: nextNode.agentType,
        payload: resolvedPayload
      });

      await prisma.workflowNode.update({
        where: { id: nextNode.id },
        data: { status: 'RUNNING' }
      });

      console.log(`Orchestrator pushed AGENT node ${nextNode.id} to Executor.`);
      return { status: 'STEP_QUEUED', stepId: nextNode.id };
    }
    else if (nextNode.type === 'END') {
      await prisma.workflowNode.update({
        where: { id: nextNode.id },
        data: { status: 'COMPLETED' }
      });
      await prisma.workflow.update({
        where: { id: workflowId },
        data: { status: 'COMPLETED' }
      });
      console.log(`Workflow ${workflowId} reached END node and completed!`);
      return { status: 'COMPLETED' };
    }


  } catch (error: any) {
    console.error(`Orchestrator failed for ${workflowId}:`, error.message);
    await prisma.workflow.update({
      where: { id: workflowId },
      data: { status: 'FAILED', error: error.message }
    });
    throw error;
  }
}

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
