import { prisma } from '../models';

export const databaseService = {
  createWorkflow: async (data: { name?: string; nodes: Array<{ type: string; agentType?: string; config: any; positionX?: number; positionY?: number }>; userId: string }) => {
    return await prisma.workflow.create({
      data: {
        userId: data.userId,
        name: data.name || "Untitled Workflow",
        status: 'PENDING',
        nodes: {
          create: data.nodes.map((node, index) => ({
            type: node.type,
            agentType: node.agentType,
            config: node.config,
            positionX: node.positionX,
            positionY: node.positionY,
            status: 'PENDING',
            stepIndex: index
          }))
        }
      },
      include: { nodes: true }
    });
  },
  
  getWorkflowById: async (id: string) => {
    return await prisma.workflow.findUnique({
      where: { id },
      include: { nodes: true }
    });
  },
  
  getWorkflowsByUser: async (userId: string, filters?: { status?: string, take?: number, orderBy?: any }) => {
    const { status, take, orderBy } = filters || {};
    return await prisma.workflow.findMany({
      where: { 
        userId,
        ...(status ? { status } : {})
      },
      include: { nodes: true },
      orderBy: orderBy || { createdAt: 'desc' },
      ...(take ? { take } : {})
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
