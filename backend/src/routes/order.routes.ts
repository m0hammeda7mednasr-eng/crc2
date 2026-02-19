import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', OrderController.listOrders);
router.get('/:id', OrderController.getOrder);
router.patch('/:id/status', OrderController.updateOrderStatus);

export default router;
