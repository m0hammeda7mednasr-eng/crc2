import { Request, Response } from 'express';
import { SettingsService } from '../services/settings.service';
import { extractAccountId } from '../middleware/auth.middleware';
import { UpdateSettingsRequest } from '../types';

export class SettingsController {
  /**
   * Get user settings
   * GET /api/settings
   */
  static async getSettings(req: Request, res: Response) {
    try {
      const userId = extractAccountId(req);

      const settings = await SettingsService.getSettingsByAccount(userId);

      res.status(200).json({ settings });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch settings',
        code: 'SERVER_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Update user settings
   * PUT /api/settings
   */
  static async updateSettings(req: Request, res: Response) {
    try {
      const userId = extractAccountId(req);
      const { n8nWebhookUrl }: UpdateSettingsRequest = req.body;

      console.log('Update settings request:', { userId, n8nWebhookUrl });

      // Validate webhook URL if provided
      if (n8nWebhookUrl && !SettingsService.validateWebhookUrl(n8nWebhookUrl)) {
        console.log('Invalid webhook URL:', n8nWebhookUrl);
        return res.status(400).json({
          error: 'Invalid webhook URL format',
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
      }

      const settings = await SettingsService.updateSettings(userId, {
        n8nWebhookUrl,
      });

      console.log('Settings updated successfully:', settings);

      res.status(200).json({
        message: 'Settings updated successfully',
        settings,
      });
    } catch (error: any) {
      console.error('Settings update error:', error);
      res.status(500).json({
        error: 'Failed to update settings',
        code: 'SERVER_ERROR',
        timestamp: new Date().toISOString(),
        details: error.message,
      });
    }
  }
}
