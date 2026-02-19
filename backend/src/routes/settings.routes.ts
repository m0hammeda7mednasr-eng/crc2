import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', SettingsController.getSettings);
router.put('/', SettingsController.updateSettings);

export default router;
