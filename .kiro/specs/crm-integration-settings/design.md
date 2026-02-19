# Design Document: CRM Integration Settings Module

## Overview

The CRM Integration Settings Module provides a comprehensive settings management system that enables users to configure their account details, establish webhook integrations with n8n for WhatsApp automation, and connect their Shopify stores via OAuth 2.0 for order synchronization. The system is built with a multi-tenant architecture ensuring complete data isolation between users, robust security through encryption and signature verification, and comprehensive audit logging for compliance and troubleshooting.

### Key Features

- **Account Settings Management**: Secure update of email, username, and password with validation and audit logging
- **n8n Webhook Integration**: Bidirectional webhook communication for WhatsApp automation workflows
- **Shopify OAuth Integration**: Secure OAuth 2.0 connection with automatic webhook registration for order synchronization
- **Multi-Tenancy**: Complete data isolation with tenant-specific settings and webhooks
- **Security**: AES-256-GCM encryption for secrets, HMAC verification, state-based CSRF protection
- **Observability**: Structured logging with correlation IDs, audit trails, and metrics

### Technology Stack

- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt password hashing
- **Encryption**: Node.js crypto module (AES-256-GCM)
- **Testing**: Jest for unit tests, fast-check for property-based tests, Supertest for integration tests
- **Frontend**: React + TypeScript + Vite

## Architecture

### System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[React UI]
        AccountUI[Account Settings]
        WebhookUI[Webhook Settings]
        ShopifyUI[Shopify Integration]
    end
    
    subgraph "API Layer"
        AuthAPI[Auth Controller]
        SettingsAPI[Settings Controller]
        WebhookAPI[Webhook Controller]
        ShopifyAPI[Shopify Controller]
    end
    
    subgraph "Service Layer"
        AuthSvc[Auth Service]
        SettingsSvc[Settings Service]
        WebhookSvc[Webhook Service]
        ShopifySvc[Shopify Service]
        EncryptionSvc[Encryption Service]
        AuditSvc[Audit Service]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL)]
        Prisma[Prisma ORM]
    end
    
    subgraph "External Services"
        n8n[n8n Workflows]
        Shopify[Shopify API]
    end
    
    UI --> AuthAPI
    AccountUI --> SettingsAPI
    WebhookUI --> WebhookAPI
    ShopifyUI --> ShopifyAPI
    
    AuthAPI --> AuthSvc
    SettingsAPI --> SettingsSvc
    WebhookAPI --> WebhookSvc
    ShopifyAPI --> ShopifySvc
    
    AuthSvc --> Prisma
    SettingsSvc --> EncryptionSvc
    SettingsSvc --> AuditSvc
    SettingsSvc --> Prisma
    WebhookSvc --> Prisma
    ShopifySvc --> EncryptionSvc
    ShopifySvc --> Prisma
    
    Prisma --> DB
    
    WebhookSvc --> n8n
    n8n --> WebhookAPI
    ShopifySvc --> Shopify
    Shopify --> WebhookAPI
```

### Security Architecture

```mermaid
graph LR
    subgraph "Request Flow"
        Client[Client Request]
        RateLimit[Rate Limiter]
        Auth[JWT Auth]
        Validate[Input Validation]
        Controller[Controller]
    end
    
    subgraph "Data Protection"
        Encrypt[Encryption Service]
        Decrypt[Decryption Service]
        DB[(Encrypted Storage)]
    end
    
    subgraph "Webhook Security"
        HMAC[HMAC Verification]
        State[State Validation]
        Signature[Signature Check]
    end
    
    Client --> RateLimit
    RateLimit --> Auth
    Auth --> Validate
    Validate --> Controller
    
    Controller --> Encrypt
    Encrypt --> DB
    DB --> Decrypt
    Decrypt --> Controller
    
    Client --> HMAC
    Client --> State
    Client --> Signature
```

### Multi-Tenancy Model

The system implements a tenant-per-user model where each user represents an isolated tenant:

- **Tenant Identification**: User ID serves as tenant identifier
- **Data Isolation**: All queries filtered by tenant ID at service layer
- **Webhook Routing**: Tenant-specific webhook endpoints include tenant ID in URL path
- **Settings Isolation**: Each tenant has independent settings, secrets, and connections

## Components and Interfaces

### 1. Account Settings Components

#### AccountSettingsController

Handles HTTP requests for account settings updates.

```typescript
class AccountSettingsController {
  /**
   * Update user email
   * PUT /api/account/email
   * Requires: JWT authentication, current password
   */
  static async updateEmail(req: AuthRequest, res: Response): Promise<void>
  
  /**
   * Update username
   * PUT /api/account/username
   * Requires: JWT authentication
   */
  static async updateUsername(req: AuthRequest, res: Response): Promise<void>
  
  /**
   * Update password
   * PUT /api/account/password
   * Requires: JWT authentication, current password
   */
  static async updatePassword(req: AuthRequest, res: Response): Promise<void>
  
