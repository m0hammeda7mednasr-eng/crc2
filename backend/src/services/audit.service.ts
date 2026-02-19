import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * AuditService handles audit logging for security events and user actions.
 * 
 * Requirements: 12.1, 12.2, 12.3, 12.4
 */
export class AuditService {
  /**
   * Log account settings change
   * 
   * @param userId - The user ID performing the action
   * @param action - The type of action (email_update, username_update, password_update)
   * @param ipAddress - The IP address of the request
   * @param metadata - Additional context data
   */
  async logAccountChange(
    userId: string,
    action: 'email_update' | 'username_update' | 'password_update',
    ipAddress: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        ipAddress,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  }

  /**
   * Log webhook event
   * 
   * @param tenantId - The tenant ID (user ID)
   * @param direction - The direction of the webhook (incoming or outgoing)
   * @param eventType - The type of event
   * @param status - The status of the webhook (success or failure)
   * @param correlationId - The correlation ID for request tracing
   * @param metadata - Additional context data
   */
  async logWebhookEvent(
    tenantId: string,
    direction: 'incoming' | 'outgoing',
    eventType: string,
    status: 'success' | 'failure',
    correlationId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await prisma.webhookLog.create({
      data: {
        userId: tenantId,
        direction,
        eventType,
        status,
        correlationId,
        payload: metadata?.payload ? JSON.stringify(metadata.payload) : null,
        error: metadata?.error || null,
      },
    });
  }

  /**
   * Log OAuth event
   * 
   * @param userId - The user ID performing the action
   * @param action - The type of OAuth action (connect, disconnect, token_refresh)
   * @param shopDomain - The Shopify shop domain
   * @param status - The status of the OAuth action (success or failure)
   * @param metadata - Additional context data
   */
  async logOAuthEvent(
    userId: string,
    action: 'connect' | 'disconnect' | 'token_refresh',
    shopDomain: string,
    status: 'success' | 'failure',
    metadata?: Record<string, any>
  ): Promise<void> {
    await prisma.auditLog.create({
      data: {
        userId,
        action: `oauth_${action}`,
        ipAddress: metadata?.ipAddress || null,
        metadata: JSON.stringify({
          shopDomain,
          status,
          ...metadata,
        }),
      },
    });
  }

  /**
   * Log security violation
   * 
   * @param type - The type of security violation
   * @param ipAddress - The IP address of the request
   * @param metadata - Additional context data
   */
  async logSecurityViolation(
    type: 'hmac_failure' | 'state_mismatch' | 'signature_failure' | 'rate_limit',
    ipAddress: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await prisma.auditLog.create({
      data: {
        userId: metadata?.userId || 'system',
        action: `security_violation_${type}`,
        ipAddress,
        metadata: JSON.stringify({
          violationType: type,
          ...metadata,
        }),
      },
    });
  }

  /**
   * Get audit logs for user
   * 
   * @param userId - The user ID to retrieve logs for
   * @param filters - Optional filters for date range and action type
   * @returns Array of audit log entries
   */
  async getAuditLogs(
    userId: string,
    filters?: { startDate?: Date; endDate?: Date; action?: string }
  ): Promise<any[]> {
    const where: any = { userId };

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    if (filters?.action) {
      where.action = filters.action;
    }

    return await prisma.auditLog.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

// Export singleton instance
export const auditService = new AuditService();
