import { Router } from 'express';
import healthRoutes from './health.routes';
import workflowRoutes from './workflows.routes';
import { authMiddleware } from '../../middleware/clerk';

const router = Router();

router.use('/health', healthRoutes);
router.use('/workflows', authMiddleware, workflowRoutes);

export default router;
