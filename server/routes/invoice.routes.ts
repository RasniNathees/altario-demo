import { Router } from 'express';
import { InvoiceController } from '../controllers';
import { asyncHandler } from '../middlewares';

const router = Router();
const controller = new InvoiceController();

router.get('/', asyncHandler(controller.getAll));
router.post('/', asyncHandler(controller.create));
router.patch('/:id', asyncHandler(controller.update));
router.delete('/:id', asyncHandler(controller.delete));

export default router;