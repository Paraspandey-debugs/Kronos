import { prisma } from '../models';

export const databaseService = {
  createWorkflow: async (data: { steps: Array<{ agentType: string; payload: any }>; userId: string }) => {
    return await prisma.workflow.create({
      data: {
        userId: data.userId,
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
  },
  
  getWorkflowsByUser: async (userId: string) => {
    return await prisma.workflow.findMany({
      where: { userId },
      include: { steps: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  getUserByClerkId: async (clerkId: string) => {
    return await prisma.user.findUnique({ where: { clerkId } });
  },

  upsertUser: async (data: { clerkId: string; email?: string }) => {
    return await prisma.user.upsert({
      where: { clerkId: data.clerkId },
      update: { email: data.email },
      create: { clerkId: data.clerkId, email: data.email },
    });
  },

  deleteUser: async (clerkId: string) => {
    return await prisma.user.delete({ where: { clerkId } });
  }
};
