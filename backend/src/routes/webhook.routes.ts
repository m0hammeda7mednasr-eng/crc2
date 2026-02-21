import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller';
import { webhookLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

router.use(webhookLimiter);

// User-specific incoming webhook (supports both webhook token and userId)
// Recommended: /incoming/whk_xxxxxxxxxxxxxxxx (unique token per user)
// Legacy: /incoming/{userId} (still supported)
router.post('/incoming/:userId', WebhookController.handleIncomingMessage);

// Shopify webhooks
router.post('/shopify/orders', WebhookController.handleShopifyOrder);
router.get('/shopify/url', WebhookController.getShopifyWebhookUrl);

// Legacy routes (for backward compatibility)
router.post('/whatsapp/incoming', WebhookController.handleIncomingMessage);
router.post('/whatsapp/button', WebhookController.handleButtonResponse);

export default router;
