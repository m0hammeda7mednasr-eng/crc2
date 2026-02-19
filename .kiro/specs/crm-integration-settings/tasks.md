# Implementation Plan: CRM Integration Settings Module

## Overview

This implementation plan breaks down the CRM Integration Settings Module into discrete, incremental coding tasks. Each task builds on previous work, with property-based tests and unit tests integrated throughout to validate correctness early. The plan follows a bottom-up approach: core utilities → services → controllers → API routes → frontend components.

### Implementation Strategy

1. **Foundation First**: Start with database schema, encryption, and core utilities
2. **Service Layer**: Build business logic with comprehensive testing
3. **API Layer**: Implement controllers and routes with middleware
4. **Frontend Layer**: Create React components with user-friendly interfaces
5. **Observability**: Add logging, metrics, and monitoring
6. **Validation**: Ensure security, performance, and correctness

### Key Principles

- **Incremental Progress**: Each task produces working, testable code
- **Test-Driven**: Property tests and unit tests written alongside implementation
- **Security First**: Encryption, validation, and sanitization at every layer
- **Multi-Tenancy**: Tenant isolation enforced in all data operations
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Observability**: Structured logging and metrics from the start

## Tasks

- [-] 1. Set up database schema and migrations
  - [x] 1.1 Extend Prisma schema with new models
    - Add AuditLog model with userId, action, ipAddress, metadata, createdAt
    - Add OAuthState model with userId, state, expiresAt, createdAt
    - Add WebhookLog model with userId, direction, eventType, status, correlationId, payload, error, createdAt
    - Add ProcessedWebhook model with idempotencyKey, userId, source, processedAt
    - Add indexes for performance (userId+createdAt, state, correlationId, idempotencyKey)
    - _Requirements: 12.1, 4.3, 12.2, 7.4_
  
  - [x] 1.2 Add new fields to User model
    - Add username field (String?, unique)
    - Add shopifyAccessToken field (String? for encrypted token)
    - Add shopifyWebhookId field (String? for webhook subscription ID)
    - Add n8nWebhookSecret field (String? for encrypted secret)
    - Add relations to new models (auditLogs, oauthStates, webhookLogs)
    - _Requirements: 1.2, 4.9, 6.3, 3.2_
  
  - [ ] 1.3 Create and run database migration
    - Generate Prisma migration with descriptive name
    - Review generated SQL for correctness
    - Run migration on development database
    - Update Prisma client
    - Verify schema changes in database
    - _Requirements: All database requirements_

- [x] 2. Implement encryption service
  - [x] 2.1 Create EncryptionService class with AES-256-GCM
    - Implement encrypt() method with IV and auth tag generation
    - Implement decrypt() method with IV and auth tag parsing
    - Implement getEncryptionKey() with validation
    - Implement maskSecret() for UI display
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.6_
  
  - [x] 2.2 Write property test for encryption round-trip
    - **Property 47: Encryption round-trip consistency**
    - **Validates: Requirements 8.4**
  
  - [x] 2.3 Write property test for encryption security
    - **Property 46: Sensitive data encryption**
    - **Validates: Requirements 8.1, 8.2, 8.3**
  
  - [x] 2.4 Write unit tests for encryption edge cases
    - Test empty string encryption
    - Test very long string encryption
    - Test invalid ciphertext decryption
    - Test missing encryption key
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 3. Implement audit logging service
  - [x] 3.1 Create AuditService class
    - Implement logAccountChange() method
    - Implement logWebhookEvent() method
    - Implement logOAuthEvent() method
    - Implement logSecurityViolation() method
    - Implement getAuditLogs() with filtering
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  
  - [x] 3.2 Write property test for audit log creation
    - **Property 6: Audit logging for sensitive operations**
    - **Validates: Requirements 1.6, 12.1**
  
  - [x] 3.3 Write property test for webhook event logging
    - **Property 20: Webhook event logging**
    - **Validates: Requirements 3.7, 12.2**
  
  - [x] 3.4 Write unit tests for audit service
    - Test log entry creation with all fields
    - Test log retrieval with date filters
    - Test correlation ID generation
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [ ] 4. Implement validation utilities
  - [ ] 4.1 Create validation utility functions
    - Implement validateEmail() with comprehensive regex (RFC 5322 compliant)
    - Implement validateUsername() with rules (3-30 chars, alphanumeric + underscore/dash)
    - Implement validatePasswordStrength() checking min 8 chars, uppercase, lowercase, number, special char
    - Implement validateWebhookUrl() ensuring HTTPS protocol and valid URL format
    - Implement sanitizeInput() using DOMPurify or similar for XSS prevention
    - Implement validateShopifyDomain() for Shopify shop domain format
    - Create comprehensive error messages for each validation failure
    - _Requirements: 1.1, 1.2, 1.4, 2.1, 10.4_
  
  - [ ] 4.2 Write property test for email validation
    - **Property 1: Email validation consistency**
    - Generate random valid emails (with @, domain, TLD)
    - Generate random invalid emails (missing @, invalid chars, no domain)
    - Verify validation accepts all valid and rejects all invalid
    - **Validates: Requirements 1.1**
  
  - [ ] 4.3 Write property test for username validation
    - **Property 2: Username validation consistency**
    - Generate random valid usernames (3-30 chars, allowed chars)
    - Generate random invalid usernames (too short, too long, invalid chars)
    - Verify validation accepts all valid and rejects all invalid
    - **Validates: Requirements 1.2**
  
  - [ ] 4.4 Write property test for password strength validation
    - **Property 4: Password strength validation**
    - Generate random passwords with various characteristics
    - Test passwords meeting all requirements are accepted
    - Test passwords missing any requirement are rejected
    - **Validates: Requirements 1.4**
  
  - [ ] 4.5 Write property test for webhook URL validation
    - **Property 9: Webhook URL HTTPS validation**
    - Generate random HTTPS URLs (should accept)
    - Generate random HTTP URLs (should reject)
    - Generate random invalid URLs (should reject)
    - **Validates: Requirements 2.1**
  
  - [ ] 4.6 Write property test for input sanitization
    - **Property 55: Input sanitization**
    - Generate random inputs with SQL injection attempts
    - Generate random inputs with XSS attempts
    - Verify sanitization removes or escapes malicious content
    - **Validates: Requirements 10.4**
  
  - [ ] 4.7 Write unit tests for validation edge cases
    - Test email with special characters in local part
    - Test username with exactly 3 and 30 characters (boundaries)
    - Test password with exactly 8 characters
    - Test URL with query parameters and fragments
    - Test empty string inputs
    - _Requirements: 1.1, 1.2, 1.4, 2.1_

