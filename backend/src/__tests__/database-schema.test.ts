// Feature: whatsapp-shopify-crm, Property 31: Database schema completeness
import fc from 'fast-check';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Property 31: Database schema completeness', () => {
  beforeAll(async () => {
    // Ensure database connection is established
    await prisma.$connect();
  });

  afterAll(async () => {
    // Clean up and disconnect
    await prisma.message.deleteMany();
    await prisma.order.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up before each test to avoid unique constraint violations
    await prisma.message.deleteMany();
    await prisma.order.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.user.deleteMany();
  });

  // Validates: Requirements 17.1
  it('should store User records with all required fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 8, maxLength: 50 }),
        fc.option(fc.webUrl(), { nil: undefined }),
        fc.option(fc.string({ minLength: 10, maxLength: 100 }), { nil: undefined }),
        fc.option(fc.webUrl(), { nil: undefined }),
        async (email, password, shopifyDomain, shopifyApiKey, n8nWebhookUrl) => {
          // Make email unique for each iteration by adding timestamp and random suffix
          const uniqueEmail = `${Date.now()}-${Math.random().toString(36).substring(7)}-${email}`;
          
          // Hash password
          const passwordHash = await bcrypt.hash(password, 10);

          // Create user
          const user = await prisma.user.create({
            data: {
              email: uniqueEmail,
              passwordHash,
              shopifyDomain,
              shopifyApiKey,
              n8nWebhookUrl,
            },
          });

          // Verify all fields are stored correctly
          expect(user.id).toBeDefined();
          expect(user.email).toBe(uniqueEmail);
          expect(user.passwordHash).toBe(passwordHash);
          expect(user.passwordHash).not.toBe(password); // Ensure password is hashed
          // Prisma returns null for undefined optional fields
          expect(user.shopifyDomain).toBe(shopifyDomain ?? null);
          expect(user.shopifyApiKey).toBe(shopifyApiKey ?? null);
          expect(user.n8nWebhookUrl).toBe(n8nWebhookUrl ?? null);
          expect(user.createdAt).toBeInstanceOf(Date);
          expect(user.updatedAt).toBeInstanceOf(Date);
          
          // Clean up after this iteration
          await prisma.user.delete({ where: { id: user.id } });
        }
      ),
      { numRuns: 20 }
    );
  }, 30000);

  // Validates: Requirements 17.2
  it('should store Customer records with all required fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 10, maxLength: 15 }).map(s => '+' + s.replace(/\D/g, '')),
        fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
        async (email, phoneNumber, name) => {
          // Make email and phone unique for each iteration
          const uniqueEmail = `${Date.now()}-${Math.random().toString(36).substring(7)}-${email}`;
          const uniquePhone = `${phoneNumber}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
          
          // Create user first (required for foreign key)
          const user = await prisma.user.create({
            data: {
              email: uniqueEmail,
              passwordHash: await bcrypt.hash('password123', 10),
            },
          });

          // Create customer
          const customer = await prisma.customer.create({
            data: {
              phoneNumber: uniquePhone,
              name,
              userId: user.id,
            },
          });

          // Verify all fields are stored correctly
          expect(customer.id).toBeDefined();
          expect(customer.phoneNumber).toBe(uniquePhone);
          // Prisma returns null for undefined optional fields
          expect(customer.name).toBe(name ?? null);
          expect(customer.userId).toBe(user.id);
          expect(customer.createdAt).toBeInstanceOf(Date);
          expect(customer.updatedAt).toBeInstanceOf(Date);
          
          // Clean up after this iteration
          await prisma.customer.delete({ where: { id: customer.id } });
          await prisma.user.delete({ where: { id: user.id } });
        }
      ),
      { numRuns: 20 }
    );
  }, 30000);

  // Validates: Requirements 17.3
  it('should store Message records with all required fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 10, maxLength: 15 }).map(s => '+' + s.replace(/\D/g, '')),
        fc.string({ minLength: 1, maxLength: 500 }),
        fc.constantFrom('text', 'image'),
        fc.constantFrom('incoming', 'outgoing'),
        fc.option(fc.webUrl(), { nil: undefined }),
        async (email, phoneNumber, content, type, direction, imageUrl) => {
          // Make email and phone unique for each iteration
          const uniqueEmail = `${Date.now()}-${Math.random().toString(36).substring(7)}-${email}`;
          const uniquePhone = `${phoneNumber}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
          
          // Create user and customer first
          const user = await prisma.user.create({
            data: {
              email: uniqueEmail,
              passwordHash: await bcrypt.hash('password123', 10),
            },
          });

          const customer = await prisma.customer.create({
            data: {
              phoneNumber: uniquePhone,
              userId: user.id,
            },
          });

          // Create message
          const message = await prisma.message.create({
            data: {
              content,
              type,
              direction,
              imageUrl: type === 'image' ? imageUrl : undefined,
              customerId: customer.id,
            },
          });

          // Verify all fields are stored correctly
          expect(message.id).toBeDefined();
          expect(message.content).toBe(content);
          expect(message.type).toBe(type);
          expect(message.direction).toBe(direction);
          expect(message.customerId).toBe(customer.id);
          expect(message.createdAt).toBeInstanceOf(Date);
          
          if (type === 'image' && imageUrl) {
            expect(message.imageUrl).toBe(imageUrl);
          }
          
          // Clean up after this iteration
          await prisma.message.delete({ where: { id: message.id } });
          await prisma.customer.delete({ where: { id: customer.id } });
          await prisma.user.delete({ where: { id: user.id } });
        }
      ),
      { numRuns: 20 }
    );
  }, 30000);

  // Validates: Requirements 17.4
  it('should store Order records with all required fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 10, maxLength: 15 }).map(s => '+' + s.replace(/\D/g, '')),
        fc.string({ minLength: 5, maxLength: 20 }),
        fc.string({ minLength: 3, maxLength: 10 }),
        fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true }),
        fc.constantFrom('pending', 'confirmed', 'cancelled'),
        async (email, phoneNumber, shopifyOrderId, orderNumber, total, status) => {
          // Make email, phone, and shopifyOrderId unique for each iteration
          const uniqueEmail = `${Date.now()}-${Math.random().toString(36).substring(7)}-${email}`;
          const uniquePhone = `${phoneNumber}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
          const uniqueShopifyOrderId = `${shopifyOrderId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
          
          // Create user and customer first
          const user = await prisma.user.create({
            data: {
              email: uniqueEmail,
              passwordHash: await bcrypt.hash('password123', 10),
            },
          });

          const customer = await prisma.customer.create({
            data: {
              phoneNumber: uniquePhone,
              userId: user.id,
            },
          });

          // Create order
          const order = await prisma.order.create({
            data: {
              shopifyOrderId: uniqueShopifyOrderId,
              orderNumber,
              customerName: customer.name || 'Customer',
              customerPhone: uniquePhone,
              total,
              status,
              userId: user.id,
              customerId: customer.id,
            },
          });

          // Verify all fields are stored correctly
          expect(order.id).toBeDefined();
          expect(order.shopifyOrderId).toBe(uniqueShopifyOrderId);
          expect(order.orderNumber).toBe(orderNumber);
          // Use toBeCloseTo for floating point comparison to handle precision issues
          expect(order.total).toBeCloseTo(total, 10);
          expect(order.status).toBe(status);
          expect(order.userId).toBe(user.id);
          expect(order.customerId).toBe(customer.id);
          expect(order.createdAt).toBeInstanceOf(Date);
          expect(order.updatedAt).toBeInstanceOf(Date);
          
          // Clean up after this iteration
          await prisma.order.delete({ where: { id: order.id } });
          await prisma.customer.delete({ where: { id: customer.id } });
          await prisma.user.delete({ where: { id: user.id } });
        }
      ),
      { numRuns: 20 }
    );
  }, 30000);
});

