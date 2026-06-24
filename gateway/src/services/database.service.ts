import { prisma } from '../models';

export const databaseService = {
  createWorkflow: async (data: { steps: Array<{ agentType: string; payload: any }> }) => {
    return await prisma.workflow.create({
      data: {
        status: 'PENDING',
        steps: {
          create: data.steps.map((step, index) => ({
            agentType: step.agentType,
            payload: step.payload,
            status: 'PENDING',
            stepIndex: index
          }))
        }
      },
      include: { steps: true }
    });
  },
  
  getWorkflowById: async (id: string) => {
    return await prisma.workflow.findUnique({
      where: { id },
      include: { steps: true }
    });
  }
};
