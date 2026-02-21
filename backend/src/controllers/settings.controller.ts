import { Request, Response } from 'express';
import { SettingsService } from '../services/settings.service';
import { extractAccountId } from '../middleware/auth.middleware';
import { UpdateSettingsRequest } from '../types';
import { generateWebhookToken } from '../utils/webhook-token';
import prisma from '../utils/prisma';

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

  /**
   * Get or generate webhook token for user
   * GET /api/settings/webhook-token
   */
  static async getWebhookToken(req: Request, res: Response) {
    try {
      const userId = extractAccountId(req);

      // Get user
      let user = await prisma.user.findUnique({
        where: { id: userId },
        select: { webhookToken: true },
      });

      // Generate token if doesn't exist
      if (!user?.webhookToken) {
        const newToken = generateWebhookToken();
        
        user = await prisma.user.update({
          where: { id: userId },
          data: { webhookToken: newToken },
          select: { webhookToken: true },
        });
      }

      // Build webhook URL
      const protocol = req.protocol;
      const host = req.get('host');
      const forwardedHost = req.get('x-forwarded-host');
      const forwardedProto = req.get('x-forwarded-proto');
      
      const actualHost = forwardedHost || host;
      const actualProtocol = forwardedProto || protocol;
      const baseUrl = `${actualProtocol}://${actualHost}`;
      
      const webhookUrl = `${baseUrl}/api/webhook/incoming/${user.webhookToken}`;

      res.status(200).json({
        webhookToken: user.webhookToken,
        webhookUrl,
        instructions: 'Use this URL to receive WhatsApp messages. Each user has a unique webhook URL.',
      });
    } catch (error: any) {
      console.error('Get webhook token error:', error);
      res.status(500).json({
        error: 'Failed to get webhook token',
        code: 'SERVER_ERROR',
        details: error.message,
      });
    }
  }

  /**
   * Regenerate webhook token for user
   * POST /api/settings/webhook-token/regenerate
   */
  static async regenerateWebhookToken(req: Request, res: Response) {
    try {
      const userId = extractAccountId(req);

      // Generate new token
      const newToken = generateWebhookToken();
      
      const user = await prisma.user.update({
        where: { id: userId },
        data: { webhookToken: newToken },
        select: { webhookToken: true },
      });

      // Build webhook URL
      const protocol = req.protocol;
      const host = req.get('host');
      const forwardedHost = req.get('x-forwarded-host');
      const forwardedProto = req.get('x-forwarded-proto');
      
      const actualHost = forwardedHost || host;
      const actualProtocol = forwardedProto || protocol;
      const baseUrl = `${actualProtocol}://${actualHost}`;
      
      const webhookUrl = `${baseUrl}/api/webhook/incoming/${user.webhookToken}`;

      res.status(200).json({
        message: 'Webhook token regenerated successfully',
        webhookToken: user.webhookToken,
        webhookUrl,
        warning: 'Old webhook URL will no longer work. Update your integrations.',
      });
    } catch (error: any) {
      console.error('Regenerate webhook token error:', error);
      res.status(500).json({
        error: 'Failed to regenerate webhook token',
        code: 'SERVER_ERROR',
        details: error.message,
      });
    }
  }
}
