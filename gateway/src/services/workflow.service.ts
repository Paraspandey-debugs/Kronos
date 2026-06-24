import { databaseService } from './database.service';
import { queueService } from './queue.service';
import { CreateWorkflowRequest } from '../types/workflow.types';

export const workflowService = {
  createWorkflow: async (data: CreateWorkflowRequest) => {
    // 1. Save to Database
    const task = await databaseService.createTask(data);
    
    // 2. Enqueue for processing
    await queueService.enqueueTask(task.id, task.payload);
    
    return {
      taskId: task.id,
      status: task.status,
    };
  }
};
