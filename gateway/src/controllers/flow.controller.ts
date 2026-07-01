import { Request, Response, NextFunction } from 'express';
import { flowService } from '../services/flow.service';
import { databaseService } from '../services/database.service';

export const createFlow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkId = (req as any).auth?.userId;
    if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await databaseService.getUserByClerkId(clerkId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const flow = await flowService.createFlow(req.body, user.id);
    res.status(201).json(flow);
  } catch (error) { next(error); }
};

export const listFlows = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkId = (req as any).auth?.userId;
    if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await databaseService.getUserByClerkId(clerkId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const flows = await flowService.listFlows(user.id);
    res.json(flows);
  } catch (error) { next(error); }
};

export const getFlow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkId = (req as any).auth?.userId;
    if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await databaseService.getUserByClerkId(clerkId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const flow = await flowService.getFlow(req.params.id, user.id);
    if (!flow) return res.status(404).json({ error: 'Flow not found' });
    res.json(flow);
  } catch (error) { next(error); }
};

export const updateFlow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkId = (req as any).auth?.userId;
    if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await databaseService.getUserByClerkId(clerkId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const flow = await flowService.updateFlow(req.params.id, req.body, user.id);
    res.json(flow);
  } catch (error) { next(error); }
};

export const deleteFlow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkId = (req as any).auth?.userId;
    if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await databaseService.getUserByClerkId(clerkId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await flowService.deleteFlow(req.params.id, user.id);
    res.status(204).send();
  } catch (error) { next(error); }
};

export const runFlow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkId = (req as any).auth?.userId;
    if (!clerkId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await databaseService.getUserByClerkId(clerkId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const workflow = await flowService.runFlow(req.params.id, user.id);
    res.status(202).json({ workflowId: workflow.id, status: workflow.status, message: 'Flow queued for execution' });
  } catch (error) { next(error); }
};