  /**
   * Get account audit log
   * GET /api/account/audit-log
   * Requires: JWT authentication
   */
  static async getAuditLog(req: AuthRequest, res: Response): Promise<void>
}
```

#### AccountSettingsService

Business logic for account management.

```typescript
class AccountSettingsService {
  /**
   * Update user email with validation
   * Validates format, uniqueness, and creates audit log
   */
  async updateEmail(userId: string, newEmail: string, currentPassword: string): Promise<User>
  
  /**
   * Update username with validation
   * Validates format, uniqueness, and creates audit log
   */
  async updateUsername(userId: string, newUsername: string): Promise<User>
  
  /**
   * Update password with validation
   * Validates current password, strength requirements, hashes new password
   */
  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>
  
  /**
   * Validate email format and uniqueness
   */
  async validateEmail(email: string, excludeUserId?: string): Promise<boolean>
  
  /**
   * Validate username format and uniqueness
   */
  async validateUsername(username: string, excludeUserId?: string): Promise<boolean>
  
  /**
   * Validate password strength
   * Requirements: min 8 chars, uppercase, lowercase, number, special char
   */
  validatePasswordStrength(password: string): { valid: boolean; errors: string[] }
}
```

### 2. n8n Webhook Components

#### WebhookSettingsController

Handles webhook configuration requests.

```typescript
class WebhookSettingsController {
  /**
   * Get webhook settings for current user
   * GET /api/webhooks/settings
   * Returns: outgoing URL (masked), incoming endpoint, webhook secret (masked)
   */
  static async getSettings(req: AuthRequest, res: Response): Promise<void>
  
  /**
   * Update outgoing webhook URL
   * PUT /api/webhooks/outgoing
   * Tests connectivity before saving
   */
  static async updateOutgoingWebhook(req: AuthRequest, res: Response): Promise<void>
  
  /**
   * Generate new webhook secret
   * POST /api/webhooks/secret/regenerate
   * Returns: new secret (shown once)
   */
  static async regenerateSecret(req: AuthRequest, res: Response): Promise<void>
  
  /**
   * Test outgoing webhook
   * POST /api/webhooks/test
   * Sends test payload with signature
   */
  static async testWebhook(req: AuthRequest, res: Response): Promise<void>
  
  /**
   * Handle incoming webhook from n8n
   * POST /api/webhooks/incoming/:tenantId
   * Verifies signature and processes payload
   */
  static async handleIncoming(req: Request, res: Response): Promise<void>
}
```

#### WebhookService

Business logic for webhook operations.

```typescript
class WebhookService {
  /**
   * Validate webhook URL format (must be HTTPS)
   */
  validateWebhookUrl(url: string): boolean
  
  /**
   * Store outgoing webhook URL (encrypted)
   */
  async saveOutgoingWebhook(userId: string, url: string): Promise<void>
  
  /**
   * Generate cryptographically secure webhook secret (32+ chars)
   */
  generateWebhookSecret(): string
  
  /**
   * Store webhook secret (encrypted)
   */
  async saveWebhookSecret(userId: string, secret: string): Promise<void>
  
  /**
   * Send test payload to outgoing webhook
   * Includes signature header for verification
   */
  async sendTestPayload(url: string, secret: string): Promise<{ success: boolean; error?: string }>
  
  /**
   * Verify incoming webhook signature
   * Uses HMAC-SHA256
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean
  
  /**
   * Process incoming webhook payload
   * Logs event and triggers appropriate actions
   */
  async processIncomingWebhook(tenantId: string, payload: any): Promise<void>
  
  /**
   * Send event to outgoing webhook with retry logic
   * Retries up to 3 times with exponential backoff
   */
  async sendWebhookEvent(userId: string, eventType: string, data: any): Promise<void>
}
```

### 3. Shopify Integration Components

#### ShopifyController

Handles Shopify OAuth and webhook requests.

```typescript
class ShopifyController {
  /**
   * Initiate Shopify OAuth flow
   * GET /api/shopify/connect
   * Generates authorization URL with state parameter
   */
  static async initiateOAuth(req: AuthRequest, res: Response): Promise<void>
  
  /**
   * Handle OAuth callback
   * GET /api/shopify/callback
   * Verifies HMAC and state, exchanges code for token
   */
  static async handleCallback(req: Request, res: Response): Promise<void>
  
  /**
   * Get Shopify connection status
   * GET /api/shopify/status
   * Returns: connected status, shop domain
   */
  static async getStatus(req: AuthRequest, res: Response): Promise<void>
  
  /**
   * Test Shopify connection
   * POST /api/shopify/test
   * Makes authenticated API call to verify token
   */
  static async testConnection(req: AuthRequest, res: Response): Promise<void>
  
  /**
   * Disconnect Shopify
   * DELETE /api/shopify/disconnect
   * Deletes token and webhooks
   */
  static async disconnect(req: AuthRequest, res: Response): Promise<void>
  
