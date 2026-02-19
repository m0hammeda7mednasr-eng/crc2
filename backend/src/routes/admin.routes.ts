import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { verifyAdmin } from '../middleware/admin.middleware';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(verifyAdmin);

// User management
router.get('/users', AdminController.getAllUsers);
router.get('/users/:id', AdminController.getUserById);
router.delete('/users/:id', AdminController.deleteUser);

// Statistics
router.get('/stats', AdminController.getStats);

// Analytics
router.get('/analytics', AdminController.getAnalytics);

export default router;
