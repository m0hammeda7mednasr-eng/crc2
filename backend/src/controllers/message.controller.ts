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
      const { customerId, content, type, imageUrl, voiceUrl, duration }: SendMessageRequest = req.body;

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
          // Convert relative image URL to full URL for WhatsApp
          let fullImageUrl = imageUrl;
          if (imageUrl && !imageUrl.startsWith('http')) {
            const baseUrl = process.env.BACKEND_URL || process.env.API_URL || `${req.protocol}://${req.get('host')}`;
            console.log(`🔧 Base URL: ${baseUrl}`);
            console.log(`🔧 BACKEND_URL env: ${process.env.BACKEND_URL}`);
            console.log(`🔧 req.protocol: ${req.protocol}`);
            console.log(`🔧 req.get('host'): ${req.get('host')}`);
            fullImageUrl = `${baseUrl}${imageUrl}`;
            console.log(`📸 Converting image URL: ${imageUrl} -> ${fullImageUrl}`);
          }

          let fullVoiceUrl = voiceUrl;
          if (voiceUrl && !voiceUrl.startsWith('http')) {
            const baseUrl = process.env.BACKEND_URL || process.env.API_URL || `${req.protocol}://${req.get('host')}`;
            fullVoiceUrl = `${baseUrl}${voiceUrl}`;
            console.log(`🎤 Converting voice URL: ${voiceUrl} -> ${fullVoiceUrl}`);
          }

          console.log(`📤 Sending to n8n:`, {
            phoneNumber: customer.phoneNumber,
            type,
            imageUrl: fullImageUrl,
            voiceUrl: fullVoiceUrl,
          });

          await MessageService.sendToN8n(
            settings.n8nWebhookUrl,
            customer.phoneNumber,
            content,
            type,
            fullImageUrl,
            fullVoiceUrl,
            duration
          );
          n8nSuccess = true;
          console.log(`✅ Message sent to n8n successfully`);
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
        socketManager,
        voiceUrl,
        duration
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

  /**
   * Upload voice message
   * POST /api/messages/upload-voice
   */
  static async uploadVoice(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'No file uploaded',
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
      }

      // Validate voice file
      MessageService.validateVoiceFile(req.file);

      // Handle upload
      const voiceUrl = await MessageService.handleVoiceUpload(req.file);

      res.status(200).json({
        message: 'Voice message uploaded successfully',
        voiceUrl,
      });
    } catch (error: any) {
      res.status(400).json({
        error: error.message || 'Failed to upload voice message',
        code: 'UPLOAD_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Test image URL conversion
   * GET /api/messages/test-image-url
   */
  static async testImageUrl(req: Request, res: Response) {
    try {
      const testImageUrl = '/uploads/test-image-123.jpg';
      
      // Get base URL using same logic as sendMessage
      const baseUrl = process.env.BACKEND_URL || process.env.API_URL || `${req.protocol}://${req.get('host')}`;
      const fullImageUrl = `${baseUrl}${testImageUrl}`;

      res.status(200).json({
        message: 'Image URL conversion test',
        environment: {
          BACKEND_URL: process.env.BACKEND_URL || 'NOT SET',
          API_URL: process.env.API_URL || 'NOT SET',
          NODE_ENV: process.env.NODE_ENV,
        },
        request: {
          protocol: req.protocol,
          host: req.get('host'),
          fullUrl: `${req.protocol}://${req.get('host')}`,
        },
        conversion: {
          relativeUrl: testImageUrl,
          baseUrl: baseUrl,
          fullUrl: fullImageUrl,
        },
        explanation: {
          step1: 'Check if BACKEND_URL is set in environment',
          step2: 'If not, fallback to API_URL',
          step3: 'If not, use request protocol + host',
          result: `Using: ${process.env.BACKEND_URL ? 'BACKEND_URL' : process.env.API_URL ? 'API_URL' : 'Request URL'}`,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message,
        code: 'SERVER_ERROR',
      });
    }
  }
}
