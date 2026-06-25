import { Router } from 'express';
import { createWorkflow, listWorkflows, getWorkflow } from '../../controllers/workflow.controller';
import { validate } from '../../middleware/validator';
import { createWorkflowSchema } from '../../schemas/workflow.schema';
import { requireAuthMiddleware } from '../../middleware/clerk';

const router = Router();

router.post('/', requireAuthMiddleware, validate(createWorkflowSchema), createWorkflow);
router.get('/', requireAuthMiddleware, listWorkflows);
router.get('/:id', requireAuthMiddleware, getWorkflow);

export default router;
