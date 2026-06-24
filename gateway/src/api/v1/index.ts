import { Router } from 'express';
import healthRoutes from './health.routes';
import workflowRoutes from './workflows.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/workflows', workflowRoutes);

export default router;