  /**
   * Handle Shopify orders webhook
   * POST /api/shopify/webhooks/orders/:tenantId
   * Verifies HMAC and processes order
   */
  static async handleOrderWebhook(req: Request, res: Response): Promise<void>
}
```

#### ShopifyService

Business logic for Shopify integration.

```typescript
class ShopifyService {
  /**
   * Generate OAuth authorization URL
   * Includes state parameter for CSRF protection
   */
  generateAuthUrl(shopDomain: string, userId: string): { url: string; state: string }
  
  /**
   * Store OAuth state temporarily (15 min expiry)
   */
  async storeOAuthState(userId: string, state: string): Promise<void>
  
  /**
   * Verify OAuth state parameter
   */
  async verifyOAuthState(userId: string, state: string): Promise<boolean>
  
  /**
   * Verify Shopify HMAC signature
   * Uses SHA256 with API secret
   */
  verifyHMAC(params: Record<string, string>, hmac: string): boolean
  
  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(shopDomain: string, code: string): Promise<string>
  
  /**
   * Store access token (encrypted)
   */
  async storeAccessToken(userId: string, shopDomain: string, token: string): Promise<void>
  
  /**
   * Create Shopify webhook subscription
   * Topic: orders/create
   */
  async createOrderWebhook(userId: string, shopDomain: string, accessToken: string): Promise<string>
  
  /**
   * Delete Shopify webhook subscription
   */
  async deleteWebhook(shopDomain: string, accessToken: string, webhookId: string): Promise<void>
  
  /**
   * Test Shopify API connection
   * Makes GET request to /admin/api/shop.json
   */
  async testConnection(shopDomain: string, accessToken: string): Promise<{ success: boolean; shopInfo?: any }>
  
  /**
   * Verify Shopify webhook HMAC
   * Uses X-Shopify-Hmac-SHA256 header
   */
  verifyWebhookHMAC(body: string, hmac: string): boolean
  
  /**
   * Process Shopify order webhook
   * Checks idempotency and stores order
   */
  async processOrderWebhook(tenantId: string, order: any): Promise<void>
}
```

### 4. Security Components

#### EncryptionService

Handles encryption and decryption of sensitive data.

```typescript
class EncryptionService {
  /**
   * Encrypt data using AES-256-GCM
   * Returns: base64 encoded string with format: iv:authTag:encrypted
   */
  encrypt(plaintext: string): string
  
  /**
   * Decrypt data using AES-256-GCM
   * Parses format: iv:authTag:encrypted
   */
  decrypt(ciphertext: string): string
  
  /**
   * Generate encryption key from environment variable
   * Validates key length (32 bytes for AES-256)
   */
  private getEncryptionKey(): Buffer
  
  /**
   * Mask sensitive string for display
   * Shows only last N characters
   */
  maskSecret(secret: string, visibleChars: number = 4): string
}
```

#### AuditService

Handles audit logging for security events.

```typescript
class AuditService {
  /**
   * Log account settings change
   */
  async logAccountChange(
    userId: string,
    action: 'email_update' | 'username_update' | 'password_update',
    ipAddress: string,
    metadata?: Record<string, any>
  ): Promise<void>
  
  /**
   * Log webhook event
   */
  async logWebhookEvent(
    tenantId: string,
    direction: 'incoming' | 'outgoing',
    eventType: string,
    status: 'success' | 'failure',
    correlationId: string,
    metadata?: Record<string, any>
  ): Promise<void>
  
  /**
   * Log OAuth event
   */
  async logOAuthEvent(
    userId: string,
    action: 'connect' | 'disconnect' | 'token_refresh',
    shopDomain: string,
    status: 'success' | 'failure',
    metadata?: Record<string, any>
  ): Promise<void>
  
  /**
   * Log security violation
   */
  async logSecurityViolation(
    type: 'hmac_failure' | 'state_mismatch' | 'signature_failure' | 'rate_limit',
    ipAddress: string,
    metadata?: Record<string, any>
  ): Promise<void>
  
  /**
   * Get audit logs for user
   */
  async getAuditLogs(
    userId: string,
    filters?: { startDate?: Date; endDate?: Date; action?: string }
  ): Promise<AuditLog[]>
}
```

### 5. Middleware Components

#### RateLimitMiddleware

Protects webhook endpoints from abuse.

```typescript
/**
 * Rate limit middleware for webhook endpoints
 * Limit: 100 requests per minute per tenant
 */
function webhookRateLimiter(req: Request, res: Response, next: NextFunction): void

/**
 * Rate limit middleware for authentication endpoints
 * Limit: 5 failed attempts, 15 minute lockout
 */
function authRateLimiter(req: Request, res: Response, next: NextFunction): void
```

#### ValidationMiddleware

Validates and sanitizes user input.

```typescript
/**
 * Validate and sanitize account settings update
 */
function validateAccountUpdate(req: Request, res: Response, next: NextFunction): void

/**
 * Validate webhook URL format
 */
function validateWebhookUrl(req: Request, res: Response, next: NextFunction): void

/**
 * Validate Shopify OAuth callback parameters
 */
