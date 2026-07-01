import { z } from 'zod';

export const createWorkflowSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    nodes: z.array(z.object({
      type: z.string(),
      agentType: z.string().optional(),
      config: z.record(z.string(), z.any()),
      positionX: z.number().optional(),
      positionY: z.number().optional()
    })).min(1, 'At least one node is required'),
  }),
});
