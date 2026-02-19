import { Router } from 'express';
import { ShopifyController } from '../controllers/shopify.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Credentials management
router.post('/credentials', authenticate, ShopifyController.saveCredentials);

// OAuth flow routes
router.get('/auth/start', authenticate, ShopifyController.startOAuth);
router.get('/auth/callback', ShopifyController.handleCallback);

// Connection management
router.get('/test-connection', authenticate, ShopifyController.testConnection);
router.post('/disconnect', authenticate, ShopifyController.disconnect);

export default router;