function validateOAuthCallback(req: Request, res: Response, next: NextFunction): void
```

## Data Models

### Database Schema Extensions

The following models extend the existing Prisma schema:

```prisma
model User {
  id                    String     @id @default(uuid())
  email                 String     @unique
  username              String?    @unique
  password              String
  shopifyDomain         String?
  shopifyAccessToken    String?    // Encrypted
  shopifyWebhookId      String?
  n8nWebhookUrl         String?    // Encrypted
  n8nWebhookSecret      String?    // Encrypted
  createdAt             DateTime   @default(now())
  updatedAt             DateTime   @updatedAt
  
  customers             Customer[]
  orders                Order[]
  auditLogs             AuditLog[]
  oauthStates           OAuthState[]
  webhookLogs           WebhookLog[]
  
  @@map("users")
}

model AuditLog {
  id          String   @id @default(uuid())
  userId      String
  action      String   // email_update, password_update, etc.
  ipAddress   String?
  metadata    Json?    // Additional context
  createdAt   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, createdAt])
  @@map("audit_logs")
}

model OAuthState {
  id          String   @id @default(uuid())
  userId      String
  state       String   @unique
  expiresAt   DateTime
  createdAt   DateTime @default(now())
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([state])
  @@index([expiresAt])
  @@map("oauth_states")
}

model WebhookLog {
  id              String   @id @default(uuid())
  userId          String
  direction       String   // incoming, outgoing
  eventType       String
  status          String   // success, failure
  correlationId   String
  payload         Json?
  error           String?
  createdAt       DateTime @default(now())
  
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId, createdAt])
  @@index([correlationId])
  @@map("webhook_logs")
}

model ProcessedWebhook {
  id              String   @id @default(uuid())
  idempotencyKey  String   @unique
  userId          String
  source          String   // shopify, n8n
  processedAt     DateTime @default(now())
  
  @@index([idempotencyKey])
  @@map("processed_webhooks")
}
```

### TypeScript Interfaces

```typescript
// Request/Response Types
interface UpdateEmailRequest {
  newEmail: string;
  currentPassword: string;
}

interface UpdateUsernameRequest {
  newUsername: string;
}

interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface UpdateWebhookRequest {
  webhookUrl: string;
}

interface ShopifyOAuthCallbackParams {
  code: string;
  hmac: string;
  shop: string;
  state: string;
  timestamp: string;
}

interface ShopifyOrderWebhook {
  id: number;
  order_number: string;
  customer: {
    phone: string;
    first_name: string;
    last_name: string;
  };
  total_price: string;
  line_items: Array<{
    title: string;
    quantity: number;
    price: string;
  }>;
}

// Service Types
interface WebhookTestResult {
  success: boolean;
  statusCode?: number;
  error?: string;
  latency?: number;
}

interface ShopifyConnectionStatus {
  connected: boolean;
  shopDomain?: string;
  connectedAt?: Date;
  webhookActive?: boolean;
}

interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

// Configuration Types
interface EncryptionConfig {
  algorithm: 'aes-256-gcm';
  keyLength: 32;
  ivLength: 16;
  authTagLength: 16;
}

interface WebhookConfig {
  maxRetries: 3;
  retryDelayMs: 1000;
  timeoutMs: 5000;
  signatureHeader: 'X-Webhook-Signature';
}