- [ ] 5. Implement account settings service
  - [ ] 5.1 Create AccountSettingsService class
    - Implement updateEmail() with validation and audit logging
    - Implement updateUsername() with validation and audit logging
    - Implement updatePassword() with bcrypt hashing and audit logging
    - Implement validateEmail() with uniqueness check
    - Implement validateUsername() with uniqueness check
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [ ] 5.2 Write property test for password hashing
    - **Property 5: Password hashing consistency**
    - **Validates: Requirements 1.5**
  
  - [ ] 5.3 Write property test for validation error rollback
    - **Property 7: Validation error rollback**
    - **Validates: Requirements 1.7**
  
  - [ ] 5.4 Write unit tests for account settings service
    - Test email update with duplicate email
    - Test password update with wrong current password
    - Test username update with invalid format
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 6. Implement webhook service
  - [ ] 6.1 Create WebhookService class with core methods
    - Implement generateWebhookSecret() using crypto.randomBytes(32) and base64 encoding
    - Implement saveOutgoingWebhook() with encryption and database storage
    - Implement saveWebhookSecret() with encryption and database storage
    - Implement verifyWebhookSignature() using HMAC-SHA256 with constant-time comparison
    - Implement sendTestPayload() using axios with timeout and signature header
    - Implement validateWebhookUrl() ensuring HTTPS and reachability
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.2, 3.3, 3.4_
  
  - [ ] 6.2 Implement webhook event sending with retry
    - Implement sendWebhookEvent() with axios and retry logic
    - Implement exponential backoff (1s, 2s, 4s delays)
    - Implement retry on network errors and 5xx responses
    - Implement no retry on 4xx responses (except 429)
    - Log each retry attempt with correlation ID
    - Log final failure after exhausting retries
    - _Requirements: 11.1, 11.2_
  
  - [ ] 6.3 Implement incoming webhook processing
    - Implement processIncomingWebhook() with signature verification
    - Implement payload schema validation
    - Implement webhook event logging with correlation ID
    - Implement error handling with appropriate HTTP status codes
    - Queue failed webhooks for retry
    - _Requirements: 3.4, 3.5, 3.6, 3.7, 3.8, 11.3_
  
  - [ ] 6.4 Write property test for webhook secret generation
    - **Property 16: Webhook secret generation security**
    - Generate multiple secrets and verify each is at least 32 chars
    - Verify secrets are unique (no duplicates in 1000 generations)
    - Verify secrets contain only base64 characters
    - **Validates: Requirements 3.2**
  
  - [ ] 6.5 Write property test for webhook signature verification
    - **Property 17: Webhook signature verification**
    - For any payload and secret, compute signature and verify it succeeds
    - For any payload with wrong signature, verify verification fails
    - For any payload with missing signature, verify verification fails
    - Test with various payload sizes (empty, small, large)
    - **Validates: Requirements 3.4**
  
  - [ ] 6.6 Write property test for webhook URL encryption
    - **Property 10: Webhook URL encryption round-trip**
    - For any valid HTTPS URL, encrypt then decrypt and verify equality
    - Test with URLs of various lengths
    - Test with URLs containing query parameters
    - **Validates: Requirements 2.2**
  
  - [ ] 6.7 Write property test for webhook retry logic
    - **Property 57: Outgoing webhook retry with exponential backoff**
    - Mock webhook endpoint that fails N times then succeeds
    - Verify retry count matches expected (up to 3)
    - Verify delays follow exponential backoff pattern
    - Verify final success after retries
    - **Validates: Requirements 11.1**
  
  - [ ] 6.8 Write unit tests for webhook service edge cases
    - Test webhook test failure rollback (URL not saved on test failure)
    - Test signature verification with tampered payload
    - Test signature verification with expired timestamp
    - Test retry exhaustion logging (all 3 retries fail)
    - Test webhook processing with invalid JSON payload
    - Test webhook processing with missing required fields
    - _Requirements: 2.6, 3.5, 11.2_

