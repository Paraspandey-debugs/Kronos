import { z } from 'zod';

export const createWorkflowSchema = z.object({
  body: z.object({
    agentType: z.string().min(1, 'Agent type is required'),
    payload: z.record(z.string(), z.any()),
    priority: z.enum(['low', 'normal', 'high']).optional(),
  }),
});
