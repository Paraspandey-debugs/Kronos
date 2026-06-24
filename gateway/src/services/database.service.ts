import { prisma } from '../models';

export const databaseService = {
  createTask: async (data: { agentType: string; payload: any; priority?: string }) => {
    return await prisma.task.create({
      data: {
        agentType: data.agentType,
        payload: data.payload,
        priority: data.priority || 'normal',
        status: 'PENDING',
      },
    });
  },
  
  getTaskById: async (id: string) => {
    return await prisma.task.findUnique({
      where: { id },
    });
  }
};
