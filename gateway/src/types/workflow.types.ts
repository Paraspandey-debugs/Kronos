import { z } from 'zod';
import { createWorkflowSchema } from '../schemas/workflow.schema';

export type CreateWorkflowRequest = z.infer<typeof createWorkflowSchema>['body'];