- [ ] 7. Checkpoint - Ensure core services tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement Shopify OAuth service
  - [ ] 8.1 Create ShopifyService class with OAuth methods
    - Implement generateAuthUrl() with state parameter, scopes, redirect URI
    - Implement storeOAuthState() with 15-minute expiry in database
    - Implement verifyOAuthState() with expiry check and deletion after use
    - Implement verifyHMAC() for OAuth callback using SHA256 and API secret
    - Implement exchangeCodeForToken() with Shopify API POST request
    - Implement storeAccessToken() with encryption and shop domain
    - Implement getAccessToken() with decryption for API calls
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6, 4.8, 4.9_
  
  - [ ] 8.2 Implement Shopify connection management
    - Implement testConnection() making GET /admin/api/shop.json request
    - Implement getConnectionStatus() checking token existence and validity
    - Implement disconnect() deleting token and marking connection inactive
    - Implement error handling for expired tokens
    - Implement token refresh logic (if needed)
    - _Requirements: 5.1, 5.2, 5.3, 5.6_
  
  - [ ] 8.3 Write property test for OAuth state generation
    - **Property 23: OAuth state parameter security**
    - Generate multiple states and verify each is at least 32 chars
    - Verify states are cryptographically random (no patterns)
    - Verify states are unique (no duplicates in 1000 generations)
    - **Validates: Requirements 4.2**
  
  - [ ] 8.4 Write property test for OAuth state storage and retrieval
    - **Property 24: OAuth state storage and retrieval**
    - For any generated state, store it then retrieve within expiry
    - Verify retrieved state matches stored state
    - Verify state is deleted after retrieval (one-time use)
    - **Validates: Requirements 4.3**
  
  - [ ] 8.5 Write property test for OAuth state verification
    - **Property 25: OAuth state verification**
    - For any callback with matching state, verification succeeds
    - For any callback with mismatched state, verification fails
    - For any callback with missing state, verification fails
    - For any callback with expired state, verification fails
    - **Validates: Requirements 4.4**
  
  - [ ] 8.6 Write property test for HMAC verification
    - **Property 27: HMAC verification for all signatures**
    - For any OAuth callback params, compute HMAC and verify it succeeds
    - For any callback with wrong HMAC, verification fails
    - For any callback with missing HMAC, verification fails
    - Test with various parameter combinations
    - **Validates: Requirements 4.6, 7.1**
  
  - [ ] 8.7 Write property test for access token encryption
    - **Property 29: Access token encryption round-trip**
    - For any access token string, encrypt then decrypt and verify equality
    - Test with tokens of various lengths
    - Test with tokens containing special characters
    - **Validates: Requirements 4.9, 8.3**
  
  - [ ] 8.8 Write property test for connection status update
    - **Property 30: Connection status update on token storage**
    - For any successful token storage, verify connection marked active
    - For any tenant, verify connection status matches token existence
    - **Validates: Requirements 4.10**
  
  - [ ] 8.9 Write unit tests for Shopify OAuth edge cases
    - Test state mismatch rejection with error message
    - Test HMAC failure logging with security warning
    - Test expired state handling (reject and log)
    - Test token exchange with network error (retry logic)
    - Test connection test with invalid token (401 response)
    - Test disconnect with webhook deletion
    - _Requirements: 4.5, 4.7, 4.3, 5.3, 5.6_

