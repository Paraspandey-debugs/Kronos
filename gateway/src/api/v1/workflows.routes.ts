import { Router } from 'express';
import { listWorkflows, getWorkflow } from '../../controllers/workflow.controller';
import { requireAuthMiddleware } from '../../middleware/clerk';

const router = Router();

router.get('/', requireAuthMiddleware, listWorkflows);
router.get('/:id', requireAuthMiddleware, getWorkflow);

export default router;