interface ShopifyConfig {
  apiVersion: '2024-01';
  scopes: ['read_orders', 'write_webhooks'];
  redirectUri: string;
  clientId: string;
  clientSecret: string;
}
```

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/crm"

# JWT
JWT_SECRET="your-jwt-secret-key"

# Encryption
ENCRYPTION_KEY="32-byte-hex-string-for-aes-256"

# Shopify
SHOPIFY_CLIENT_ID="your-shopify-client-id"
SHOPIFY_CLIENT_SECRET="your-shopify-client-secret"
SHOPIFY_REDIRECT_URI="https://your-domain.com/api/shopify/callback"
SHOPIFY_API_VERSION="2024-01"

# Application
APP_URL="https://your-domain.com"
NODE_ENV="production"

# Rate Limiting
WEBHOOK_RATE_LIMIT="100"  # requests per minute
AUTH_RATE_LIMIT="5"       # failed attempts before lockout
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property Reflection

After analyzing all acceptance criteria, the following redundancies were identified and resolved:

- **Encryption properties (8.1, 8.2, 8.3)**: Combined into a single comprehensive property that validates encryption for all sensitive data types
- **HMAC verification properties (4.6, 7.1)**: Combined into a single property for all HMAC verification scenarios
- **Audit logging properties (1.6, 12.1)**: Combined into a single property for all audit-worthy events
- **Webhook logging properties (3.7, 12.2)**: Combined into a single comprehensive webhook logging property
- **Tenant isolation properties (9.1, 9.3, 9.4)**: Combined into a single property that validates tenant isolation across all operations
- **Error response properties (3.5, 7.2)**: Combined into a single property for signature verification failures
- **Success response properties (2.5, 5.4, 7.7)**: Marked as examples rather than properties as they test specific scenarios

### Account Settings Properties

Property 1: Email validation consistency
*For any* email string, the email validation function should consistently accept valid email formats (containing @ and domain) and reject invalid formats
**Validates: Requirements 1.1**

Property 2: Username validation consistency
*For any* username string, the username validation function should consistently accept valid usernames (alphanumeric with allowed special chars) and reject invalid formats
**Validates: Requirements 1.2**

Property 3: Password update requires authentication
*For any* password update request without a valid current password, the system should reject the request and not modify the stored password
**Validates: Requirements 1.3**

Property 4: Password strength validation
*For any* password string, the validation function should accept passwords meeting all strength requirements (min 8 chars, uppercase, lowercase, number, special char) and reject those that don't
**Validates: Requirements 1.4**

Property 5: Password hashing consistency
*For any* stored password in the database, it should be in bcrypt hash format and should never match the plaintext password
**Validates: Requirements 1.5**

Property 6: Audit logging for sensitive operations
*For any* sensitive account operation (email update, username update, password update), an audit log entry should be created with timestamp, user ID, action type, and IP address
**Validates: Requirements 1.6, 12.1**

Property 7: Validation error rollback
*For any* settings update request with invalid data, the system should return validation errors and the database state should remain unchanged
**Validates: Requirements 1.7**

Property 8: Session invalidation after sensitive changes
*For any* successful email or password update, subsequent requests using the old JWT token should be rejected with authentication error
**Validates: Requirements 1.8**

### n8n Webhook Properties

Property 9: Webhook URL HTTPS validation
*For any* webhook URL string, the validation function should accept only HTTPS URLs and reject HTTP or invalid URLs
**Validates: Requirements 2.1**

Property 10: Webhook URL encryption round-trip
*For any* valid webhook URL, encrypting then decrypting should produce the original URL
**Validates: Requirements 2.2**

Property 11: Webhook test on save
*For any* webhook URL save operation, a test request should be sent to the URL before the save completes
**Validates: Requirements 2.3**

Property 12: Webhook signature inclusion
*For any* outgoing webhook payload, the request should include a valid HMAC signature header computed from the payload and secret
**Validates: Requirements 2.4**

Property 13: Webhook test failure rollback
*For any* webhook URL that fails connectivity test, the URL should not be saved to the database and an error should be returned
**Validates: Requirements 2.6**

Property 14: Secret masking consistency
*For any* retrieved webhook URL or secret, the displayed value should mask all but the last 4-10 characters
**Validates: Requirements 2.7, 8.6**

Property 15: Tenant-specific webhook endpoints
*For any* two different tenants, their incoming webhook endpoint URLs should be unique and contain their respective tenant IDs
**Validates: Requirements 3.1**

Property 16: Webhook secret generation security
*For any* generated webhook secret, it should be at least 32 characters long and contain cryptographically random bytes
**Validates: Requirements 3.2**

Property 17: Webhook signature verification
*For any* incoming webhook request, if the signature is computed correctly using the stored secret, verification should succeed; if the signature is incorrect or missing, verification should fail
**Validates: Requirements 3.4**

Property 18: Signature verification failure response
*For any* incoming webhook with invalid signature, the system should return HTTP 401 status and not process the payload
**Validates: Requirements 3.5, 7.2**

Property 19: Webhook processing success response
*For any* incoming webhook with valid signature, the system should process the payload and return HTTP 200 status
**Validates: Requirements 3.6**

Property 20: Webhook event logging
*For any* webhook sent or received, a log entry should be created with timestamp, tenant ID, direction, event type, status, and correlation ID
**Validates: Requirements 3.7, 12.2**

Property 21: Webhook processing error response
*For any* webhook processing that encounters an error, the system should return HTTP 500 status with error details
**Validates: Requirements 3.8**

### Shopify OAuth Properties

Property 22: OAuth URL scope inclusion
*For any* generated Shopify authorization URL, it should include the required scopes (read_orders, write_webhooks) in the query parameters
**Validates: Requirements 4.1**

Property 23: OAuth state parameter security
*For any* generated OAuth state parameter, it should be at least 32 characters long and cryptographically random
**Validates: Requirements 4.2**

Property 24: OAuth state storage and retrieval
*For any* generated OAuth state, storing it then retrieving it within the expiry period should return the same state value
**Validates: Requirements 4.3**

Property 25: OAuth state verification
*For any* OAuth callback, if the provided state matches the stored state, verification should succeed; if it doesn't match or is missing, verification should fail
**Validates: Requirements 4.4**

Property 26: OAuth state mismatch rejection
*For any* OAuth callback with mismatched or missing state, the system should reject the request and return an error without proceeding to token exchange
**Validates: Requirements 4.5**

Property 27: HMAC verification for all signatures
*For any* request containing an HMAC signature (OAuth callback or webhook), the system should verify it using the appropriate secret and reject requests with invalid signatures
**Validates: Requirements 4.6, 7.1**

Property 28: HMAC failure security logging
*For any* HMAC verification failure, the system should log a security warning with timestamp, IP address, and failure details
**Validates: Requirements 4.7**

Property 29: Access token encryption round-trip
*For any* Shopify access token, encrypting then decrypting should produce the original token
**Validates: Requirements 4.9, 8.3**

Property 30: Connection status update on token storage
*For any* successful access token storage, the Shopify connection status should be marked as active for that tenant
**Validates: Requirements 4.10**

### Shopify Connection Management Properties

Property 31: Connection status accuracy
*For any* tenant, the displayed Shopify connection status should match the actual presence of a valid access token in the database
**Validates: Requirements 5.1**

Property 32: Shop domain display for active connections
*For any* tenant with an active Shopify connection, the displayed shop domain should match the stored shop domain
**Validates: Requirements 5.2**

Property 33: Connection test authentication
*For any* Shopify connection test request, the API call should include the stored access token in the authorization header
**Validates: Requirements 5.3**

Property 34: Token deletion on disconnect
*For any* Shopify disconnect operation, the stored access token should be deleted from the database
**Validates: Requirements 5.6**

Property 35: Webhook cleanup on disconnect
*For any* Shopify disconnect operation, all associated webhook subscriptions should be deleted from Shopify
**Validates: Requirements 5.7**

### Shopify Webhook Properties

Property 36: Automatic webhook creation on connection
*For any* successful Shopify connection establishment, an orders/create webhook subscription should be automatically created
**Validates: Requirements 6.1**

Property 37: Tenant-specific webhook callback URLs
*For any* two different tenants with Shopify connections, their webhook callback URLs should be unique and contain their respective tenant IDs
**Validates: Requirements 6.2**

Property 38: Webhook ID storage
*For any* successfully created Shopify webhook, the webhook ID should be stored in the database associated with the tenant
**Validates: Requirements 6.3**

Property 39: Webhook creation error handling
*For any* failed webhook creation attempt, the error should be logged and the user should be notified
**Validates: Requirements 6.4**

Property 40: Webhook deletion on disconnect
*For any* Shopify disconnect operation, the webhook subscription should be deleted using the stored webhook ID
**Validates: Requirements 6.5**

Property 41: Order data extraction on valid webhook
*For any* Shopify order webhook with valid HMAC, the system should extract order data including order number, customer info, and line items
**Validates: Requirements 7.3**

Property 42: Idempotency key checking
*For any* incoming Shopify order, the system should check if an order with the same order ID has already been processed
**Validates: Requirements 7.4**

Property 43: Idempotent duplicate handling
*For any* duplicate Shopify order (same order ID), the system should return HTTP 200 without reprocessing or creating duplicate database entries
**Validates: Requirements 7.5**

Property 44: New order storage
*For any* new Shopify order (not previously processed), the system should store it in the database with tenant association
**Validates: Requirements 7.6**

Property 45: Order processing error logging
*For any* order processing that fails, the error should be logged with full details and HTTP 500 status returned
**Validates: Requirements 7.8**

### Security and Encryption Properties

Property 46: Sensitive data encryption
*For any* sensitive data (webhook URLs, webhook secrets, access tokens), when stored in the database, it should be encrypted using AES-256-GCM and the stored value should not match the plaintext
**Validates: Requirements 8.1, 8.2, 8.3**

Property 47: Encryption round-trip consistency
*For any* plaintext string, encrypting then decrypting should produce the original plaintext
**Validates: Requirements 8.4**

Property 48: Log sanitization
*For any* log entry, it should not contain plaintext secrets, tokens, or passwords
**Validates: Requirements 8.5**

### Multi-Tenancy Properties

Property 49: Tenant data isolation
*For any* authenticated user request, all returned data should belong only to that user's tenant and should not include data from other tenants
**Validates: Requirements 9.1, 9.3, 9.4**

Property 50: Webhook tenant routing
*For any* incoming webhook request, the system should route it to the correct tenant based on the tenant ID in the endpoint URL
**Validates: Requirements 9.2**

Property 51: Cross-tenant access prevention
*For any* API request attempting to access another tenant's data (by manipulating IDs), the system should reject the request with authorization error
**Validates: Requirements 9.5**

### Rate Limiting and Security Properties

Property 52: Webhook rate limiting
*For any* tenant, if more than 100 webhook requests are received within a 1-minute window, subsequent requests should be rejected with HTTP 429 status
**Validates: Requirements 10.1**

Property 53: Rate limit response headers
*For any* rate-limited request, the response should include HTTP 429 status and a Retry-After header indicating when to retry
**Validates: Requirements 10.2**

Property 54: Account lockout on failed authentication
*For any* account, if 5 consecutive authentication attempts fail, the account should be temporarily locked for 15 minutes
**Validates: Requirements 10.3**

Property 55: Input sanitization
*For any* user input containing potentially malicious content (SQL injection, XSS), the sanitization function should remove or escape the malicious content
**Validates: Requirements 10.4**

Property 56: Webhook payload schema validation
*For any* incoming webhook payload, if it doesn't match the expected schema, the system should reject it with validation error
**Validates: Requirements 10.5**

### Error Handling and Retry Properties

Property 57: Outgoing webhook retry with exponential backoff
*For any* failed outgoing webhook call, the system should retry up to 3 times with exponentially increasing delays (1s, 2s, 4s)
**Validates: Requirements 11.1**

Property 58: Retry exhaustion logging
*For any* outgoing webhook that fails after all retries, the failure should be logged with full error details
**Validates: Requirements 11.2**

Property 59: Failed webhook queuing
*For any* incoming webhook that fails processing, the event should be queued for retry
**Validates: Requirements 11.3**

Property 60: Network error retry
*For any* Shopify API call that fails with network error, the system should retry with exponential backoff
**Validates: Requirements 11.4**

Property 61: Validation error messages
*For any* validation error, the returned error message should be user-friendly and specify which field failed validation and why
**Validates: Requirements 11.5**

Property 62: Unexpected error handling
*For any* unexpected error, the full error details should be logged but only a generic error message should be returned to the user
**Validates: Requirements 11.6**

### Observability Properties

Property 63: OAuth event logging
*For any* OAuth flow completion (connect, disconnect, token refresh), an event should be logged with timestamp, user ID, shop domain, and status
**Validates: Requirements 12.3**

Property 64: Security violation logging
*For any* security violation (HMAC failure, state mismatch, signature failure, rate limit), a detailed security event should be logged
**Validates: Requirements 12.4**

Property 65: Structured logging format
*For any* log entry, it should be in valid JSON format with consistent field names
**Validates: Requirements 12.5**

Property 66: Correlation ID propagation
*For any* request that triggers multiple operations, all related log entries should share the same correlation ID
**Validates: Requirements 12.6**

Property 67: Metrics availability
*For any* time period, the system should expose metrics for webhook counts, failure rates, and processing latency
**Validates: Requirements 12.7**

### Configuration and Serialization Properties

Property 68: Configuration validation on startup
*For any* invalid configuration value (wrong format, out of range), the system should detect it during startup and log specific validation errors
**Validates: Requirements 13.3**

Property 69: Shopify credentials validation
*For any* Shopify API credentials, the system should validate the format before attempting OAuth flows
**Validates: Requirements 13.4**

Property 70: Encryption key validation
*For any* encryption key, the system should validate it is exactly 32 bytes for AES-256 on startup
**Validates: Requirements 13.5**

Property 71: Shopify order serialization round-trip
*For any* valid Shopify order object, serializing to JSON then deserializing should produce an equivalent object with the same order number, customer info, and line items
**Validates: Requirements 14.3**

Property 72: Serialization error handling
*For any* object that fails serialization, the error should be logged and a descriptive error message returned
**Validates: Requirements 14.4**

Property 73: Deserialization error handling
*For any* invalid JSON string, the deserialization function should handle the error gracefully without crashing
**Validates: Requirements 14.5**

Property 74: Webhook payload structure consistency
*For any* outgoing webhook payload, it should be valid JSON and include timestamp, event type, and tenant ID fields
**Validates: Requirements 15.1, 15.2**

Property 75: Incoming webhook schema validation
*For any* incoming webhook payload that doesn't match the expected schema, the system should reject it with validation error
**Validates: Requirements 15.3**

Property 76: API version inclusion
*For any* outgoing webhook payload, it should include an API version field
**Validates: Requirements 15.4**

## Error Handling

### Error Categories

1. **Validation Errors** (HTTP 400)
   - Invalid email format
   - Weak password
   - Invalid webhook URL
   - Missing required fields
   - Schema validation failures

2. **Authentication Errors** (HTTP 401)
   - Invalid JWT token
   - Expired token
   - Invalid webhook signature
   - Invalid HMAC signature
   - Session invalidated after sensitive change

3. **Authorization Errors** (HTTP 403)
   - Cross-tenant access attempt
   - Insufficient permissions

4. **Not Found Errors** (HTTP 404)
   - User not found
   - Webhook settings not found
   - Shopify connection not found

5. **Conflict Errors** (HTTP 409)
   - Email already exists
   - Username already taken

6. **Rate Limit Errors** (HTTP 429)
   - Webhook rate limit exceeded
   - Authentication rate limit exceeded

7. **Server Errors** (HTTP 500)
   - Database connection failure
   - External API failure
   - Encryption/decryption failure
   - Unexpected errors

### Error Response Format

All errors follow a consistent JSON structure:

```typescript
interface ErrorResponse {
  error: string;              // User-friendly error message
  code: string;               // Machine-readable error code
  timestamp: string;          // ISO 8601 timestamp
  correlationId?: string;     // For request tracing
  details?: Record<string, any>; // Additional context (dev mode only)
}
```

### Retry Logic

**Outgoing Webhooks**:
- Retry count: 3
- Backoff: Exponential (1s, 2s, 4s)
- Retry on: Network errors, 5xx responses
- No retry on: 4xx responses (except 429)

**Shopify API Calls**:
- Retry count: 3
- Backoff: Exponential (1s, 2s, 4s)
- Retry on: Network errors, 429, 5xx responses
- No retry on: 4xx responses (except 429)

**Incoming Webhook Processing**:
- Failed webhooks queued for retry
- Retry count: 5
- Backoff: Exponential (10s, 30s, 1m, 5m, 15m)
- Dead letter queue after exhaustion

### Circuit Breaker

For external service calls (n8n, Shopify):
- Failure threshold: 5 consecutive failures
- Timeout: 30 seconds
- Half-open retry: After 1 minute
- Success threshold to close: 2 consecutive successes

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit tests and property-based tests as complementary approaches:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property-based tests**: Verify universal properties across all inputs
- Together they provide comprehensive coverage

### Unit Testing

Unit tests focus on:
- Specific examples that demonstrate correct behavior
- Integration points between components
- Edge cases (empty strings, null values, boundary conditions)
- Error conditions and error messages
- Mock external services (n8n, Shopify API)

**Test Organization**:
```
backend/src/__tests__/
├── unit/
│   ├── services/
│   │   ├── account-settings.service.test.ts
│   │   ├── webhook.service.test.ts
│   │   ├── shopify.service.test.ts
│   │   ├── encryption.service.test.ts
│   │   └── audit.service.test.ts
│   ├── controllers/
│   │   ├── account-settings.controller.test.ts
│   │   ├── webhook-settings.controller.test.ts
│   │   └── shopify.controller.test.ts
│   └── middleware/
│       ├── rate-limit.middleware.test.ts
│       └── validation.middleware.test.ts
├── integration/
│   ├── account-settings.integration.test.ts
│   ├── webhook-flow.integration.test.ts
│   └── shopify-oauth.integration.test.ts
└── e2e/
    └── settings-flow.e2e.test.ts
