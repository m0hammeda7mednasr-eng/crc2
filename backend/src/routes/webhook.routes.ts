import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller';
import { webhookLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

router.use(webhookLimiter);

// User-specific incoming webhook (from n8n)
router.post('/incoming/:userId', WebhookController.handleIncomingMessage);

// Shopify webhooks
router.post('/shopify/orders', WebhookController.handleShopifyOrder);
router.get('/shopify/url', WebhookController.getShopifyWebhookUrl);

// Legacy routes (for backward compatibility)
router.post('/whatsapp/incoming', WebhookController.handleIncomingMessage);
router.post('/whatsapp/button', WebhookController.handleButtonResponse);

export default router;
