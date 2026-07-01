import { databaseService } from './database.service';



export const workflowService = {


  getWorkflowsByUser: async (userId: string, filters?: { status?: string, take?: number, orderBy?: any }) => {
    return await databaseService.getWorkflowsByUser(userId, filters);
  },

  getWorkflowByIdAndUser: async (id: string, userId: string) => {
    const workflow = await databaseService.getWorkflowById(id);
    if (!workflow || workflow.userId !== userId) {
      return null; // or throw a specific error
    }
    return workflow;
  }
};
