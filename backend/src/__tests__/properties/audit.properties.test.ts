// Feature: crm-integration-settings, Property 6: Audit logging for sensitive operations
// Feature: crm-integration-settings, Property 20: Webhook event logging
import fc from 'fast-check';
import { PrismaClient } from '@prisma/client';
import { AuditService } from '../../services/audit.service';

const prisma = new PrismaClient();
const auditService = new AuditService();

describe('Audit Service Property Tests', () => {
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

  // Property 6: Audit logging for sensitive operations
  // Validates: Requirements 1.6, 12.1
  describe('Property 6: Audit logging for sensitive operations', () => {
    it('should create audit log entry for any account change operation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.constantFrom('email_update', 'username_update', 'password_update'),
          fc.ipV4(),
          fc.record({
            oldValue: fc.string(),
            newValue: fc.string(),
          }),
          async (userId, action, ipAddress, metadata) => {
            // Create a test user first
            await prisma.user.create({
              data: {
                id: userId,
                email: `test-${userId}@example.com`,
                passwordHash: 'hashed_password',
              },
            });

            // Log the account change
            await auditService.logAccountChange(userId, action as any, ipAddress, metadata);

            // Verify the audit log was created
            const logs = await prisma.auditLog.findMany({
              where: { userId, action },
            });

            expect(logs.length).toBeGreaterThan(0);
            const log = logs[0];
            expect(log.userId).toBe(userId);
            expect(log.action).toBe(action);
            expect(log.ipAddress).toBe(ipAddress);
            expect(log.createdAt).toBeInstanceOf(Date);
            
            if (metadata) {
              expect(log.metadata).toBeTruthy();
              const parsedMetadata = JSON.parse(log.metadata!);
              expect(parsedMetadata.oldValue).toBe(metadata.oldValue);
              expect(parsedMetadata.newValue).toBe(metadata.newValue);
            }

            // Clean up
            await prisma.auditLog.deleteMany({ where: { userId } });
            await prisma.user.delete({ where: { id: userId } });
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should create audit log with timestamp for any sensitive operation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.constantFrom('email_update', 'username_update', 'password_update'),
          fc.ipV4(),
          async (userId, action, ipAddress) => {
            // Create a test user first
            await prisma.user.create({
              data: {
                id: userId,
                email: `test-${userId}@example.com`,
                passwordHash: 'hashed_password',
              },
            });

            const beforeTime = new Date();
            await auditService.logAccountChange(userId, action as any, ipAddress);
            const afterTime = new Date();

            const logs = await prisma.auditLog.findMany({
              where: { userId, action },
            });

            expect(logs.length).toBeGreaterThan(0);
            const log = logs[0];
            
            // Verify timestamp is within the expected range (with 1 second buffer for timing variations)
            expect(log.createdAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime() - 1000);
            expect(log.createdAt.getTime()).toBeLessThanOrEqual(afterTime.getTime() + 1000);

            // Clean up
            await prisma.auditLog.deleteMany({ where: { userId } });
            await prisma.user.delete({ where: { id: userId } });
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should create audit log with user ID and action type for any operation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.constantFrom('email_update', 'username_update', 'password_update'),
          fc.ipV4(),
          async (userId, action, ipAddress) => {
            // Create a test user first
            await prisma.user.create({
              data: {
                id: userId,
                email: `test-${userId}@example.com`,
                passwordHash: 'hashed_password',
              },
            });

            await auditService.logAccountChange(userId, action as any, ipAddress);

            const logs = await prisma.auditLog.findMany({
              where: { userId },
            });

            expect(logs.length).toBeGreaterThan(0);
            const log = logs[0];
            expect(log.userId).toBe(userId);
            expect(log.action).toBe(action);
            expect(['email_update', 'username_update', 'password_update']).toContain(log.action);

            // Clean up
            await prisma.auditLog.deleteMany({ where: { userId } });
            await prisma.user.delete({ where: { id: userId } });
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  // Property 20: Webhook event logging
  // Validates: Requirements 3.7, 12.2
  describe('Property 20: Webhook event logging', () => {
    it('should create webhook log entry for any webhook event', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.constantFrom('incoming', 'outgoing'),
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.constantFrom('success', 'failure'),
          fc.uuid(),
          fc.record({
            payload: fc.record({
              eventType: fc.string(),
              data: fc.anything(),
            }),
            error: fc.option(fc.string()),
          }),
          async (tenantId, direction, eventType, status, correlationId, metadata) => {
            // Create a test user first
            await prisma.user.create({
              data: {
                id: tenantId,
                email: `test-${tenantId}@example.com`,
                passwordHash: 'hashed_password',
              },
            });

            // Log the webhook event
            await auditService.logWebhookEvent(
              tenantId,
              direction as any,
              eventType,
              status as any,
              correlationId,
              metadata
            );

            // Verify the webhook log was created
            const logs = await prisma.webhookLog.findMany({
              where: { userId: tenantId, correlationId },
            });

            expect(logs.length).toBeGreaterThan(0);
            const log = logs[0];
            expect(log.userId).toBe(tenantId);
            expect(log.direction).toBe(direction);
            expect(log.eventType).toBe(eventType);
            expect(log.status).toBe(status);
            expect(log.correlationId).toBe(correlationId);
            expect(log.createdAt).toBeInstanceOf(Date);

            // Clean up
            await prisma.webhookLog.deleteMany({ where: { userId: tenantId } });
            await prisma.user.delete({ where: { id: tenantId } });
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should log webhook with timestamp, tenant ID, direction, event type, status, and correlation ID', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.constantFrom('incoming', 'outgoing'),
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.constantFrom('success', 'failure'),
          fc.uuid(),
          async (tenantId, direction, eventType, status, correlationId) => {
            // Create a test user first
            await prisma.user.create({
              data: {
                id: tenantId,
                email: `test-${tenantId}@example.com`,
                passwordHash: 'hashed_password',
              },
            });

            const beforeTime = new Date();
            await auditService.logWebhookEvent(
              tenantId,
              direction as any,
              eventType,
              status as any,
              correlationId
            );
            const afterTime = new Date();

            const logs = await prisma.webhookLog.findMany({
              where: { userId: tenantId, correlationId },
            });

            expect(logs.length).toBeGreaterThan(0);
            const log = logs[0];
            
            // Verify all required fields are present
            expect(log.userId).toBe(tenantId);
            expect(log.direction).toBe(direction);
            expect(log.eventType).toBe(eventType);
            expect(log.status).toBe(status);
            expect(log.correlationId).toBe(correlationId);
            
            // Verify timestamp is within the expected range (with 1 second buffer)
            expect(log.createdAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime() - 1000);
            expect(log.createdAt.getTime()).toBeLessThanOrEqual(afterTime.getTime() + 1000);

            // Clean up
            await prisma.webhookLog.deleteMany({ where: { userId: tenantId } });
            await prisma.user.delete({ where: { id: tenantId } });
          }
        ),
        { numRuns: 20 }
      );
    });

    it('should log webhook events with correlation ID for request tracing', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.constantFrom('incoming', 'outgoing'),
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.constantFrom('success', 'failure'),
          fc.uuid(),
          async (tenantId, direction, eventType, status, correlationId) => {
            // Create a test user first
            await prisma.user.create({
              data: {
                id: tenantId,
                email: `test-${tenantId}@example.com`,
                passwordHash: 'hashed_password',
              },
            });

            // Log multiple webhook events with the same correlation ID
            await auditService.logWebhookEvent(
              tenantId,
              direction as any,
              eventType,
              status as any,
              correlationId
            );
            
            await auditService.logWebhookEvent(
              tenantId,
              direction as any,
              `${eventType}_followup`,
              status as any,
              correlationId
            );

            // Verify both logs share the same correlation ID
            const logs = await prisma.webhookLog.findMany({
              where: { userId: tenantId, correlationId },
              orderBy: { createdAt: 'asc' },
            });

            expect(logs.length).toBe(2);
            expect(logs[0].correlationId).toBe(correlationId);
            expect(logs[1].correlationId).toBe(correlationId);
            expect(logs[0].correlationId).toBe(logs[1].correlationId);

            // Clean up
            await prisma.webhookLog.deleteMany({ where: { userId: tenantId } });
            await prisma.user.delete({ where: { id: tenantId } });
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});
