import { Request, Response } from 'express';
import { CustomerService } from '../services/customer.service';
import { MessageService } from '../services/message.service';
import { OrderService } from '../services/order.service';
import prisma from '../utils/prisma';
import {
  IncomingMessagePayload,
  ButtonResponsePayload,
  ShopifyOrderPayload,
} from '../types';

export class WebhookController {
  /**
   * Handle incoming WhatsApp message
   * POST /api/webhook/incoming/:token (recommended - unique per user)
   * POST /api/webhook/incoming/:userId (legacy - still supported)
   */
  static async handleIncomingMessage(req: Request, res: Response) {
    try {
      const payload: IncomingMessagePayload = req.body;

      // Support multiple formats: n8n might send 'from'/'body' or 'phoneNumber'/'content'
      const phoneNumber = payload.phoneNumber || (req.body.from as string);
      const content = payload.content || (req.body.body as string);
      const customerName = payload.customerName || (req.body.name as string);

      // Validation
      if (!phoneNumber || !content) {
        return res.status(400).json({
          error: 'phoneNumber/from and content/body are required',
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
          received: req.body,
        });
      }

      // Get socket manager
      const socketManager = req.app.get('socketManager');

      // Get token or userId from URL parameter
      const tokenOrUserId = req.params.userId as string || req.params.token as string;
      let userId: string | undefined;

      if (tokenOrUserId) {
        // Check if it's a webhook token (starts with whk_)
        if (tokenOrUserId.startsWith('whk_')) {
          const user = await prisma.user.findUnique({
            where: { webhookToken: tokenOrUserId },
            select: { id: true },
          });
          
          if (!user) {
            return res.status(401).json({
              error: 'Invalid webhook token',
              code: 'INVALID_TOKEN',
              timestamp: new Date().toISOString(),
            });
          }
          
          userId = user.id;
        } else {
          // Assume it's a userId (legacy support)
          userId = tokenOrUserId;
        }
      } else {
        // Fallback: try to get from payload
        userId = payload.userId;
      }

      // If userId not provided, look up existing customer
      if (!userId) {
        const existingCustomer = await CustomerService.findCustomerByPhone(phoneNumber);

        if (existingCustomer) {
          userId = existingCustomer.userId;
        } else {
          // ⚠️ WARNING: In production with multiple users, always send token/userId explicitly.
          const firstUser = await CustomerService.getFirstUser();
          if (!firstUser) {
            return res.status(400).json({
              error: 'No users found in system. Please register first.',
              code: 'NO_USER_FOUND',
              timestamp: new Date().toISOString(),
            });
          }
          console.warn(
            `[Webhook] No token/userId provided for phone ${phoneNumber}. ` +
            `Falling back to first user (${firstUser.id}). ` +
            `Use webhook token in production with multiple users.`
          );
          userId = firstUser.id;
        }
      }

      // Find or create customer
      const customer = await CustomerService.findOrCreateByPhone(
        phoneNumber,
        userId,
        customerName,
        socketManager
      );

      // Create message
      const message = await MessageService.createMessage(
        customer.id,
        content,
        payload.type || 'text',
        'incoming',
        payload.imageUrl,
        socketManager,
        payload.voiceUrl,
        payload.duration
      );

      res.status(200).json({
        message: 'Message received successfully',
        data: message,
        userId: userId,
      });
    } catch (error: any) {
      console.error('Webhook error:', error);
      res.status(500).json({
        error: 'Failed to process incoming message',
        code: 'SERVER_ERROR',
        timestamp: new Date().toISOString(),
        details: error.message,
      });
    }
  }