- [ ] 9. Implement Shopify webhook service
  - [ ] 9.1 Extend ShopifyService with webhook methods
    - Implement createOrderWebhook() making POST /admin/api/webhooks.json request
    - Include tenant-specific callback URL in webhook creation
    - Store webhook ID in database after successful creation
    - Implement deleteWebhook() making DELETE /admin/api/webhooks/{id}.json request
    - Implement verifyWebhookHMAC() for X-Shopify-Hmac-SHA256 header
    - Use constant-time comparison for HMAC verification
    - _Requirements: 6.1, 6.2, 6.3, 6.5, 7.1_
  
  - [ ] 9.2 Implement order webhook processing
    - Implement processOrderWebhook() with idempotency check
    - Check ProcessedWebhook table using order ID as idempotency key
    - Extract order data (order_number, customer, total_price, line_items)
    - Store order in database with tenant association
    - Create ProcessedWebhook entry to prevent reprocessing
    - Return HTTP 200 for both new and duplicate orders
    - _Requirements: 7.3, 7.4, 7.5, 7.6_
  
  - [ ] 9.3 Implement webhook error handling
    - Log webhook creation failures with error details
    - Notify user of webhook creation failures
    - Log order processing errors with full context
    - Return HTTP 500 for processing errors
    - Queue failed webhooks for retry
    - _Requirements: 6.4, 7.8, 11.3_
  
  - [ ] 9.4 Write property test for automatic webhook creation
    - **Property 36: Automatic webhook creation on connection**
    - For any successful Shopify connection, verify webhook created
    - Verify webhook ID stored in database
    - Verify webhook callback URL contains tenant ID
    - **Validates: Requirements 6.1**
  
  - [ ] 9.5 Write property test for idempotency checking
    - **Property 42: Idempotency key checking**
    - For any order ID, first processing should succeed
    - For any duplicate order ID, check should detect duplicate
    - Verify ProcessedWebhook entry created on first processing
    - **Validates: Requirements 7.4**
  
  - [ ] 9.6 Write property test for duplicate order handling
    - **Property 43: Idempotent duplicate handling**
    - For any duplicate order, verify HTTP 200 returned
    - For any duplicate order, verify no new database entry created
    - For any duplicate order, verify no side effects occur
    - **Validates: Requirements 7.5**
  
  - [ ] 9.7 Write property test for order serialization round-trip
    - **Property 71: Shopify order serialization round-trip**
    - For any valid Shopify order object, serialize to JSON
    - Deserialize JSON back to object
    - Verify order_number, customer info, line_items match original
    - Test with orders of various sizes (1 item, many items)
    - **Validates: Requirements 14.3**
  
  - [ ] 9.8 Write unit tests for Shopify webhook edge cases
    - Test webhook creation failure handling (network error)
    - Test webhook creation failure notification to user
    - Test HMAC verification failure (reject with 401)
    - Test order processing with missing required fields
    - Test order processing with invalid JSON
    - Test order processing error logging
    - Test webhook deletion on disconnect
    - _Requirements: 6.4, 7.2, 7.8, 6.5_

- [ ] 10. Implement rate limiting middleware
  - [ ] 10.1 Create rate limiting middleware
    - Implement webhookRateLimiter() with 100 req/min per tenant
    - Implement authRateLimiter() with 5 failed attempts lockout
    - Use express-rate-limit library
    - Store rate limit state in Redis or memory
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [ ] 10.2 Write property test for webhook rate limiting
    - **Property 52: Webhook rate limiting**
    - **Validates: Requirements 10.1**
  
  - [ ] 10.3 Write property test for rate limit response
    - **Property 53: Rate limit response headers**
    - **Validates: Requirements 10.2**
  
  - [ ] 10.4 Write unit tests for rate limiting
    - Test rate limit reset after time window
    - Test Retry-After header value
    - Test account lockout duration
    - _Requirements: 10.1, 10.2, 10.3_

- [ ] 11. Implement multi-tenancy utilities
  - [ ] 11.1 Create tenant isolation utilities
    - Implement extractTenantId() from request
    - Implement filterByTenant() for database queries
    - Implement validateTenantAccess() middleware
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [ ] 11.2 Write property test for tenant data isolation
    - **Property 49: Tenant data isolation**
    - **Validates: Requirements 9.1, 9.3, 9.4**
  
  - [ ] 11.3 Write property test for cross-tenant access prevention
    - **Property 51: Cross-tenant access prevention**
    - **Validates: Requirements 9.5**
  
  - [ ] 11.4 Write unit tests for tenant isolation
    - Test tenant ID extraction from JWT
    - Test cross-tenant query blocking
    - Test webhook routing by tenant ID
    - _Requirements: 9.1, 9.2, 9.5_

