import { Request, Response } from 'express';
import { extractAccountId } from '../middleware/auth.middleware';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ShopifyController {
  /**
   * Save Shopify credentials (Client ID, Client Secret, Shop Domain)
   * POST /api/shopify/credentials
   */
  static async saveCredentials(req: Request, res: Response) {
    try {
      const userId = extractAccountId(req);
      const { shopifyDomain, shopifyClientId, shopifyClientSecret } = req.body;

      if (!shopifyDomain || !shopifyClientId || !shopifyClientSecret) {
        return res.status(400).json({
          error: 'Please provide shopifyDomain, shopifyClientId, and shopifyClientSecret',
          code: 'MISSING_CREDENTIALS',
        });
      }

      // Save credentials to database
      await prisma.user.update({
        where: { id: userId },
        data: {
          shopifyDomain,
          shopifyClientId,
          shopifyClientSecret, // Should be encrypted in production
        },
      });

      res.status(200).json({
        message: 'Shopify credentials saved successfully',
      });
    } catch (error: any) {
      console.error('Failed to save credentials:', error);
      res.status(500).json({
        error: 'Failed to save Shopify credentials',
        code: 'SERVER_ERROR',
        details: error.message,
      });
    }
  }

  /**
   * Start Shopify OAuth flow
   * GET /api/shopify/auth/start
   */
  static async startOAuth(req: Request, res: Response) {
    try {
      const userId = extractAccountId(req);

      // Get user's Shopify credentials from database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          shopifyDomain: true,
          shopifyClientId: true,
          shopifyClientSecret: true,
        },
      });

      if (!user?.shopifyDomain || !user?.shopifyClientId || !user?.shopifyClientSecret) {
        return res.status(400).json({
          error: 'Please configure your Shopify credentials first',
          code: 'CREDENTIALS_NOT_CONFIGURED',
          requiresSetup: true,
        });
      }

      // Get redirect URI from environment (same for all users)
      const redirectUri = process.env.SHOPIFY_REDIRECT_URI;
      const scopes = process.env.SHOPIFY_SCOPES || 'read_orders,write_webhooks';

      if (!redirectUri) {
        return res.status(500).json({
          error: 'Shopify OAuth redirect URI not configured',
          code: 'CONFIG_ERROR',
        });
      }

      // Generate state parameter for CSRF protection
      const state = crypto.randomBytes(32).toString('hex');

      // Store state in database with expiration (15 minutes)
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await prisma.oAuthState.create({
        data: {
          userId,
          state,
          expiresAt,
        },
      });

      // Build authorization URL using user's credentials
      const authUrl = `https://${user.shopifyDomain}/admin/oauth/authorize?` +
        `client_id=${user.shopifyClientId}&` +
        `scope=${scopes}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `state=${state}`;

      res.status(200).json({ authUrl });
    } catch (error: any) {
      console.error('Failed to start OAuth:', error);
      res.status(500).json({
        error: 'Failed to initiate Shopify connection',
        code: 'SERVER_ERROR',
        details: error.message,
      });
    }
  }

  /**
   * Handle Shopify OAuth callback
   * GET /api/shopify/auth/callback
   */
  static async handleCallback(req: Request, res: Response) {
    try {
      const { code, state, shop, hmac } = req.query;

      if (!code || !state || !shop) {
        return res.status(400).send('Missing required parameters');
      }

      // Verify state parameter
      const oauthState = await prisma.oAuthState.findFirst({
        where: {
          state: state as string,
          expiresAt: { gte: new Date() },
        },
        include: {
          user: {
            select: {
              id: true,
              shopifyClientId: true,
              shopifyClientSecret: true,
            },
          },
        },
      });

      if (!oauthState) {
        return res.status(401).send('Invalid or expired state parameter');
      }

      const clientSecret = oauthState.user.shopifyClientSecret;
      const clientId = oauthState.user.shopifyClientId;

      if (!clientSecret || !clientId) {
        return res.status(500).send('Shopify credentials not found');
      }

      // Verify HMAC
      const queryParams = { ...req.query };
      delete queryParams.hmac;
      const message = Object.keys(queryParams)
        .sort()
        .map(key => `${key}=${queryParams[key]}`)
        .join('&');

      const generatedHmac = crypto
        .createHmac('sha256', clientSecret)
        .update(message)
        .digest('hex');

      if (generatedHmac !== hmac) {
        return res.status(401).send('HMAC verification failed');
      }

      // Exchange code for access token
      const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      });

      const tokenData = await tokenResponse.json() as { access_token?: string };

      if (!tokenData.access_token) {
        return res.status(500).send('Failed to obtain access token');
      }

      // Store access token in database
      await prisma.user.update({
        where: { id: oauthState.userId },
        data: {
          shopifyAccessToken: tokenData.access_token,
          shopifyDomain: shop as string,
        },
      });

      // Delete used state
      await prisma.oAuthState.delete({
        where: { id: oauthState.id },
      });

      // Redirect to settings page with success message
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/settings?shopify=connected`);
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      res.status(500).send('Failed to complete Shopify connection');
    }
  }

  /**
   * Test Shopify connection
   * GET /api/shopify/test-connection
   */
  static async testConnection(req: Request, res: Response) {
    try {
      const userId = extractAccountId(req);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { shopifyAccessToken: true, shopifyDomain: true },
      });

      if (!user?.shopifyAccessToken || !user?.shopifyDomain) {
        return res.status(404).json({
          error: 'Shopify not connected',
          code: 'NOT_CONNECTED',
        });
      }

      const shopResponse = await fetch(`https://${user.shopifyDomain}/admin/api/2024-01/shop.json`, {
        headers: {
          'X-Shopify-Access-Token': user.shopifyAccessToken,
        },
      });

      if (!shopResponse.ok) {
        return res.status(500).json({
          error: 'Failed to connect to Shopify. Please reconnect your store.',
          code: 'CONNECTION_FAILED',
        });
      }

      const shopData: any = await shopResponse.json();

      res.status(200).json({
        message: 'Connection successful',
        shop: shopData.shop,
      });
    } catch (error: any) {
      console.error('Connection test error:', error);
      res.status(500).json({
        error: 'Failed to test connection',
        code: 'SERVER_ERROR',
        details: error.message,
      });
    }
  }

  /**
   * Disconnect Shopify store
   * POST /api/shopify/disconnect
   */
  static async disconnect(req: Request, res: Response) {
    try {
      const userId = extractAccountId(req);

      await prisma.user.update({
        where: { id: userId },
        data: {
          shopifyAccessToken: null,
          shopifyDomain: null,
          shopifyWebhookId: null,
          shopifyClientId: null,
          shopifyClientSecret: null,
        },
      });

      res.status(200).json({
        message: 'Shopify store disconnected successfully',
      });
    } catch (error: any) {
      console.error('Disconnect error:', error);
      res.status(500).json({
        error: 'Failed to disconnect Shopify',
        code: 'SERVER_ERROR',
        details: error.message,
      });
    }
  }
}
