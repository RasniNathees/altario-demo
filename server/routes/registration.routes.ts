import { Router } from 'express';
import { RegistrationController } from '../controllers';
import { asyncHandler } from '../middlewares';

const router = Router();
const controller = new RegistrationController();

router.get('/', asyncHandler(controller.getAll));
router.get('/all', asyncHandler(controller.getAllSimple));
router.post('/', asyncHandler(controller.create));
router.patch('/:id/status', asyncHandler(controller.updateStatus));
router.delete('/:id', asyncHandler(controller.delete));

export default router;  