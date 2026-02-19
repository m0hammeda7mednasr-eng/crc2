# Requirements Document

## Introduction

This document specifies the requirements for a comprehensive CRM Integration Settings Module that enables users to manage their account settings, configure n8n + WhatsApp webhook integrations, and establish secure Shopify OAuth connections with order synchronization capabilities. The system provides a multi-tenant architecture with robust security, audit logging, and comprehensive error handling.

## Glossary

- **CRM_System**: The Customer Relationship Management system being developed
- **User**: An authenticated individual with access to the CRM system
- **Tenant**: An isolated workspace for a specific user with dedicated settings and data
- **n8n_Service**: The workflow automation platform that receives and sends webhook events
- **Shopify_API**: The Shopify REST API used for OAuth and webhook operations
- **Webhook_Endpoint**: An HTTP endpoint that receives event notifications
- **HMAC**: Hash-based Message Authentication Code used for signature verification
- **OAuth_Flow**: The OAuth 2.0 Authorization Code Grant process
- **Access_Token**: A credential used to authenticate API requests to Shopify
- **Webhook_Secret**: A shared secret used to verify webhook authenticity
- **State_Parameter**: A random value used to prevent CSRF attacks in OAuth
- **Audit_Log**: A record of security-relevant actions performed by users
- **Idempotency_Key**: A unique identifier to prevent duplicate processing of events

## Requirements

### Requirement 1: User Account Settings Management

**User Story:** As a user, I want to update my account settings (email, username, password), so that I can maintain accurate and secure account information.

#### Acceptance Criteria

1. WHEN a user updates their email address, THE CRM_System SHALL validate the email format and uniqueness before saving
2. WHEN a user updates their username, THE CRM_System SHALL validate the username format and uniqueness before saving
3. WHEN a user updates their password, THE CRM_System SHALL require the current password for verification
4. WHEN a user provides a new password, THE CRM_System SHALL validate password strength requirements (minimum 8 characters, uppercase, lowercase, number, special character)
5. WHEN a password is stored, THE CRM_System SHALL hash it using bcrypt with a minimum cost factor of 10
6. WHEN a user updates sensitive settings, THE CRM_System SHALL create an Audit_Log entry with timestamp, user ID, and action type
7. WHEN a user attempts to update settings with invalid data, THE CRM_System SHALL return descriptive validation errors without saving changes
8. WHEN a user successfully updates their email or password, THE CRM_System SHALL require re-authentication for the next request

### Requirement 2: n8n Outgoing Webhook Configuration

**User Story:** As a user, I want to configure an outgoing webhook URL for n8n, so that my CRM can send events to my automation workflows.

#### Acceptance Criteria

1. WHEN a user provides an outgoing webhook URL, THE CRM_System SHALL validate the URL format (must be HTTPS)
2. WHEN a valid webhook URL is provided, THE CRM_System SHALL store it encrypted in the database associated with the user's Tenant
3. WHEN a user saves a webhook URL, THE CRM_System SHALL test connectivity by sending a test payload
4. WHEN the test payload is sent, THE CRM_System SHALL include a signature header for verification
5. WHEN the webhook test succeeds, THE CRM_System SHALL return a success confirmation to the user
6. WHEN the webhook test fails, THE CRM_System SHALL return the error details without saving the URL
7. WHEN a user retrieves their webhook settings, THE CRM_System SHALL display the URL in masked format (showing only last 10 characters)

### Requirement 3: n8n Incoming Webhook Management

**User Story:** As a user, I want to receive webhook events from n8n, so that external automation workflows can trigger actions in my CRM.

#### Acceptance Criteria

1. WHEN a user accesses webhook settings, THE CRM_System SHALL display a unique incoming webhook endpoint URL for their Tenant
2. WHEN a user requests a new webhook secret, THE CRM_System SHALL generate a cryptographically secure random string of at least 32 characters
3. WHEN a webhook secret is generated, THE CRM_System SHALL store it encrypted in the database
4. WHEN an incoming webhook request is received, THE CRM_System SHALL verify the signature using the stored Webhook_Secret
5. WHEN signature verification fails, THE CRM_System SHALL reject the request with HTTP 401 status
6. WHEN signature verification succeeds, THE CRM_System SHALL process the webhook payload and return HTTP 200 status
7. WHEN a webhook is processed, THE CRM_System SHALL create a log entry with timestamp, tenant ID, and event type
8. WHEN webhook processing fails, THE CRM_System SHALL return HTTP 500 status with error details

### Requirement 4: Shopify OAuth Connection Establishment

**User Story:** As a user, I want to connect my Shopify store using OAuth, so that my CRM can access my store data securely.

#### Acceptance Criteria

