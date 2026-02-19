import prisma from '../utils/prisma';

export class SettingsService {
  /**
   * Get user settings
   */
  static async getSettingsByAccount(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        shopifyDomain: true,
        shopifyAccessToken: true,
        n8nWebhookUrl: true,
      },
    });

    if (!user) return null;

    // Return settings with connection status (don't expose access token)
    return {
      id: user.id,
      email: user.email,
      shopifyDomain: user.shopifyDomain,
      shopifyAccessToken: user.shopifyAccessToken ? true : false,
      n8nWebhookUrl: user.n8nWebhookUrl,
    };
  }

  /**
   * Update user settings
   */
  static async updateSettings(
    userId: string,
    settings: {
      n8nWebhookUrl?: string;
    }
  ) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: settings,
      select: {
        id: true,
        email: true,
        shopifyDomain: true,
        shopifyAccessToken: true,
        n8nWebhookUrl: true,
      },
    });

    return {
      ...user,
      shopifyAccessToken: user.shopifyAccessToken ? true : false, // Only return boolean for security
    };
  }

  /**
   * Validate webhook URL format
   */
  static validateWebhookUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
