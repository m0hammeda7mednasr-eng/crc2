import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', SettingsController.getSettings);
router.put('/', SettingsController.updateSettings);
router.get('/webhook-token', SettingsController.getWebhookToken);
router.post('/webhook-token/regenerate', SettingsController.regenerateWebhookToken);

export default router;
