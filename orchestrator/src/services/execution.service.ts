import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { resolveVariables } from './resolver.service';
import { dispatchStep } from './dispatcher.service';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export async function startWorkflow(workflowId: string) {
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    include: { nodes: true },
  });
  if (!workflow) throw new Error('Workflow not found');

  await prisma.workflow.update({
    where: { id: workflowId },
    data: { status: 'RUNNING' },
  });

  // Find steps with no dependencies (roots)
  const rootSteps = workflow.nodes.filter(
    (step) => !step.dependsOn || step.dependsOn.length === 0
  );

  for (const step of rootSteps) {
    if (step.status === 'PENDING') {
      await executeStep(workflowId, step.id);
    }
  }
}

export async function executeStep(workflowId: string, stepId: string) {
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    include: { nodes: true },
  });
  if (!workflow) throw new Error('Workflow not found');

  const stepDef = workflow.nodes.find(s => s.id === stepId);
  if (!stepDef) throw new Error('Step not found');

  const previousSteps = workflow.nodes.filter(s => s.status === 'COMPLETED');

  let resolvedInput: any = {};
  
  if (stepDef.type === 'START') {
    resolvedInput = (stepDef.config as any)?.payload || {};
    
    // For START node, complete it immediately and trigger next
    await prisma.workflowNode.update({
      where: { id: stepDef.id },
      data: { 
        status: 'COMPLETED',
        result: resolvedInput,
        completedAt: new Date()
      }
    });
    
    await checkAndTriggerNextSteps(workflowId);
    return;
  } else if (stepDef.type === 'END') {
    // For END node, mark workflow as completed
    await prisma.workflowNode.update({
      where: { id: stepDef.id },
      data: { 
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });
    
    await prisma.workflow.update({
      where: { id: workflowId },
      data: { status: 'COMPLETED' }
    });
    return;
  } else {
    // Regular AGENT node
    resolvedInput = resolveVariables((stepDef.config as any)?.payload || {}, previousSteps);

    // Update status to RUNNING
    const stepExecution = await prisma.workflowNode.update({
      where: { id: stepId },
      data: {
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    // Push to Worker
    await dispatchStep(stepExecution, resolvedInput);
  }
}

export async function checkAndTriggerNextSteps(workflowId: string) {
  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    include: { nodes: true },
  });

  if (!workflow) return;

  const allSteps = workflow.nodes;
  const completedSteps = allSteps.filter(s => s.status === 'COMPLETED');

  // Find steps whose dependencies are all completed and that are currently PENDING
  const readySteps = allSteps.filter(step =>
    step.status === 'PENDING' &&
    step.dependsOn &&
    step.dependsOn.every(depId =>
      completedSteps.some(s => s.id === depId || String(s.stepIndex) === depId)
    )
  );

  for (const step of readySteps) {
    await executeStep(workflowId, step.id);
  }

  // Check if any step failed
  const anyFailed = allSteps.some(step => step.status === 'FAILED');
  if (anyFailed) {
    if (workflow.status !== 'FAILED') {
      await prisma.workflow.update({
        where: { id: workflowId },
        data: { status: 'FAILED' },
      });
    }
    return;
  }

  // Check if all steps are done
  const allCompleted = allSteps.every(step => step.status === 'COMPLETED');

  if (allCompleted && workflow.status !== 'COMPLETED') {
    await prisma.workflow.update({
      where: { id: workflowId },
      data: { status: 'COMPLETED' },
    });
  }
}
