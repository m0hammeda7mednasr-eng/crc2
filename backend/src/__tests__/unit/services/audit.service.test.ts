import { PrismaClient } from '@prisma/client';
import { AuditService } from '../../../services/audit.service';

const prisma = new PrismaClient();
const auditService = new AuditService();

describe('AuditService Unit Tests', () => {
  beforeEach(async () => {
    // Clean up test data before each test
    await prisma.auditLog.deleteMany({});
    await prisma.webhookLog.deleteMany({});
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    // Clean up and disconnect
    await prisma.auditLog.deleteMany({});
    await prisma.webhookLog.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  describe('logAccountChange', () => {
    it('should create audit log entry with all fields', async () => {
      const userId = 'test-user-1';
      const action = 'email_update';
      const ipAddress = '192.168.1.1';
      const metadata = { oldEmail: 'old@example.com', newEmail: 'new@example.com' };

      // Create test user
      await prisma.user.create({
        data: {
          id: userId,
          email: 'test@example.com',
          passwordHash: 'hashed_password',
        },
      });

      await auditService.logAccountChange(userId, action, ipAddress, metadata);

      const logs = await prisma.auditLog.findMany({ where: { userId } });
      expect(logs.length).toBe(1);
      
      const log = logs[0];
      expect(log.userId).toBe(userId);
      expect(log.action).toBe(action);
      expect(log.ipAddress).toBe(ipAddress);
      expect(log.metadata).toBeTruthy();
      
      const parsedMetadata = JSON.parse(log.metadata!);
      expect(parsedMetadata.oldEmail).toBe('old@example.com');
      expect(parsedMetadata.newEmail).toBe('new@example.com');
    });

    it('should create audit log without metadata', async () => {
      const userId = 'test-user-2';
      const action = 'password_update';
      const ipAddress = '10.0.0.1';

      // Create test user
      await prisma.user.create({
        data: {
          id: userId,
          email: 'test2@example.com',
          passwordHash: 'hashed_password',
        },
      });

      await auditService.logAccountChange(userId, action, ipAddress);

      const logs = await prisma.auditLog.findMany({ where: { userId } });
      expect(logs.length).toBe(1);
      
      const log = logs[0];
      expect(log.userId).toBe(userId);
      expect(log.action).toBe(action);
      expect(log.ipAddress).toBe(ipAddress);
      expect(log.metadata).toBeNull();
    });

    it('should handle username_update action', async () => {
      const userId = 'test-user-3';
      const action = 'username_update';
      const ipAddress = '172.16.0.1';

      // Create test user
      await prisma.user.create({
        data: {
          id: userId,
          email: 'test3@example.com',
          passwordHash: 'hashed_password',
        },
      });

      await auditService.logAccountChange(userId, action, ipAddress);

      const logs = await prisma.auditLog.findMany({ where: { userId, action } });
      expect(logs.length).toBe(1);
      expect(logs[0].action).toBe('username_update');
    });
  });

  describe('logWebhookEvent', () => {
    it('should create webhook log entry with all fields', async () => {
      const tenantId = 'tenant-1';
      const direction = 'incoming';
      const eventType = 'order_created';
      const status = 'success';
      const correlationId = 'corr-123';
      const metadata = {
        payload: { orderId: '12345', amount: 100 },
        error: null,
      };

      // Create test user
      await prisma.user.create({
        data: {
          id: tenantId,
          email: 'tenant1@example.com',
          passwordHash: 'hashed_password',
        },
      });

      await auditService.logWebhookEvent(
        tenantId,
        direction,
        eventType,
        status,
        correlationId,
        metadata
      );

      const logs = await prisma.webhookLog.findMany({ where: { userId: tenantId } });
      expect(logs.length).toBe(1);
      
      const log = logs[0];
      expect(log.userId).toBe(tenantId);
      expect(log.direction).toBe(direction);
      expect(log.eventType).toBe(eventType);
      expect(log.status).toBe(status);
      expect(log.correlationId).toBe(correlationId);
      expect(log.payload).toBeTruthy();
      
      const parsedPayload = JSON.parse(log.payload!);
      expect(parsedPayload.orderId).toBe('12345');
      expect(parsedPayload.amount).toBe(100);
    });

    it('should create webhook log with error information', async () => {
      const tenantId = 'tenant-2';
      const direction = 'outgoing';
      const eventType = 'webhook_send';
      const status = 'failure';
      const correlationId = 'corr-456';
      const metadata = {
        error: 'Connection timeout',
      };

      // Create test user
      await prisma.user.create({
        data: {
          id: tenantId,
          email: 'tenant2@example.com',
          passwordHash: 'hashed_password',
        },
      });

      await auditService.logWebhookEvent(
        tenantId,
        direction,
        eventType,
        status,
        correlationId,
        metadata
      );

      const logs = await prisma.webhookLog.findMany({ where: { userId: tenantId } });
      expect(logs.length).toBe(1);
      
      const log = logs[0];
      expect(log.status).toBe('failure');
      expect(log.error).toBe('Connection timeout');
    });

    it('should handle webhook log without metadata', async () => {
      const tenantId = 'tenant-3';
      const direction = 'incoming';
      const eventType = 'test_event';
      const status = 'success';
      const correlationId = 'corr-789';

      // Create test user
      await prisma.user.create({
        data: {
          id: tenantId,
          email: 'tenant3@example.com',
          passwordHash: 'hashed_password',
        },
      });

      await auditService.logWebhookEvent(
        tenantId,
        direction,
        eventType,
        status,
        correlationId
      );

      const logs = await prisma.webhookLog.findMany({ where: { userId: tenantId } });
      expect(logs.length).toBe(1);
      
      const log = logs[0];
      expect(log.payload).toBeNull();
      expect(log.error).toBeNull();
    });
  });

  describe('logOAuthEvent', () => {
    it('should create OAuth audit log with shop domain', async () => {
      const userId = 'oauth-user-1';
      const action = 'connect';
      const shopDomain = 'myshop.myshopify.com';
      const status = 'success';
      const metadata = { ipAddress: '192.168.1.100' };

      // Create test user
      await prisma.user.create({
        data: {
          id: userId,
          email: 'oauth1@example.com',
          passwordHash: 'hashed_password',
        },
      });

      await auditService.logOAuthEvent(userId, action, shopDomain, status, metadata);

      const logs = await prisma.auditLog.findMany({ where: { userId } });
      expect(logs.length).toBe(1);
      
      const log = logs[0];
      expect(log.userId).toBe(userId);
      expect(log.action).toBe('oauth_connect');
      expect(log.ipAddress).toBe('192.168.1.100');
      expect(log.metadata).toBeTruthy();
      
      const parsedMetadata = JSON.parse(log.metadata!);
      expect(parsedMetadata.shopDomain).toBe(shopDomain);
      expect(parsedMetadata.status).toBe(status);
    });

    it('should handle disconnect action', async () => {
      const userId = 'oauth-user-2';
      const action = 'disconnect';
      const shopDomain = 'testshop.myshopify.com';
      const status = 'success';

      // Create test user
      await prisma.user.create({
        data: {
          id: userId,
          email: 'oauth2@example.com',
          passwordHash: 'hashed_password',
        },
      });

      await auditService.logOAuthEvent(userId, action, shopDomain, status);

      const logs = await prisma.auditLog.findMany({ where: { userId } });
      expect(logs.length).toBe(1);
      expect(logs[0].action).toBe('oauth_disconnect');
    });

    it('should handle token_refresh action', async () => {
      const userId = 'oauth-user-3';
      const action = 'token_refresh';
      const shopDomain = 'refreshshop.myshopify.com';
      const status = 'failure';

      // Create test user
      await prisma.user.create({
        data: {
          id: userId,
          email: 'oauth3@example.com',
          passwordHash: 'hashed_password',
        },
      });

      await auditService.logOAuthEvent(userId, action, shopDomain, status);

      const logs = await prisma.auditLog.findMany({ where: { userId } });
      expect(logs.length).toBe(1);
      expect(logs[0].action).toBe('oauth_token_refresh');
    });
  });

  describe('logSecurityViolation', () => {
    it('should log HMAC failure', async () => {
      const type = 'hmac_failure';
      const ipAddress = '203.0.113.1';
      const userId = 'attacker-1';
      
      // Create test user
      await prisma.user.create({
        data: {
          id: userId,
          email: 'attacker1@example.com',
          passwordHash: 'hashed_password',
        },
      });
      
      const metadata = { userId, endpoint: '/api/webhook' };

      await auditService.logSecurityViolation(type, ipAddress, metadata);

      const logs = await prisma.auditLog.findMany({ 
        where: { action: 'security_violation_hmac_failure' } 
      });
      expect(logs.length).toBe(1);
      
      const log = logs[0];
      expect(log.action).toBe('security_violation_hmac_failure');
      expect(log.ipAddress).toBe(ipAddress);
      expect(log.userId).toBe(userId);
      
      const parsedMetadata = JSON.parse(log.metadata!);
      expect(parsedMetadata.violationType).toBe('hmac_failure');
      expect(parsedMetadata.endpoint).toBe('/api/webhook');
    });

    it('should log state mismatch', async () => {
      const type = 'state_mismatch';
      const ipAddress = '198.51.100.1';
      const userId = 'attacker-2';
      
      // Create test user
      await prisma.user.create({
        data: {
          id: userId,
          email: 'attacker2@example.com',
          passwordHash: 'hashed_password',
        },
      });
      
      const metadata = { 
        userId,
        expectedState: 'abc123', 
        receivedState: 'xyz789' 
      };

      await auditService.logSecurityViolation(type, ipAddress, metadata);

      const logs = await prisma.auditLog.findMany({ 
        where: { action: 'security_violation_state_mismatch' } 
      });
      expect(logs.length).toBe(1);
      
      const log = logs[0];
      expect(log.action).toBe('security_violation_state_mismatch');
      
      const parsedMetadata = JSON.parse(log.metadata!);
      expect(parsedMetadata.violationType).toBe('state_mismatch');
    });

    it('should log signature failure with system user', async () => {
      const type = 'signature_failure';
      const ipAddress = '192.0.2.1';
      const userId = 'system-user';
      
      // Create system user
      await prisma.user.create({
        data: {
          id: userId,
          email: 'system@example.com',
          passwordHash: 'hashed_password',
        },
      });
      
      const metadata = { userId };

      await auditService.logSecurityViolation(type, ipAddress, metadata);

      const logs = await prisma.auditLog.findMany({ 
        where: { action: 'security_violation_signature_failure' } 
      });
      expect(logs.length).toBe(1);
      expect(logs[0].userId).toBe(userId);
    });

    it('should log rate limit violation', async () => {
      const type = 'rate_limit';
      const ipAddress = '10.1.1.1';
      const userId = 'rate-limit-user';
      
      // Create test user
      await prisma.user.create({
        data: {
          id: userId,
          email: 'ratelimit@example.com',
          passwordHash: 'hashed_password',
        },
      });
      
      const metadata = { userId, requestCount: 150, limit: 100 };

      await auditService.logSecurityViolation(type, ipAddress, metadata);

      const logs = await prisma.auditLog.findMany({ 
        where: { action: 'security_violation_rate_limit' } 
      });
      expect(logs.length).toBe(1);
      
      const parsedMetadata = JSON.parse(logs[0].metadata!);
      expect(parsedMetadata.requestCount).toBe(150);
      expect(parsedMetadata.limit).toBe(100);
    });
  });

  describe('getAuditLogs', () => {
    beforeEach(async () => {
      // Create test user
      await prisma.user.create({
        data: {
          id: 'filter-user',
          email: 'filter@example.com',
          passwordHash: 'hashed_password',
        },
      });

      // Create multiple audit logs
      await auditService.logAccountChange('filter-user', 'email_update', '1.1.1.1');
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
      await auditService.logAccountChange('filter-user', 'password_update', '1.1.1.1');
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
      await auditService.logAccountChange('filter-user', 'username_update', '1.1.1.1');
    });

    it('should retrieve all audit logs for user', async () => {
      const logs = await auditService.getAuditLogs('filter-user');
      
      expect(logs.length).toBe(3);
      // Should be ordered by createdAt desc
      expect(logs[0].action).toBe('username_update');
      expect(logs[1].action).toBe('password_update');
      expect(logs[2].action).toBe('email_update');
    });

    it('should filter logs by action type', async () => {
      const logs = await auditService.getAuditLogs('filter-user', { 
        action: 'email_update' 
      });
      
      expect(logs.length).toBe(1);
      expect(logs[0].action).toBe('email_update');
    });

    it('should filter logs by date range', async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      const logs = await auditService.getAuditLogs('filter-user', {
        startDate: oneHourAgo,
        endDate: oneHourFromNow,
      });
      
      expect(logs.length).toBe(3);
    });

    it('should filter logs by start date only', async () => {
      const now = new Date();
      
      const logs = await auditService.getAuditLogs('filter-user', {
        startDate: now,
      });
      
      // All logs should be after or at the start date
      logs.forEach(log => {
        expect(log.createdAt.getTime()).toBeGreaterThanOrEqual(now.getTime() - 1000);
      });
    });

    it('should filter logs by end date only', async () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      const logs = await auditService.getAuditLogs('filter-user', {
        endDate: futureDate,
      });
      
      expect(logs.length).toBe(3);
    });

    it('should return empty array for user with no logs', async () => {
      // Create another user with no logs
      await prisma.user.create({
        data: {
          id: 'no-logs-user',
          email: 'nologs@example.com',
          passwordHash: 'hashed_password',
        },
      });

      const logs = await auditService.getAuditLogs('no-logs-user');
      expect(logs.length).toBe(0);
    });
  });

  describe('correlation ID generation', () => {
    it('should allow multiple webhook logs with same correlation ID', async () => {
      const tenantId = 'corr-tenant';
      const correlationId = 'test-correlation-id';

      // Create test user
      await prisma.user.create({
        data: {
          id: tenantId,
          email: 'corr@example.com',
          passwordHash: 'hashed_password',
        },
      });

      // Log multiple events with same correlation ID
      await auditService.logWebhookEvent(
        tenantId,
        'incoming',
        'event1',
        'success',
        correlationId
      );
      
      await auditService.logWebhookEvent(
        tenantId,
        'outgoing',
        'event2',
        'success',
        correlationId
      );

      const logs = await prisma.webhookLog.findMany({ 
        where: { correlationId } 
      });
      
      expect(logs.length).toBe(2);
      expect(logs[0].correlationId).toBe(correlationId);
      expect(logs[1].correlationId).toBe(correlationId);
    });
  });
});
