import { Router } from 'express';
import {
  createFlow,
  listFlows,
  getFlow,
  updateFlow,
  deleteFlow,
  runFlow
} from '../../controllers/flow.controller';

const router = Router();

router.post('/', createFlow);
router.get('/', listFlows);
router.get('/:id', getFlow);
router.put('/:id', updateFlow);
router.delete('/:id', deleteFlow);
router.post('/:id/run', runFlow);

export default router;