// Feature: whatsapp-shopify-crm, Property 32: Referential integrity enforcement
describe('Property 32: Referential integrity enforcement', () => {
  beforeEach(async () => {
    // Clean up before each test
    await prisma.message.deleteMany();
    await prisma.order.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.user.deleteMany();
  });

  // Validates: Requirements 17.5
  it('should reject creating a Customer with invalid userId (foreign key constraint)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10, maxLength: 15 }).map(s => '+' + s.replace(/\D/g, '')),
        fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
        fc.uuid(),
        async (phoneNumber, name, invalidUserId) => {
          const uniquePhone = `${phoneNumber}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
          
          // Attempt to create customer with non-existent userId
          await expect(
            prisma.customer.create({
              data: {
                phoneNumber: uniquePhone,
                name,
                userId: invalidUserId,
              },
            })
          ).rejects.toThrow();
        }
      ),
      { numRuns: 20 }
    );
  }, 30000);

  // Validates: Requirements 17.6
  it('should reject creating a Message with invalid customerId (foreign key constraint)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 500 }),
        fc.constantFrom('text', 'image'),
        fc.constantFrom('incoming', 'outgoing'),
        fc.uuid(),
        async (content, type, direction, invalidCustomerId) => {
          // Attempt to create message with non-existent customerId
          await expect(
            prisma.message.create({
              data: {
                content,
                type,
                direction,
                customerId: invalidCustomerId,
              },
            })
          ).rejects.toThrow();
        }
      ),
      { numRuns: 20 }
    );
  }, 30000);

  // Validates: Requirements 17.7
  it('should reject creating an Order with invalid customerId (foreign key constraint)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 5, maxLength: 20 }),
        fc.string({ minLength: 3, maxLength: 10 }),
        fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true }),
        fc.constantFrom('pending', 'confirmed', 'cancelled'),
        fc.uuid(),
        async (email, shopifyOrderId, orderNumber, total, status, invalidCustomerId) => {
          const uniqueEmail = `${Date.now()}-${Math.random().toString(36).substring(7)}-${email}`;
          const uniqueShopifyOrderId = `${shopifyOrderId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
          
          // Create a valid user first (required for Order)
          const user = await prisma.user.create({
            data: {
              email: uniqueEmail,
              passwordHash: await bcrypt.hash('password123', 10),
            },
          });

          // Attempt to create order with non-existent customerId
          await expect(
            prisma.order.create({
              data: {
                shopifyOrderId: uniqueShopifyOrderId,
                orderNumber,
                customerName: 'Test Customer',
                customerPhone: '+1234567890',
                total,
                status,
                userId: user.id,
                customerId: invalidCustomerId,
              },
            })
          ).rejects.toThrow();
          
          // Clean up
          await prisma.user.delete({ where: { id: user.id } });
        }
      ),
      { numRuns: 20 }
    );
  }, 30000);

  // Additional test: Verify cascade delete behavior for Customer -> Messages
  it('should cascade delete Messages when Customer is deleted', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 10, maxLength: 15 }).map(s => '+' + s.replace(/\D/g, '')),
        fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 5 }),
        async (email, phoneNumber, messageContents) => {
          const uniqueEmail = `${Date.now()}-${Math.random().toString(36).substring(7)}-${email}`;
          const uniquePhone = `${phoneNumber}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
          
          // Create user and customer
          const user = await prisma.user.create({
            data: {
              email: uniqueEmail,
              passwordHash: await bcrypt.hash('password123', 10),
            },
          });

          const customer = await prisma.customer.create({
            data: {
              phoneNumber: uniquePhone,
              userId: user.id,
            },
          });

          // Create multiple messages for the customer
          const messages = await Promise.all(
            messageContents.map(content =>
              prisma.message.create({
                data: {
                  content,
                  type: 'text',
                  direction: 'incoming',
                  customerId: customer.id,
                },
              })
            )
          );

          // Verify messages exist
          const messageCount = await prisma.message.count({
            where: { customerId: customer.id },
          });
          expect(messageCount).toBe(messageContents.length);

          // Delete customer (should cascade delete messages)
          await prisma.customer.delete({ where: { id: customer.id } });

          // Verify messages are deleted
          const remainingMessages = await prisma.message.count({
            where: { customerId: customer.id },
          });
          expect(remainingMessages).toBe(0);

          // Clean up
          await prisma.user.delete({ where: { id: user.id } });
        }
      ),
      { numRuns: 20 }
    );
  }, 30000);

  // Additional test: Verify cascade delete behavior for User -> Customers
  it('should cascade delete Customers (and their Messages) when User is deleted', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.array(
          fc.tuple(
            fc.string({ minLength: 10, maxLength: 15 }).map(s => '+' + s.replace(/\D/g, '')),
            fc.string({ minLength: 1, maxLength: 100 })
          ),
          { minLength: 1, maxLength: 3 }
        ),
        async (email, customerData) => {
          const uniqueEmail = `${Date.now()}-${Math.random().toString(36).substring(7)}-${email}`;
          
          // Create user
          const user = await prisma.user.create({
            data: {
              email: uniqueEmail,
              passwordHash: await bcrypt.hash('password123', 10),
            },
          });

          // Create multiple customers with messages
          const customers = await Promise.all(
            customerData.map(([phone, messageContent]) => {
              const uniquePhone = `${phone}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
              return prisma.customer.create({
                data: {
                  phoneNumber: uniquePhone,
                  userId: user.id,
                  messages: {
                    create: {
                      content: messageContent,
                      type: 'text',
                      direction: 'incoming',
                    },
                  },
                },
              });
            })
          );

          // Verify customers and messages exist
          const customerCount = await prisma.customer.count({
            where: { userId: user.id },
          });
          expect(customerCount).toBe(customerData.length);

          const messageCount = await prisma.message.count({
            where: { customerId: { in: customers.map(c => c.id) } },
          });
          expect(messageCount).toBe(customerData.length);

          // Delete user (should cascade delete customers and their messages)
          await prisma.user.delete({ where: { id: user.id } });

          // Verify customers are deleted
          const remainingCustomers = await prisma.customer.count({
            where: { userId: user.id },
          });
          expect(remainingCustomers).toBe(0);

          // Verify messages are deleted
          const remainingMessages = await prisma.message.count({
            where: { customerId: { in: customers.map(c => c.id) } },
          });
          expect(remainingMessages).toBe(0);
        }
      ),
      { numRuns: 20 }
    );
  }, 30000);
});

