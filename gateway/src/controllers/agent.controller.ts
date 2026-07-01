import { Request, Response, NextFunction } from 'express';
import { prisma } from '../models';

export const getAgentTemplates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const templates = await prisma.agentTemplate.findMany();
    res.json(templates);
  } catch (error) {
    next(error);
  }
};