- [ ] 12. Checkpoint - Ensure middleware and utilities tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Implement account settings controller
  - [ ] 13.1 Create AccountSettingsController class
    - Implement updateEmail() endpoint (PUT /api/account/email)
    - Implement updateUsername() endpoint (PUT /api/account/username)
    - Implement updatePassword() endpoint (PUT /api/account/password)
    - Implement getAuditLog() endpoint (GET /api/account/audit-log)
    - Add validation middleware
    - Add authentication middleware
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6_
  
  - [ ] 13.2 Write property test for session invalidation
    - **Property 8: Session invalidation after sensitive changes**
    - **Validates: Requirements 1.8**
  
  - [ ] 13.3 Write integration tests for account settings API
    - Test email update flow with authentication
    - Test password update with wrong current password
    - Test validation error responses
    - _Requirements: 1.1, 1.3, 1.7_

- [ ] 14. Implement webhook settings controller
  - [ ] 14.1 Create WebhookSettingsController class
    - Implement getSettings() endpoint (GET /api/webhooks/settings)
    - Implement updateOutgoingWebhook() endpoint (PUT /api/webhooks/outgoing)
    - Implement regenerateSecret() endpoint (POST /api/webhooks/secret/regenerate)
    - Implement testWebhook() endpoint (POST /api/webhooks/test)
    - Implement handleIncoming() endpoint (POST /api/webhooks/incoming/:tenantId)
    - Add rate limiting middleware to webhook endpoints
    - _Requirements: 2.1, 2.2, 2.3, 2.7, 3.1, 3.2, 3.4, 3.6_
  
  - [ ] 14.2 Write property test for secret masking
    - **Property 14: Secret masking consistency**
    - **Validates: Requirements 2.7, 8.6**
  
  - [ ] 14.3 Write property test for signature verification failure response
    - **Property 18: Signature verification failure response**
    - **Validates: Requirements 3.5, 7.2**
  
  - [ ] 14.4 Write integration tests for webhook API
    - Test webhook URL save with connectivity test
    - Test incoming webhook with valid signature
    - Test incoming webhook with invalid signature
    - Test rate limiting on webhook endpoint
    - _Requirements: 2.3, 3.4, 3.5, 10.1_

- [ ] 15. Implement Shopify controller
  - [ ] 15.1 Create ShopifyController class
    - Implement initiateOAuth() endpoint (GET /api/shopify/connect)
    - Implement handleCallback() endpoint (GET /api/shopify/callback)
    - Implement getStatus() endpoint (GET /api/shopify/status)
    - Implement testConnection() endpoint (POST /api/shopify/test)
    - Implement disconnect() endpoint (DELETE /api/shopify/disconnect)
    - Implement handleOrderWebhook() endpoint (POST /api/shopify/webhooks/orders/:tenantId)
    - Add HMAC verification middleware
    - Add rate limiting middleware
    - _Requirements: 4.1, 4.4, 4.6, 5.1, 5.3, 5.6, 7.1, 7.4_
  
  - [ ] 15.2 Write property test for OAuth URL scope inclusion
    - **Property 22: OAuth URL scope inclusion**
    - **Validates: Requirements 4.1**
  
  - [ ] 15.3 Write property test for connection status accuracy
    - **Property 31: Connection status accuracy**
    - **Validates: Requirements 5.1**
  
  - [ ] 15.4 Write property test for webhook cleanup on disconnect
    - **Property 35: Webhook cleanup on disconnect**
    - **Validates: Requirements 5.7**
  
  - [ ] 15.5 Write integration tests for Shopify API
    - Test OAuth flow with state verification
    - Test HMAC verification failure
    - Test order webhook with duplicate order
    - Test disconnect with webhook deletion
    - _Requirements: 4.4, 4.7, 7.5, 5.7_

- [ ] 16. Implement API routes and wire controllers
  - [ ] 16.1 Create route files
    - Create account.routes.ts with account settings endpoints
    - Create webhook.routes.ts with webhook endpoints
    - Create shopify.routes.ts with Shopify endpoints
    - Wire routes to controllers
    - Apply middleware (auth, validation, rate limiting)
    - _Requirements: All API requirements_
  
  - [ ] 16.2 Write integration tests for complete API flows
    - Test end-to-end account settings update
    - Test end-to-end webhook configuration
    - Test end-to-end Shopify OAuth flow
    - _Requirements: 1.1, 2.3, 4.1_

