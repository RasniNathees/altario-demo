import { Router } from 'express';
import dashboardRoutes from './dashboard.routes';
import registrationRoutes from './registration.routes';
import invoiceRoutes from './invoice.routes';

const router = Router();

router.use('/dashboard', dashboardRoutes);
router.use('/registrations', registrationRoutes);
router.use('/invoices', invoiceRoutes);

export default router;