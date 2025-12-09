import { Router } from 'express';
import { DashboardController } from '../controllers';
import { asyncHandler } from '../middlewares';

const router = Router();
const controller = new DashboardController();

router.get('/stats', asyncHandler(controller.getStats));

export default router;