- [ ] 17. Checkpoint - Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 18. Implement frontend account settings component
  - [ ] 18.1 Create AccountSettings React component
    - Create form for email update with validation
    - Create form for username update with validation
    - Create form for password update with strength indicator
    - Implement current password confirmation
    - Display validation errors
    - Show success/error messages
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.7_
  
  - [ ] 18.2 Write unit tests for AccountSettings component
    - Test form validation
    - Test error message display
    - Test success message display
    - Test password strength indicator
    - _Requirements: 1.4, 1.7_

- [ ] 19. Implement frontend webhook settings component
  - [ ] 19.1 Create WebhookSettings React component
    - Create form for outgoing webhook URL
    - Display incoming webhook endpoint (read-only)
    - Display webhook secret (masked) with regenerate button
    - Implement test webhook button
    - Show test results (success/failure)
    - Display webhook logs
    - _Requirements: 2.1, 2.3, 2.7, 3.1, 3.2_
  
  - [ ] 19.2 Write unit tests for WebhookSettings component
    - Test URL validation
    - Test secret masking display
    - Test webhook test button
    - Test error handling
    - _Requirements: 2.1, 2.7_

- [ ] 20. Implement frontend Shopify integration component
  - [ ] 20.1 Create ShopifyIntegration React component
    - Display connection status (connected/disconnected)
    - Show "Connect Shopify" button when disconnected
    - Show shop domain when connected
    - Implement "Test Connection" button
    - Implement "Disconnect" button with confirmation
    - Display connection test results
    - Show webhook status
    - _Requirements: 4.1, 5.1, 5.2, 5.3, 5.6_
  
  - [ ] 20.2 Write unit tests for ShopifyIntegration component
    - Test connection status display
    - Test connect button click
    - Test disconnect confirmation
    - Test connection test results
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 21. Implement frontend integration settings page
  - [ ] 21.1 Create IntegrationSettings page component
    - Create tabbed interface for Account, Webhooks, Shopify
    - Integrate AccountSettings component
    - Integrate WebhookSettings component
    - Integrate ShopifyIntegration component
    - Add loading states
    - Add error boundaries
    - _Requirements: All frontend requirements_
  
  - [ ] 21.2 Write E2E tests for settings page
    - Test navigation between tabs
    - Test complete account update flow
    - Test complete webhook configuration flow
    - Test complete Shopify connection flow
    - _Requirements: 1.1, 2.3, 4.1_

- [ ] 22. Implement structured logging
  - [ ] 22.1 Set up Winston logger with JSON format
    - Configure Winston with JSON formatter
    - Add correlation ID middleware
    - Implement log sanitization (remove secrets)
    - Add log levels (error, warn, info, debug)
    - _Requirements: 12.5, 12.6, 8.5_
  
  - [ ] 22.2 Write property test for log sanitization
    - **Property 48: Log sanitization**
    - **Validates: Requirements 8.5**
  
  - [ ] 22.3 Write property test for correlation ID propagation
    - **Property 66: Correlation ID propagation**
    - **Validates: Requirements 12.6**

- [ ] 23. Implement metrics and observability
  - [ ] 23.1 Set up metrics collection
    - Implement webhook count metrics
    - Implement webhook failure rate metrics
    - Implement webhook latency metrics
    - Implement API endpoint metrics
    - Expose metrics endpoint (GET /api/metrics)
    - _Requirements: 12.7_
  
  - [ ] 23.2 Write property test for metrics availability
    - **Property 67: Metrics availability**
    - **Validates: Requirements 12.7**

- [ ] 24. Implement configuration validation
  - [ ] 24.1 Create configuration validation on startup
    - Validate DATABASE_URL presence and format
    - Validate JWT_SECRET presence
    - Validate ENCRYPTION_KEY length (32 bytes)
    - Validate Shopify credentials format
    - Log descriptive errors for missing/invalid config
    - Fail startup if critical config missing
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [ ] 24.2 Write property test for encryption key validation
    - **Property 70: Encryption key validation**
    - **Validates: Requirements 13.5**
  
  - [ ] 24.3 Write unit tests for configuration validation
    - Test missing required config
    - Test invalid config format
    - Test Shopify credentials validation
    - _Requirements: 13.2, 13.3, 13.4_

