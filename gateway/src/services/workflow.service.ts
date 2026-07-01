import { databaseService } from './database.service';
import { queueService } from './queue.service';
import { CreateWorkflowRequest } from '../types/workflow.types';

export const workflowService = {
  createWorkflow: async (data: CreateWorkflowRequest, userId: string) => {
    // 1. Save to Database
    const workflow = await databaseService.createWorkflow({ nodes: data.nodes, name: data.name, userId });
    
    // 2. Enqueue for processing
    await queueService.enqueueWorkflow(workflow.id);
    
    return {
      workflowId: workflow.id,
      status: workflow.status,
      steps: workflow.nodes.length
    };
  },

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
