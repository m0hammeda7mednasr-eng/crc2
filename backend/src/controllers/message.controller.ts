import { Request, Response } from 'express';
import { MessageService } from '../services/message.service';
import { CustomerService } from '../services/customer.service';
import { SettingsService } from '../services/settings.service';
import { extractAccountId } from '../middleware/auth.middleware';
import { SendMessageRequest } from '../types';

export class MessageController {
  /**
   * Get messages for a customer
   * GET /api/messages/:customerId
   */
  static async getMessages(req: Request, res: Response) {
    try {
      const userId = extractAccountId(req);
      const { customerId } = req.params;

      const messages = await MessageService.getMessagesByCustomer(customerId as string, userId);

      res.status(200).json({ messages });
    } catch (error: any) {
      if (error.message === 'Unauthorized access to customer messages') {
        return res.status(403).json({
          error: error.message,
          code: 'UNAUTHORIZED',
          timestamp: new Date().toISOString(),
        });
      }

      res.status(500).json({
        error: 'Failed to fetch messages',
        code: 'SERVER_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Send message
   * POST /api/messages/send
   */
  static async sendMessage(req: Request, res: Response) {
    try {
      const userId = extractAccountId(req);
      const { customerId, content, type, imageUrl }: SendMessageRequest = req.body;

      // Validation
      if (!customerId || !content || !type) {
        return res.status(400).json({
          error: 'customerId, content, and type are required',
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
      }

      // Validate customer belongs to user
      const isValid = await CustomerService.validateAccountOwnership(customerId, userId);
      if (!isValid) {
        return res.status(403).json({
          error: 'Unauthorized access to customer',
          code: 'UNAUTHORIZED',
          timestamp: new Date().toISOString(),
        });
      }

      // Get customer and user settings
      const [customer, settings] = await Promise.all([
        CustomerService.getCustomerById(customerId, userId),
        SettingsService.getSettingsByAccount(userId),
      ]);

      if (!customer) {
        return res.status(404).json({
          error: 'Customer not found',
          code: 'NOT_FOUND',
          timestamp: new Date().toISOString(),
        });
      }

      // Send to n8n (optional - don't fail if n8n is not available)
      let n8nSuccess = false;
      if (settings?.n8nWebhookUrl) {
        try {
          await MessageService.sendToN8n(
            settings.n8nWebhookUrl,
            customer.phoneNumber,
            content,
            type,
            imageUrl
          );
          n8nSuccess = true;
        } catch (error: any) {
          console.error('Failed to send to n8n:', error.message);
          // Continue anyway - store message locally
        }
      }

      // Get socket manager
      const socketManager = req.app.get('socketManager');

      // Store message
      const message = await MessageService.createMessage(
        customerId,
        content,
        type,
        'outgoing',
        imageUrl,
        socketManager
      );

      res.status(201).json({
        message: n8nSuccess ? 'Message sent successfully' : 'Message saved (n8n unavailable)',
        data: message,
        n8nStatus: n8nSuccess ? 'sent' : 'failed',
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to send message',
        code: 'SERVER_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Upload image
   * POST /api/messages/upload
   */
  static async uploadImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'No file uploaded',
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
      }

      // Validate image
      MessageService.validateImageFile(req.file);

      // Handle upload
      const imageUrl = await MessageService.handleImageUpload(req.file);

      res.status(200).json({
        message: 'Image uploaded successfully',
        imageUrl,
      });
    } catch (error: any) {
      res.status(400).json({
        error: error.message || 'Failed to upload image',
        code: 'UPLOAD_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
