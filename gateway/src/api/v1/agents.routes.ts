import { Router } from 'express';
import { getAgentTemplates } from '../../controllers/agent.controller';

const router = Router();

router.get('/templates', getAgentTemplates);

export default router;