// Feature: crm-integration-settings, Property: Database schema extensions
describe('CRM Integration Settings Schema Extensions', () => {
  beforeEach(async () => {
    // Clean up before each test
    await prisma.webhookLog.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.oAuthState.deleteMany();
    await prisma.processedWebhook.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    // Final cleanup
    await prisma.webhookLog.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.oAuthState.deleteMany();
    await prisma.processedWebhook.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should store User with new CRM integration fields', async () => {
    const uniqueEmail = `${Date.now()}-${Math.random().toString(36).substring(7)}@test.com`;
    const uniqueUsername = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const user = await prisma.user.create({
      data: {
        email: uniqueEmail,
        username: uniqueUsername,
        passwordHash: await bcrypt.hash('password123', 10),
        shopifyAccessToken: 'encrypted_token_123',
        shopifyWebhookId: 'webhook_id_123',
        n8nWebhookSecret: 'encrypted_secret_123',
      },
    });

    expect(user.username).toBe(uniqueUsername);
    expect(user.shopifyAccessToken).toBe('encrypted_token_123');
    expect(user.shopifyWebhookId).toBe('webhook_id_123');
    expect(user.n8nWebhookSecret).toBe('encrypted_secret_123');

    await prisma.user.delete({ where: { id: user.id } });
  });

  it('should store AuditLog records with all required fields', async () => {
    const uniqueEmail = `${Date.now()}-${Math.random().toString(36).substring(7)}@test.com`;
    
    const user = await prisma.user.create({
      data: {
        email: uniqueEmail,
        passwordHash: await bcrypt.hash('password123', 10),
      },
    });

    const auditLog = await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'email_update',
        ipAddress: '192.168.1.1',
        metadata: JSON.stringify({ oldEmail: 'old@test.com', newEmail: uniqueEmail }),
      },
    });

    expect(auditLog.userId).toBe(user.id);
    expect(auditLog.action).toBe('email_update');
    expect(auditLog.ipAddress).toBe('192.168.1.1');
    expect(auditLog.createdAt).toBeInstanceOf(Date);

    await prisma.auditLog.delete({ where: { id: auditLog.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('should store OAuthState records with unique state', async () => {
    const uniqueEmail = `${Date.now()}-${Math.random().toString(36).substring(7)}@test.com`;
    const uniqueState = `state_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const user = await prisma.user.create({
      data: {
        email: uniqueEmail,
        passwordHash: await bcrypt.hash('password123', 10),
      },
    });

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    const oauthState = await prisma.oAuthState.create({
      data: {
        userId: user.id,
        state: uniqueState,
        expiresAt,
      },
    });

    expect(oauthState.userId).toBe(user.id);
    expect(oauthState.state).toBe(uniqueState);
    expect(oauthState.expiresAt).toEqual(expiresAt);
    expect(oauthState.createdAt).toBeInstanceOf(Date);

    await prisma.oAuthState.delete({ where: { id: oauthState.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('should store WebhookLog records with all required fields', async () => {
    const uniqueEmail = `${Date.now()}-${Math.random().toString(36).substring(7)}@test.com`;
    const correlationId = `corr_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const user = await prisma.user.create({
      data: {
        email: uniqueEmail,
        passwordHash: await bcrypt.hash('password123', 10),
      },
    });

    const webhookLog = await prisma.webhookLog.create({
      data: {
        userId: user.id,
        direction: 'outgoing',
        eventType: 'order_created',
        status: 'success',
        correlationId,
        payload: JSON.stringify({ orderId: '123', total: 99.99 }),
      },
    });

    expect(webhookLog.userId).toBe(user.id);
    expect(webhookLog.direction).toBe('outgoing');
    expect(webhookLog.eventType).toBe('order_created');
    expect(webhookLog.status).toBe('success');
    expect(webhookLog.correlationId).toBe(correlationId);
    expect(webhookLog.createdAt).toBeInstanceOf(Date);

    await prisma.webhookLog.delete({ where: { id: webhookLog.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('should store ProcessedWebhook records with unique idempotency key', async () => {
    const uniqueEmail = `${Date.now()}-${Math.random().toString(36).substring(7)}@test.com`;
    const idempotencyKey = `idem_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const user = await prisma.user.create({
      data: {
        email: uniqueEmail,
        passwordHash: await bcrypt.hash('password123', 10),
      },
    });

    const processedWebhook = await prisma.processedWebhook.create({
      data: {
        idempotencyKey,
        userId: user.id,
        source: 'shopify',
      },
    });

    expect(processedWebhook.idempotencyKey).toBe(idempotencyKey);
    expect(processedWebhook.userId).toBe(user.id);
    expect(processedWebhook.source).toBe('shopify');
    expect(processedWebhook.processedAt).toBeInstanceOf(Date);

    await prisma.processedWebhook.delete({ where: { id: processedWebhook.id } });
    await prisma.user.delete({ where: { id: user.id } });
  });

  it('should enforce unique constraint on username', async () => {
    const uniqueEmail1 = `${Date.now()}-${Math.random().toString(36).substring(7)}@test.com`;
    const uniqueEmail2 = `${Date.now()}-${Math.random().toString(36).substring(7)}-2@test.com`;
    const username = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const user1 = await prisma.user.create({
      data: {
        email: uniqueEmail1,
        username,
        passwordHash: await bcrypt.hash('password123', 10),
      },
    });

    // Attempt to create another user with the same username
    await expect(
      prisma.user.create({
        data: {
          email: uniqueEmail2,
          username,
          passwordHash: await bcrypt.hash('password456', 10),
        },
      })
    ).rejects.toThrow();

    await prisma.user.delete({ where: { id: user1.id } });
  });

  it('should cascade delete related records when User is deleted', async () => {
    const uniqueEmail = `${Date.now()}-${Math.random().toString(36).substring(7)}@test.com`;
    
    const user = await prisma.user.create({
      data: {
        email: uniqueEmail,
        passwordHash: await bcrypt.hash('password123', 10),
      },
    });

    // Create related records
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'test_action',
      },
    });

    await prisma.oAuthState.create({
      data: {
        userId: user.id,
        state: `state_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    await prisma.webhookLog.create({
      data: {
        userId: user.id,
        direction: 'incoming',
        eventType: 'test_event',
        status: 'success',
        correlationId: `corr_${Date.now()}`,
      },
    });

    // Verify records exist
    const auditLogCount = await prisma.auditLog.count({ where: { userId: user.id } });
    const oauthStateCount = await prisma.oAuthState.count({ where: { userId: user.id } });
    const webhookLogCount = await prisma.webhookLog.count({ where: { userId: user.id } });

    expect(auditLogCount).toBe(1);
    expect(oauthStateCount).toBe(1);
    expect(webhookLogCount).toBe(1);

    // Delete user (should cascade delete related records)
    await prisma.user.delete({ where: { id: user.id } });

    // Verify related records are deleted
    const remainingAuditLogs = await prisma.auditLog.count({ where: { userId: user.id } });
    const remainingOAuthStates = await prisma.oAuthState.count({ where: { userId: user.id } });
    const remainingWebhookLogs = await prisma.webhookLog.count({ where: { userId: user.id } });

    expect(remainingAuditLogs).toBe(0);
    expect(remainingOAuthStates).toBe(0);
    expect(remainingWebhookLogs).toBe(0);
  });
});