  /**
   * Handle WhatsApp button response
   * POST /api/webhooks/whatsapp/button
   */
  static async handleButtonResponse(req: Request, res: Response) {
    try {
      const payload: ButtonResponsePayload = req.body;

      // Validation - include phoneNumber check for Support action
      if (!payload.orderId || !payload.action || !payload.userId) {
        return res.status(400).json({
          error: 'Missing required fields: orderId, action, userId',
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
      }

      // Extra validation for Support action
      if (payload.action === 'Support' && !payload.phoneNumber) {
        return res.status(400).json({
          error: 'phoneNumber is required for Support action',
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
      }

      // Get socket manager
      const socketManager = req.app.get('socketManager');

      if (payload.action === 'Confirm') {
        await OrderService.updateStatus(payload.orderId, 'confirmed', payload.userId, socketManager);
      } else if (payload.action === 'Cancel') {
        await OrderService.updateStatus(payload.orderId, 'cancelled', payload.userId, socketManager);
      } else if (payload.action === 'Support') {
        // Find or create customer
        const customer = await CustomerService.findOrCreateByPhone(
          payload.phoneNumber!,
          payload.userId,
          undefined,
          socketManager
        );

        // Create support message
        await MessageService.createMessage(
          customer.id,
          'Customer requested support',
          'text',
          'incoming',
          undefined,
          socketManager
        );
      } else {
        return res.status(400).json({
          error: `Unknown action: ${payload.action}. Valid actions: Confirm, Cancel, Support`,
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
      }

      res.status(200).json({
        message: 'Button response processed successfully',
      });
    } catch (error: any) {
      console.error('Button response error:', error);
      res.status(500).json({
        error: 'Failed to process button response',
        code: 'SERVER_ERROR',
        timestamp: new Date().toISOString(),
        details: error.message,
      });
    }
  }

  /**
   * Handle Shopify order sync (Direct from Shopify webhook)
   * POST /api/webhooks/shopify/orders
   * POST /api/webhooks/shopify/orders?shop=store.myshopify.com
   * POST /api/webhooks/shopify/orders?userId=xxx (legacy)
   */
  static async handleShopifyOrder(req: Request, res: Response) {
    try {
      let payload: any;
      
      // Check if it's direct Shopify webhook or n8n format
      if (req.body.id && req.body.line_items) {
        // Direct Shopify webhook format
        const order = req.body;
        
        // Get shop domain from query parameter, header, or order data
        let shopDomain = req.query.shop as string || 
                        req.headers['x-shopify-shop-domain'] as string ||
                        order.shop_domain;
        
        // Get userId from query parameter (legacy support)
        let userId = req.query.userId as string || req.headers['x-user-id'] as string;
        
        // If shop domain provided, find user by shop domain
        if (shopDomain && !userId) {
          // Remove .myshopify.com if present to normalize
          const normalizedDomain = shopDomain.replace('.myshopify.com', '');
          
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { shopifyDomain: shopDomain },
                { shopifyDomain: normalizedDomain },
                { shopifyDomain: `${normalizedDomain}.myshopify.com` },
              ],
            },
          });
          
          if (user) {
            userId = user.id;
          }
        }
        
        // If still no userId, try to get first user (single-user setup)
        if (!userId) {
          const firstUser = await CustomerService.getFirstUser();
          if (!firstUser) {
            return res.status(400).json({
              error: 'No user found. Please provide shop domain or userId.',
              code: 'USER_NOT_FOUND',
              hint: 'Add ?shop=your-store.myshopify.com to the webhook URL',
              shopDomain: shopDomain || 'not provided',
            });
          }
          userId = firstUser.id;
        }
        
        // Extract customer phone
        let customerPhone = order.customer?.phone || order.shipping_address?.phone || order.billing_address?.phone || '';
        customerPhone = customerPhone.replace(/[^0-9+]/g, '');
        
        if (!customerPhone) {
          console.warn('Order without phone number:', order.id);
          customerPhone = 'unknown';
        }
        
        // Extract customer name
        const firstName = order.customer?.first_name || '';
        const lastName = order.customer?.last_name || '';
        const customerName = `${firstName} ${lastName}`.trim() || 'Unknown Customer';
        
        // Format items
        const items = order.line_items?.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })) || [];
        
        payload = {
          orderId: order.id.toString(),
          orderNumber: order.order_number?.toString() || order.name || order.id.toString(),
          customerName: customerName,
          customerPhone: customerPhone,
          total: parseFloat(order.total_price || order.current_total_price || '0'),
          status: 'pending',
          userId: userId,
          items: JSON.stringify(items),
        };
      } else {
        // n8n or custom format
        payload = req.body as ShopifyOrderPayload;
      }

      // Validation
      if (!payload.orderNumber || !payload.userId) {
        return res.status(400).json({
          error: 'Missing required fields: orderNumber, userId',
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
          received: payload,
        });
      }

      // Get socket manager
      const socketManager = req.app.get('socketManager');

      // Find or create customer
      const customer = await CustomerService.findOrCreateByPhone(
        payload.customerPhone || 'unknown',
        payload.userId,
        payload.customerName,
        socketManager
      );

      // Create order
      const order = await OrderService.createOrder(
        payload.orderId,
        payload.orderNumber,
        payload.total,
        payload.status || 'pending',
        payload.customerName || 'Unknown',
        payload.customerPhone || 'unknown',
        payload.userId,
        customer.id,
        payload.items,
        socketManager
      );

      res.status(200).json({
        message: 'Order synced successfully',
        data: order,
      });
    } catch (error: any) {
      console.error('Shopify webhook error:', error);
      res.status(500).json({
        error: 'Failed to sync order',
        code: 'SERVER_ERROR',
        timestamp: new Date().toISOString(),
        details: error.message,
      });
    }
  }

  /**
   * Get Shopify webhook URL for user (with ngrok detection)
   * GET /api/webhooks/shopify/url
   */
  static async getShopifyWebhookUrl(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(400).json({
          error: 'userId is required',
          code: 'VALIDATION_ERROR',
        });
      }

      // Get user's Shopify domain
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { shopifyDomain: true },
      });

      // Try to detect ngrok URL from request headers
      const host = req.get('host');
      const protocol = req.protocol;
      const forwardedHost = req.get('x-forwarded-host');
      const forwardedProto = req.get('x-forwarded-proto');
      
      // Use forwarded headers if available (ngrok sets these)
      const actualHost = forwardedHost || host;
      const actualProtocol = forwardedProto || protocol;
      
      const baseUrl = `${actualProtocol}://${actualHost}`;
      
      // Build webhook URL with shop domain if available
      let webhookUrl: string;
      if (user?.shopifyDomain) {
        // Use shop domain (cleaner and more intuitive)
        const shopDomain = user.shopifyDomain.replace('.myshopify.com', '');
        webhookUrl = `${baseUrl}/api/webhook/shopify/orders?shop=${shopDomain}`;
      } else {
        // Fallback to userId (legacy)
        webhookUrl = `${baseUrl}/api/webhook/shopify/orders?userId=${userId}`;
      }

      res.status(200).json({
        webhookUrl,
        userId,
        shopDomain: user?.shopifyDomain || null,
        baseUrl,
        isHttps: actualProtocol === 'https',
        instructions: user?.shopifyDomain 
          ? `Use this URL in Shopify webhook settings. The shop domain (${user.shopifyDomain}) is automatically detected.`
          : 'Use this URL in Shopify webhook settings. Configure your Shopify domain in Settings for a cleaner URL.',
      });
    } catch (error: any) {
      console.error('Get webhook URL error:', error);
      res.status(500).json({
        error: 'Failed to get webhook URL',
        code: 'SERVER_ERROR',
        details: error.message,
      });
    }
  }
}
