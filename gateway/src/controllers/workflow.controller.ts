import { Request, Response, NextFunction } from 'express';
import { workflowService } from '../services/workflow.service';
import { databaseService } from '../services/database.service';

export const createWorkflow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkId = (req as any).auth?.userId;
    if (!clerkId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const user = await databaseService.getUserByClerkId(clerkId);
    if (!user) {
      res.status(404).json({ error: 'User not found in system' });
      return;
    }

    const data = req.body;
    const result = await workflowService.createWorkflow(data, user.id);
    
    res.status(202).json({ 
      status: 'queued', 
      message: 'Workflow task created successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const listWorkflows = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkId = (req as any).auth?.userId;
    if (!clerkId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const user = await databaseService.getUserByClerkId(clerkId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const workflows = await workflowService.getWorkflowsByUser(user.id);
    res.json(workflows);
  } catch (error) {
    next(error);
  }
};

export const getWorkflow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkId = (req as any).auth?.userId;
    if (!clerkId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;

    const user = await databaseService.getUserByClerkId(clerkId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const workflow = await workflowService.getWorkflowByIdAndUser(id as string, user.id);
    if (!workflow) {
      res.status(403).json({ error: 'Access denied or workflow not found' });
      return;
    }

    res.json(workflow);
  } catch (error) {
    next(error);
  }
};
