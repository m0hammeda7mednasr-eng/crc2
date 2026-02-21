import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', CustomerController.createCustomer);
router.get('/', CustomerController.listCustomers);
router.get('/:id', CustomerController.getCustomer);
router.post('/:id/read', CustomerController.markAsRead);
router.delete('/:id', CustomerController.deleteCustomer);

export default router;
