import { z } from 'zod';

export const createWorkflowSchema = z.object({
  body: z.object({
    steps: z.array(z.object({
      agentType: z.string().min(1, 'Agent type is required'),
      payload: z.record(z.string(), z.any()),
    })).min(1, 'At least one step is required'),
  }),
});