- [ ] 25. Final checkpoint - Complete integration testing
  - [ ] 25.1 Run full test suite
    - Run all unit tests with coverage report
    - Run all property-based tests (100+ iterations each)
    - Run all integration tests
    - Run all E2E tests
    - Verify test coverage meets target (80%+ overall, 90%+ for critical paths)
    - Fix any failing tests
  
  - [ ] 25.2 Manual testing scenarios
    - **Account Settings Flow**:
      - Update email with valid/invalid formats
      - Update username with valid/invalid formats
      - Update password with weak/strong passwords
      - Verify audit log entries created
      - Verify session invalidation after email/password change
    
    - **Webhook Configuration Flow**:
      - Save outgoing webhook URL (test connectivity)
      - Generate new webhook secret
      - Send test webhook payload
      - Receive incoming webhook with valid signature
      - Receive incoming webhook with invalid signature (should reject)
      - Verify webhook logs created
    
    - **Shopify Integration Flow**:
      - Initiate OAuth connection
      - Complete OAuth callback with valid HMAC
      - Verify connection status shows connected
      - Test connection (should succeed)
      - Receive order webhook with valid HMAC
      - Receive duplicate order webhook (should be idempotent)
      - Disconnect Shopify (verify webhook deleted)
  
  - [ ] 25.3 Security testing
    - **CSRF Protection**:
      - Test OAuth with mismatched state parameter (should reject)
      - Test OAuth with missing state parameter (should reject)
      - Test OAuth with expired state (should reject)
    
    - **Injection Prevention**:
      - Test SQL injection in email field (should sanitize)
      - Test XSS in username field (should sanitize)
      - Test command injection in webhook URL (should validate)
    
    - **Signature Verification**:
      - Test webhook with invalid HMAC (should reject with 401)
      - Test Shopify callback with invalid HMAC (should reject)
      - Test webhook with tampered payload (should reject)
    
    - **Multi-Tenancy**:
      - Test cross-tenant data access via API manipulation (should reject)
      - Test webhook routing to wrong tenant (should reject)
      - Test accessing another user's settings (should reject)
    
    - **Rate Limiting**:
      - Send 101 webhook requests in 1 minute (101st should be rate limited)
      - Verify HTTP 429 response with Retry-After header
      - Fail authentication 5 times (account should lock for 15 minutes)
  
  - [ ] 25.4 Performance testing
    - **Webhook Throughput**:
      - Load test webhook endpoint with 100 req/min per tenant
      - Measure p50, p95, p99 latency (target: <200ms p95)
      - Verify no errors under normal load
    
    - **Database Performance**:
      - Test query performance with 10,000 audit log entries
      - Test query performance with 1,000 webhook logs
      - Verify indexes are used (check EXPLAIN plans)
    
    - **Encryption Overhead**:
      - Measure encryption/decryption time for various data sizes
      - Verify encryption doesn't significantly impact API response times
    
    - **API Response Times**:
      - Measure response times for all endpoints
      - Target: <200ms p95 for all endpoints
      - Identify and optimize slow queries
  
  - [ ] 25.5 Error scenario testing
    - Test database connection failure (should return 500)
    - Test Shopify API unavailable (should retry with backoff)
    - Test n8n webhook endpoint unavailable (should retry)
    - Test invalid JWT token (should return 401)
    - Test expired JWT token (should return 401)
    - Test missing required environment variables (should fail startup)
    - Test invalid encryption key (should fail startup)
  
  - [ ] 25.6 Observability verification
    - Verify all sensitive operations create audit logs
    - Verify all webhook events create webhook logs
    - Verify correlation IDs propagate through request chain
    - Verify logs are in JSON format
    - Verify logs don't contain plaintext secrets
    - Verify metrics endpoint exposes webhook counts and latency
    - Verify security violations are logged with details

- [ ] 26. Documentation and deployment preparation
  - [ ] 26.1 Create API documentation
    - Document all new endpoints with request/response examples
    - Document authentication requirements (JWT)
    - Document rate limiting rules
    - Document error codes and messages
    - Create Postman collection or OpenAPI spec
    - _Requirements: All API requirements_
  
  - [ ] 26.2 Create user guide
    - Write guide for account settings management
    - Write guide for n8n webhook configuration
    - Write guide for Shopify OAuth connection
    - Include screenshots and step-by-step instructions
    - Document common error scenarios and solutions
    - _Requirements: User-facing requirements_
  
  - [ ] 26.3 Update environment variables documentation
    - Document all required environment variables
    - Document optional environment variables
    - Provide example .env file
    - Document encryption key generation process
    - Document Shopify app setup process
    - _Requirements: 13.1, 13.2, 8.7_
  
  - [ ] 26.4 Create database migration guide
    - Document migration steps for production
    - Document rollback procedures
    - Document data backup requirements
    - Document zero-downtime migration strategy
    - _Requirements: Database requirements_
  
  - [ ] 26.5 Create deployment checklist
    - Pre-deployment checklist (backups, config validation)
    - Deployment steps (migrations, service restart)
    - Post-deployment verification (health checks, smoke tests)
    - Rollback procedures
    - Monitoring and alerting setup
    - _Requirements: All requirements_
  
  - [ ] 26.6 Create security documentation
    - Document encryption implementation
    - Document HMAC verification process
    - Document OAuth security measures
    - Document rate limiting configuration
    - Document multi-tenancy isolation
    - Document audit logging
    - _Requirements: Security requirements_

