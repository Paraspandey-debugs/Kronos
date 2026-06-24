import { Request, Response, NextFunction } from 'express';
import { workflowService } from '../services/workflow.service';

export const createWorkflow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const result = await workflowService.createWorkflow(data);
    
    res.status(202).json({ 
      status: 'queued', 
      message: 'Workflow task created successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
