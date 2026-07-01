import { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import { workflowService } from '../services/workflow.service';
import { databaseService } from '../services/database.service';


export const listWorkflows = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkId = getAuth(req).userId;
    if (!clerkId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const user = await databaseService.getUserByClerkId(clerkId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { status, take, orderBy } = req.query;
    const filters: any = {};
    if (status) filters.status = status as string;
    if (take) filters.take = parseInt(take as string, 10);
    if (orderBy) {
      const [field, direction] = (orderBy as string).split(':');
      if (field && direction) {
        filters.orderBy = { [field]: direction };
      }
    }

    const workflows = await workflowService.getWorkflowsByUser(user.id, filters);
    res.json(workflows);
  } catch (error) {
    next(error);
  }
};

export const getWorkflow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkId = getAuth(req).userId;
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