1. WHEN a user initiates Shopify connection, THE CRM_System SHALL generate an authorization URL with required scopes (read_orders, write_webhooks)
2. WHEN generating the authorization URL, THE CRM_System SHALL include a cryptographically secure State_Parameter
3. WHEN the authorization URL is generated, THE CRM_System SHALL store the State_Parameter temporarily associated with the user session
4. WHEN Shopify redirects to the callback URL, THE CRM_System SHALL verify the State_Parameter matches the stored value
5. WHEN the State_Parameter verification fails, THE CRM_System SHALL reject the request and display an error message
6. WHEN the callback includes an HMAC parameter, THE CRM_System SHALL verify it using the Shopify API secret
7. WHEN HMAC verification fails, THE CRM_System SHALL reject the request and log a security warning
8. WHEN HMAC verification succeeds, THE CRM_System SHALL exchange the authorization code for an Access_Token
9. WHEN the Access_Token is received, THE CRM_System SHALL store it encrypted in the database with the shop domain
10. WHEN token storage succeeds, THE CRM_System SHALL mark the Shopify connection as active for the Tenant

### Requirement 5: Shopify Connection Management

**User Story:** As a user, I want to manage my Shopify connection status, so that I can monitor and control the integration.

#### Acceptance Criteria

1. WHEN a user views integration settings, THE CRM_System SHALL display the current Shopify connection status (connected/disconnected)
2. WHEN a Shopify connection is active, THE CRM_System SHALL display the connected shop domain
3. WHEN a user requests to test the connection, THE CRM_System SHALL make an authenticated API call to Shopify
4. WHEN the test API call succeeds, THE CRM_System SHALL display a success message with shop information
5. WHEN the test API call fails, THE CRM_System SHALL display the error message and suggest reconnection
6. WHEN a user disconnects Shopify, THE CRM_System SHALL delete the stored Access_Token and mark the connection as inactive
7. WHEN disconnection occurs, THE CRM_System SHALL delete all associated Shopify webhooks

### Requirement 6: Shopify Orders Webhook Registration

**User Story:** As a user, I want my CRM to automatically receive Shopify order notifications, so that I can sync customer data in real-time.

#### Acceptance Criteria

1. WHEN a Shopify connection is established, THE CRM_System SHALL automatically create an orders/create webhook subscription
2. WHEN creating the webhook, THE CRM_System SHALL use a tenant-specific callback URL
3. WHEN the webhook is created, THE CRM_System SHALL store the webhook ID associated with the Tenant
4. WHEN webhook creation fails, THE CRM_System SHALL log the error and notify the user
5. WHEN a Shopify connection is disconnected, THE CRM_System SHALL delete the webhook subscription using the stored webhook ID

### Requirement 7: Shopify Orders Webhook Processing

**User Story:** As a system, I want to process incoming Shopify order webhooks securely, so that order data is synchronized accurately.

#### Acceptance Criteria

1. WHEN a Shopify webhook is received, THE CRM_System SHALL verify the HMAC signature in the X-Shopify-Hmac-SHA256 header
2. WHEN HMAC verification fails, THE CRM_System SHALL reject the webhook with HTTP 401 status
3. WHEN HMAC verification succeeds, THE CRM_System SHALL extract the order data from the payload
4. WHEN processing an order, THE CRM_System SHALL check for duplicate processing using the order ID as Idempotency_Key
5. WHEN a duplicate order is detected, THE CRM_System SHALL return HTTP 200 status without reprocessing
6. WHEN a new order is received, THE CRM_System SHALL store it in the database with tenant association
7. WHEN order storage succeeds, THE CRM_System SHALL return HTTP 200 status
8. WHEN order processing fails, THE CRM_System SHALL log the error and return HTTP 500 status

### Requirement 8: Security and Encryption

**User Story:** As a system administrator, I want all sensitive data encrypted, so that security breaches do not expose credentials.

#### Acceptance Criteria

1. WHEN storing webhook URLs, THE CRM_System SHALL encrypt them using AES-256-GCM encryption
2. WHEN storing Webhook_Secret values, THE CRM_System SHALL encrypt them using AES-256-GCM encryption
3. WHEN storing Shopify Access_Token values, THE CRM_System SHALL encrypt them using AES-256-GCM encryption
4. WHEN retrieving encrypted values, THE CRM_System SHALL decrypt them only when needed for API calls
5. WHEN logging events, THE CRM_System SHALL never include plaintext secrets or tokens
6. WHEN displaying secrets in the UI, THE CRM_System SHALL mask all but the last 4-10 characters
7. THE CRM_System SHALL store encryption keys in environment variables separate from the database

### Requirement 9: Multi-Tenancy and Data Isolation

**User Story:** As a user, I want my integration settings isolated from other users, so that my data remains private and secure.

#### Acceptance Criteria

