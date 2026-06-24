import 'dotenv/config';
import { Worker, Queue } from 'bullmq';
import Redis from 'ioredis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null
});

// This Engine listens for "workflow-started" events
const orchestrator = new Worker(
  'workflow-queue',  // Queue name for workflow orchestration
  async (job) => {
    console.log(`\n Engine A (Orchestrator) picked up: ${job.id}`);
    const { workflowId } = job.data;

    if (job.name === 'continue-workflow' || job.name === 'process-workflow') {
      await processWorkflow(job.data.workflowId);
    }
  },
  { connection: redis as any }
);

async function processWorkflow(workflowId: string) {
  try {
    // 1. Fetch the workflow and its steps
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { steps: true }
    });

    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    // 2. Find the first step that is still PENDING
    const nextStep = workflow.steps.find((step: any) => step.status === 'PENDING');

    if (!nextStep) {
      // No more steps = workflow is complete
      await prisma.workflow.update({
        where: { id: workflowId },
        data: { status: 'COMPLETED' }
      });
      console.log(` Workflow ${workflowId} completed!`);
      return { status: 'COMPLETED' };
    }

    // 3. Push this step to the task queue for Engine B (Executor)
    const taskQueue = new Queue('task-queue', { connection: redis as any });
    await taskQueue.add('execute-task', {
      taskId: nextStep.id,
      agentType: nextStep.agentType,
      payload: nextStep.payload
    });

    // 4. Mark the step as RUNNING
    await prisma.step.update({
      where: { id: nextStep.id },
      data: { status: 'RUNNING' }
    });

    console.log(` Orchestrator pushed step ${nextStep.id} to Executor.`);
    return { status: 'STEP_QUEUED', stepId: nextStep.id };

  } catch (error: any) {
    console.error(` Orchestrator failed for ${workflowId}:`, error.message);
    await prisma.workflow.update({
      where: { id: workflowId },
      data: { status: 'FAILED', error: error.message }
    });
    throw error;
  }
}

console.log(' Engine A (Orchestrator) is running. Waiting for workflows...');

// Graceful shutdown
process.on('SIGTERM', async () => {
  await orchestrator.close();
  await prisma.$disconnect();
  process.exit(0);
});