## Notes

### Task Execution Guidelines

- Tasks marked with `*` are optional property-based and unit tests that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples and edge cases
- Integration tests validate complete API flows

### Implementation Approach

- **Bottom-Up**: Build from utilities → services → controllers → routes → frontend
- **Test-Driven**: Write tests alongside implementation, not after
- **Incremental**: Each task produces working, testable code
- **Security-First**: Encryption, validation, and sanitization at every layer

### Critical Security Requirements

- All sensitive data (tokens, secrets, passwords) MUST be encrypted before storage using AES-256-GCM
- All API endpoints MUST enforce tenant isolation (no cross-tenant data access)
- All webhook endpoints MUST include rate limiting (100 req/min per tenant)
- All external API calls MUST include retry logic with exponential backoff (1s, 2s, 4s)
- All HMAC signatures MUST use constant-time comparison to prevent timing attacks
- All OAuth flows MUST include state parameter for CSRF protection
- All passwords MUST be hashed with bcrypt (cost factor 10+)
- All user inputs MUST be sanitized to prevent injection attacks
- All logs MUST NOT contain plaintext secrets or tokens

### Testing Requirements

- **Property-Based Tests**: Use fast-check library, minimum 100 iterations per test
- **Unit Tests**: Focus on edge cases, error conditions, and specific examples
- **Integration Tests**: Use Supertest for HTTP testing, test database for isolation
- **E2E Tests**: Test complete user flows from frontend to database
- **Coverage Target**: 80%+ overall, 90%+ for critical security paths

### Performance Targets

- API response time: <200ms p95 for all endpoints
- Webhook throughput: 100 requests/minute per tenant
- Database queries: All queries must use indexes (verify with EXPLAIN)
- Encryption overhead: <10ms for encrypt/decrypt operations

### Deployment Considerations

- Database migrations must be backward compatible for zero-downtime deployment
- Environment variables must be validated on startup (fail fast if missing/invalid)
- Encryption keys must be rotated periodically (document rotation process)
- Rate limiting state should use Redis for multi-instance deployments
- Webhook retry queue should use Redis or message queue for reliability
- Audit logs should be archived periodically (retention policy: 90 days)

### Monitoring and Alerting

- Alert on high webhook failure rate (>10% failures)
- Alert on high API error rate (>5% 5xx responses)
- Alert on rate limiting triggers (potential abuse)
- Alert on HMAC verification failures (potential security attack)
- Alert on database connection failures
- Alert on external API failures (Shopify, n8n)
- Monitor encryption/decryption performance
- Monitor database query performance

### Common Pitfalls to Avoid

- ❌ Don't store secrets in plaintext (always encrypt)
- ❌ Don't log sensitive data (passwords, tokens, secrets)
- ❌ Don't skip HMAC verification (security vulnerability)
- ❌ Don't skip state parameter validation (CSRF vulnerability)
- ❌ Don't allow cross-tenant data access (privacy violation)
- ❌ Don't skip input sanitization (injection vulnerability)
- ❌ Don't use variable-time comparison for HMAC (timing attack)
- ❌ Don't skip rate limiting (DoS vulnerability)
- ❌ Don't skip retry logic (reliability issue)
- ❌ Don't skip idempotency checks (duplicate processing)

### Development Workflow

1. **Read Requirements**: Understand what needs to be built
2. **Read Design**: Understand how it should be built
3. **Implement Task**: Write code following design specifications
4. **Write Tests**: Write property tests and unit tests
5. **Run Tests**: Ensure all tests pass
6. **Manual Test**: Verify functionality works as expected
7. **Code Review**: Review code for security, performance, correctness
8. **Checkpoint**: Ensure all tests pass before moving to next task

### External Dependencies

- **Shopify API**: Requires Shopify Partner account and app credentials
- **n8n**: Requires n8n instance for webhook testing
- **PostgreSQL**: Requires PostgreSQL 12+ for database
- **Redis** (optional): For rate limiting and webhook queue in production
- **fast-check**: For property-based testing
- **Jest**: For unit and integration testing
- **Supertest**: For HTTP API testing
- **React Testing Library**: For frontend component testing