1. WHEN a user accesses settings, THE CRM_System SHALL filter all data by the authenticated user's Tenant ID
2. WHEN a webhook is received, THE CRM_System SHALL route it to the correct Tenant based on the endpoint URL
3. WHEN storing integration data, THE CRM_System SHALL always associate it with the user's Tenant ID
4. WHEN querying integration data, THE CRM_System SHALL enforce tenant-level access control
5. THE CRM_System SHALL prevent cross-tenant data access through API manipulation

### Requirement 10: Rate Limiting and Security Controls

**User Story:** As a system administrator, I want rate limiting on webhook endpoints, so that the system is protected from abuse.

#### Acceptance Criteria

1. WHEN webhook requests are received, THE CRM_System SHALL enforce a rate limit of 100 requests per minute per Tenant
2. WHEN the rate limit is exceeded, THE CRM_System SHALL return HTTP 429 status with Retry-After header
3. WHEN authentication attempts fail 5 times, THE CRM_System SHALL temporarily lock the account for 15 minutes
4. WHEN processing user input, THE CRM_System SHALL sanitize all inputs to prevent injection attacks
5. THE CRM_System SHALL validate all incoming webhook payloads against expected schemas

### Requirement 11: Error Handling and Retry Logic

**User Story:** As a user, I want the system to handle errors gracefully, so that temporary failures do not cause data loss.

#### Acceptance Criteria

1. WHEN an outgoing webhook call fails, THE CRM_System SHALL retry up to 3 times with exponential backoff
2. WHEN all retries fail, THE CRM_System SHALL log the failure and notify the user
3. WHEN an incoming webhook processing fails, THE CRM_System SHALL queue the event for retry
4. WHEN network errors occur during Shopify API calls, THE CRM_System SHALL retry with exponential backoff
5. WHEN validation errors occur, THE CRM_System SHALL return user-friendly error messages with specific field information
6. WHEN unexpected errors occur, THE CRM_System SHALL log the full error details and return a generic error message to the user

### Requirement 12: Audit Logging and Observability

**User Story:** As a system administrator, I want comprehensive audit logs, so that I can track security events and troubleshoot issues.

#### Acceptance Criteria

1. WHEN a user updates account settings, THE CRM_System SHALL create an Audit_Log entry with user ID, action, timestamp, and IP address
2. WHEN a webhook is sent or received, THE CRM_System SHALL log the event with correlation ID, tenant ID, and status
3. WHEN OAuth flows complete, THE CRM_System SHALL log the connection event with shop domain and timestamp
4. WHEN security violations occur (HMAC failure, state mismatch), THE CRM_System SHALL log detailed security events
5. THE CRM_System SHALL use structured logging format (JSON) for all log entries
6. THE CRM_System SHALL include correlation IDs in all related log entries for request tracing
7. THE CRM_System SHALL expose metrics for webhook counts, failure rates, and processing latency

### Requirement 13: Configuration Parsing and Validation

**User Story:** As a developer, I want to parse and validate configuration files, so that the system starts with correct settings.

#### Acceptance Criteria

1. WHEN the application starts, THE CRM_System SHALL parse environment variables for required configuration
2. WHEN required configuration is missing, THE CRM_System SHALL fail to start and log descriptive error messages
3. WHEN configuration values are invalid, THE CRM_System SHALL validate them and log specific validation errors
4. THE CRM_System SHALL validate Shopify API credentials format before attempting OAuth flows
5. THE CRM_System SHALL validate encryption key length and format on startup

### Requirement 14: Shopify Orders Serialization

**User Story:** As a system, I want to serialize and deserialize Shopify order data, so that it can be stored and retrieved accurately.

#### Acceptance Criteria

1. WHEN storing Shopify orders, THE CRM_System SHALL serialize them to JSON format
2. WHEN retrieving Shopify orders, THE CRM_System SHALL deserialize JSON back to order objects
3. FOR ALL valid Shopify order objects, serializing then deserializing SHALL produce an equivalent object (round-trip property)
4. WHEN serialization fails, THE CRM_System SHALL log the error and return a descriptive error message
5. WHEN deserializing invalid JSON, THE CRM_System SHALL handle the error gracefully and log the issue

### Requirement 15: Webhook Payload Formatting

**User Story:** As a developer, I want webhook payloads formatted consistently, so that external systems can parse them reliably.

#### Acceptance Criteria

1. WHEN sending outgoing webhooks, THE CRM_System SHALL format payloads as JSON with consistent field names
2. WHEN formatting webhook payloads, THE CRM_System SHALL include timestamp, event type, and tenant ID fields
3. WHEN receiving incoming webhooks, THE CRM_System SHALL validate the payload structure against expected schema
4. THE CRM_System SHALL include API version information in all outgoing webhook payloads
