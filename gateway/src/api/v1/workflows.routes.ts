import { Router } from 'express';
import { createWorkflow } from '../../controllers/workflow.controller';
import { validate } from '../../middleware/validator';
import { createWorkflowSchema } from '../../schemas/workflow.schema';

const router = Router();

router.post('/', validate(createWorkflowSchema), createWorkflow);

export default router;
