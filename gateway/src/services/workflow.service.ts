import { databaseService } from './database.service';
import { queueService } from './queue.service';
import { CreateWorkflowRequest } from '../types/workflow.types';

export const workflowService = {
  createWorkflow: async (data: CreateWorkflowRequest) => {
    // 1. Save to Database
    const workflow = await databaseService.createWorkflow(data);
    
    // 2. Enqueue for processing
    await queueService.enqueueWorkflow(workflow.id);
    
    return {
      workflowId: workflow.id,
      status: workflow.status,
      steps: workflow.steps.length
    };
  }
};