```

### Property-Based Testing

Property-based tests use **fast-check** library to verify universal properties across randomized inputs.

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with feature name and property number
- Tag format: `Feature: crm-integration-settings, Property {N}: {property_text}`

**Test Organization**:
```
backend/src/__tests__/
└── properties/
    ├── account-settings.properties.test.ts
    ├── webhook.properties.test.ts
    ├── shopify.properties.test.ts
    ├── encryption.properties.test.ts
    ├── multi-tenancy.properties.test.ts
    └── serialization.properties.test.ts
```

**Example Property Test**:
```typescript
// Feature: crm-integration-settings, Property 47: Encryption round-trip consistency
describe('Encryption round-trip', () => {
  it('should preserve plaintext after encrypt-decrypt cycle', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 1000 }),
        (plaintext) => {
          const encrypted = encryptionService.encrypt(plaintext);
          const decrypted = encryptionService.decrypt(encrypted);
          expect(decrypted).toBe(plaintext);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

Integration tests verify:
- Complete API request/response flows
- Database interactions
- Authentication and authorization
- Multi-component interactions

**Tools**: Supertest for HTTP testing, test database for isolation

### Frontend Testing

Frontend tests use:
- **Vitest** for unit tests
- **React Testing Library** for component tests
- **MSW** (Mock Service Worker) for API mocking

**Test Coverage**:
- Account settings form validation
- Webhook configuration UI
- Shopify connection flow
- Error message display
- Loading states

### Security Testing

Specific security tests for:
- CSRF protection (state parameter validation)
- SQL injection prevention (input sanitization)
- XSS prevention (output encoding)
- HMAC signature verification
- Encryption strength
- Rate limiting effectiveness
- Cross-tenant access prevention

### Performance Testing

Load tests for:
- Webhook endpoint throughput (target: 100 req/min per tenant)
- Database query performance
- Encryption/decryption overhead
- API response times (target: <200ms p95)

**Tools**: Artillery or k6 for load testing

### Test Data Generators

Property-based tests use custom generators:

```typescript
// Generate valid email addresses
const emailArbitrary = fc.emailAddress();

// Generate valid webhook URLs (HTTPS only)
const webhookUrlArbitrary = fc.webUrl({ validSchemes: ['https'] });

// Generate password meeting strength requirements
const strongPasswordArbitrary = fc.string()
  .filter(pwd => 
    pwd.length >= 8 &&
    /[A-Z]/.test(pwd) &&
    /[a-z]/.test(pwd) &&
    /[0-9]/.test(pwd) &&
    /[^A-Za-z0-9]/.test(pwd)
  );

// Generate Shopify order objects
const shopifyOrderArbitrary = fc.record({
  id: fc.integer({ min: 1 }),
  order_number: fc.string(),
  customer: fc.record({
    phone: fc.string(),
    first_name: fc.string(),
    last_name: fc.string()
  }),
  total_price: fc.float({ min: 0 }).map(String),
  line_items: fc.array(fc.record({
    title: fc.string(),
    quantity: fc.integer({ min: 1 }),
    price: fc.float({ min: 0 }).map(String)
  }))
});
```

### Continuous Integration

CI pipeline runs:
1. Linting (ESLint, Prettier)
2. Type checking (TypeScript)
3. Unit tests (Jest)
4. Property-based tests (fast-check)
5. Integration tests
6. Security tests
7. Code coverage report (target: 80%+)

### Test Database

- Separate test database for integration tests
- Database reset before each test suite
- Seed data for consistent test scenarios
- Transaction rollback for test isolation
