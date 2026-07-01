import { Router } from 'express';
import healthRoutes from './health.routes';
import workflowRoutes from './workflows.routes';
import flowRoutes from './flows.routes';
import agentRoutes from './agents.routes';
import { authMiddleware } from '../../middleware/clerk';

const router = Router();

router.use('/health', healthRoutes);
router.use('/workflows', authMiddleware, workflowRoutes);
router.use('/flows', authMiddleware, flowRoutes);
router.use('/agents', authMiddleware, agentRoutes);

export default router;
