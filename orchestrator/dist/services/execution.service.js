"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWorkflow = startWorkflow;
exports.executeStep = executeStep;
exports.checkAndTriggerNextSteps = checkAndTriggerNextSteps;
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const resolver_service_1 = require("./resolver.service");
const dispatcher_service_1 = require("./dispatcher.service");
const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new client_1.PrismaClient({ adapter });
async function startWorkflow(workflowId) {
    const workflow = await prisma.workflow.findUnique({
        where: { id: workflowId },
        include: { nodes: true },
    });
    if (!workflow)
        throw new Error('Workflow not found');
    await prisma.workflow.update({
        where: { id: workflowId },
        data: { status: 'RUNNING' },
    });
    // Find steps with no dependencies (roots)
    const rootSteps = workflow.nodes.filter((step) => !step.dependsOn || step.dependsOn.length === 0);
    for (const step of rootSteps) {
        if (step.status === 'PENDING') {
            await executeStep(workflowId, step.id);
        }
    }
}
async function executeStep(workflowId, stepId) {
    const workflow = await prisma.workflow.findUnique({
        where: { id: workflowId },
        include: { nodes: true },
    });
    if (!workflow)
        throw new Error('Workflow not found');
    const stepDef = workflow.nodes.find(s => s.id === stepId);
    if (!stepDef)
        throw new Error('Step not found');
    const previousSteps = workflow.nodes.filter(s => s.status === 'COMPLETED');
    let resolvedInput = {};
    if (stepDef.type === 'START') {
        resolvedInput = stepDef.config?.payload || {};
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
    }
    else if (stepDef.type === 'END') {
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
    }
    else {
        // Regular AGENT node
        resolvedInput = (0, resolver_service_1.resolveVariables)(stepDef.config?.payload || {}, previousSteps);
        // Update status to RUNNING
        const stepExecution = await prisma.workflowNode.update({
            where: { id: stepId },
            data: {
                status: 'RUNNING',
                startedAt: new Date(),
            },
        });
        // Push to Worker
        await (0, dispatcher_service_1.dispatchStep)(stepExecution, resolvedInput);
    }
}
async function checkAndTriggerNextSteps(workflowId) {
    const workflow = await prisma.workflow.findUnique({
        where: { id: workflowId },
        include: { nodes: true },
    });
    if (!workflow)
        return;
    const allSteps = workflow.nodes;
    const completedSteps = allSteps.filter(s => s.status === 'COMPLETED');
    // Find steps whose dependencies are all completed and that are currently PENDING
    const readySteps = allSteps.filter(step => step.status === 'PENDING' &&
        step.dependsOn &&
        step.dependsOn.every(depId => completedSteps.some(s => s.id === depId || String(s.stepIndex) === depId)));
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
