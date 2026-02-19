# Implementation Plan: WhatsApp-Shopify CRM

## Overview

This implementation plan breaks down the WhatsApp-Shopify CRM platform into incremental, testable steps. The approach follows a bottom-up strategy: starting with database schema and core services, then building API endpoints, followed by frontend components, and finally integrating real-time features and webhooks. Each major section includes property-based tests to validate correctness properties from the design document.

The implementation uses TypeScript throughout for type safety, with Node.js/Express for the backend, React.js for the frontend, PostgreSQL with Prisma ORM for data persistence, and Socket.io for real-time communication.

## Tasks

- [x] 1. Initialize project structure and dependencies
  - Create monorepo structure with backend and frontend directories
  - Initialize Node.js/Express backend with TypeScript configuration
  - Initialize React.js frontend with TypeScript and Tailwind CSS
  - Install core dependencies: Prisma, Socket.io, JWT libraries, bcrypt, fast-check
  - Set up ESLint, Prettier, and Jest for both projects
  - Create .env.example files with required environment variables
  - _Requirements: All (foundational setup)_

- [x] 2. Set up database schema and Prisma ORM
  - [x] 2.1 Create Prisma schema with User, Customer, Message, and Order models
    - Define User model with email, passwordHash, shopifyDomain, shopifyApiKey, n8nWebhookUrl
    - Define Customer model with phoneNumber, name, accountId, and relation to User
    - Define Message model with content, type, direction, imageUrl, customerId, and relation to Customer
    - Define Order model with shopifyOrderId, orderNumber, total, status, customerId, and relation to Customer
    - Add unique constraints, indexes, and foreign key relationships
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7_
  
  - [x] 2.2 Write property test for database schema completeness
    - **Property 31: Database schema completeness**
    - **Validates: Requirements 17.1, 17.2, 17.3, 17.4**
  
  - [x] 2.3 Write property test for referential integrity
    - **Property 32: Referential integrity enforcement**
    - **Validates: Requirements 17.5, 17.6, 17.7**
  
  - [x] 2.4 Generate Prisma client and run initial migration
    - Run `prisma migrate dev` to create database tables
    - Generate TypeScript types from schema
    - _Requirements: 17.1, 17.2, 17.3, 17.4_

- [x] 3. Implement authentication module
  - [x] 3.1 Create authentication service with password hashing and JWT generation
    - Implement `hashPassword()` using bcrypt
    - Implement `comparePassword()` for credential verification
    - Implement `generateToken()` to create JWT with userId and accountId claims
    - _Requirements: 1.5, 1.6_
  
  - [x] 3.2 Create authentication controller with register and login endpoints
    - Implement `POST /api/auth/register` endpoint
    - Implement `POST /api/auth/login` endpoint
    - Add input validation for email and password
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [x] 3.3 Create authentication middleware for protected routes
    - Implement `authenticate()` middleware to verify JWT tokens
    - Implement `extractAccountId()` to get accountId from authenticated user
    - Attach user context to request object
    - _Requirements: 16.1, 16.2, 16.3_
  
  - [x] 3.4 Write property test for user registration
    - **Property 1: User registration creates unique accounts**
    - **Validates: Requirements 1.1, 1.5**
  
  - [x] 3.5 Write property test for duplicate email rejection
    - **Property 2: Duplicate email registration rejection**
    - **Validates: Requirements 1.2**
  
  - [x] 3.6 Write property test for authentication round-trip
    - **Property 3: Authentication round-trip**
    - **Validates: Requirements 1.3, 1.4, 1.6**
  
  - [x] 3.7 Write property test for protected endpoint authentication
    - **Property 4: Protected endpoint authentication enforcement**
    - **Validates: Requirements 16.1, 16.2, 16.3**

- [x] 4. Implement customer management module
  - [x] 4.1 Create customer service with CRUD operations
    - Implement `findOrCreateByPhone()` to get existing or create new customer
    - Implement `getCustomersByAccount()` with account filtering
    - Implement `validateAccountOwnership()` for access control
    - _Requirements: 2.1, 2.4, 2.5, 6.1_
  
  - [x] 4.2 Create customer controller with API endpoints
    - Implement `GET /api/customers` to list customers for account
    - Implement `GET /api/customers/:id` to get single customer
    - Add authentication middleware to all routes
    - _Requirements: 6.1, 6.2_
  
  - [x] 4.3 Write property test for tenant data isolation
    - **Property 5: Complete tenant data isolation**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 4.5**
  
  - [x] 4.4 Write property test for customer list completeness
    - **Property 12: Customer list completeness and ordering**
    - **Validates: Requirements 6.1, 6.2, 6.4**

- [x] 5. Implement message management module
  - [x] 5.1 Create message service with storage and retrieval
    - Implement `createMessage()` to store messages with direction
    - Implement `getMessagesByCustomer()` with account validation and timestamp ordering
    - Implement `handleImageUpload()` for image storage (use cloud storage or local filesystem)
    - _Requirements: 2.2, 7.1, 7.2, 7.3_
  
  - [x] 5.2 Create message controller with API endpoints
    - Implement `GET /api/messages/:customerId` to get thread messages
    - Implement `POST /api/messages/send` to send outgoing messages
    - Add account ownership validation
    - _Requirements: 7.1, 7.4, 7.5_
  
  - [x] 5.3 Implement n8n integration for outgoing messages
    - Create `sendToN8n()` function to POST messages to n8n webhook
    - Format payload with phone number, content, and type
    - Handle success and failure responses
    - Only store message if n8n request succeeds
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_
  
  - [x] 5.4 Write property test for message display completeness
    - **Property 15: Message display completeness**
    - **Validates: Requirements 7.2, 7.3, 15.5**
  
  - [x] 5.5 Write property test for outgoing message storage and delivery
    - **Property 16: Outgoing message storage and delivery**
    - **Validates: Requirements 7.4, 7.5, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6**
  
  - [x] 5.6 Write property test for image message handling
    - **Property 18: Image message handling**
    - **Validates: Requirements 11.5, 15.2, 15.3, 15.4, 15.6**

- [x] 6. Implement order management module
  - [x] 6.1 Create order service with CRUD operations
    - Implement `createOrder()` to store orders with Shopify reference
    - Implement `updateStatus()` with account validation
    - Implement `getOrdersByAccount()` with optional status filtering
    - Implement `getOrdersByCustomer()` for customer-order linking
    - _Requirements: 2.3, 9.1, 9.5, 10.1, 10.3_
  
  - [x] 6.2 Create order controller with API endpoints
    - Implement `GET /api/orders` to list orders with optional status filter
    - Implement `GET /api/orders/:id` to get single order
    - Implement `PATCH /api/orders/:id/status` to update order status
    - Add account ownership validation
    - _Requirements: 9.1, 9.2, 9.4, 10.1, 10.2, 10.5_
  
  - [x] 6.3 Write property test for order display and filtering
    - **Property 22: Order display and filtering**
    - **Validates: Requirements 9.1, 9.2, 9.4**
  
  - [x] 6.4 Write property test for order-customer relationship
    - **Property 23: Order-customer relationship**
    - **Validates: Requirements 9.5**
  
  - [x] 6.5 Write property test for order status update round-trip
    - **Property 24: Order status update round-trip**
    - **Validates: Requirements 10.1, 10.3, 10.4, 10.5**
  
  - [x] 6.6 Write property test for tenant-scoped data modification
    - **Property 6: Tenant-scoped data modification**
    - **Validates: Requirements 2.6, 10.2, 13.6**

- [x] 7. Implement dashboard statistics module
  - [x] 7.1 Create dashboard service with statistics calculation
    - Implement `calculateStats()` to count orders by status
    - Implement `getOrderCountByStatus()` for filtered counting
    - Ensure all queries filter by accountId
    - _Requirements: 4.1, 4.2, 4.3, 4.5_
  
  - [x] 7.2 Create dashboard controller with API endpoint
    - Implement `GET /api/dashboard/stats` to return order statistics
    - Add authentication middleware
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 7.3 Write property test for order statistics accuracy
    - **Property 10: Order statistics accuracy**
    - **Validates: Requirements 4.1, 4.2, 4.3**

- [x] 8. Implement settings management module
  - [x] 8.1 Create settings service with configuration management
    - Implement `getSettingsByAccount()` to retrieve user settings
    - Implement `updateSettings()` to store configuration
    - Implement `validateWebhookUrl()` for URL format validation
    - _Requirements: 3.3, 3.4, 3.5_
  
  - [x] 8.2 Create settings controller with API endpoints
    - Implement `GET /api/settings` to get user's integration settings
    - Implement `PUT /api/settings` to update settings
    - Add authentication middleware
    - _Requirements: 3.1, 3.2, 3.4_
  
  - [x] 8.3 Write property test for configuration storage round-trip
    - **Property 7: Configuration storage round-trip**
    - **Validates: Requirements 3.4, 3.5**
  
  - [x] 8.4 Write property test for webhook URL validation
    - **Property 8: Webhook URL validation**
    - **Validates: Requirements 3.3**
  
  - [x] 8.5 Write property test for missing configuration prevention
    - **Property 9: Missing configuration prevents operations**
    - **Validates: Requirements 3.6**

- [x] 9. Checkpoint - Ensure all core API tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement WebSocket server and real-time communication
  - [x] 10.1 Create WebSocket manager with Socket.io
    - Initialize Socket.io server attached to Express server
    - Implement `authenticateConnection()` to verify JWT on connection
    - Implement `joinAccountRoom()` to add sockets to account-specific rooms
    - Implement `broadcastToAccount()` to emit events to account rooms
    - Handle disconnect events and cleanup
    - _Requirements: 8.1, 8.4_
  
  - [x] 10.2 Integrate WebSocket broadcasts into services
    - Add broadcast calls in message service when messages are created
    - Add broadcast calls in order service when orders are updated
    - Add broadcast calls in dashboard service when stats change
    - Add broadcast calls in customer service when new customers are created
    - _Requirements: 4.4, 6.5, 7.6, 9.6, 10.4_
  
  - [x] 10.3 Write property test for WebSocket authentication
    - **Property 19: WebSocket authentication and connection**
    - **Validates: Requirements 8.1, 8.4**
  
  - [x] 10.4 Write property test for WebSocket message delivery
    - **Property 20: WebSocket message delivery and UI updates**
    - **Validates: Requirements 8.2, 8.3**
  
  - [x] 10.5 Write unit test for WebSocket reconnection logic
    - Test that client attempts reconnection on connection loss
    - _Requirements: 8.5_

- [x] 11. Implement webhook endpoints for external integrations
  - [x] 11.1 Create webhook service for payload processing
    - Implement `processIncomingMessage()` to handle WhatsApp messages
    - Implement `processButtonResponse()` to handle button actions
    - Implement `processShopifyOrder()` to sync Shopify orders
    - Implement `validateWebhookSignature()` for security
    - Implement `determineAccountFromPayload()` to map webhooks to accounts
    - _Requirements: 11.2, 11.3, 11.4, 13.1, 13.2, 13.3, 13.4, 14.2, 14.3, 14.4, 14.6_
  
  - [x] 11.2 Create webhook controller with endpoints
    - Implement `POST /api/webhooks/whatsapp/incoming` for incoming messages
    - Implement `POST /api/webhooks/whatsapp/button` for button responses
    - Implement `POST /api/webhooks/shopify/orders` for order sync
    - Add webhook authentication/signature validation
    - Add rate limiting middleware
    - _Requirements: 11.1, 11.6, 14.1, 16.4_
  
  - [x] 11.3 Write property test for incoming message processing
    - **Property 17: Incoming message processing and real-time delivery**
    - **Validates: Requirements 7.6, 11.2, 11.3, 11.4, 11.7**
  
  - [x] 11.4 Write property test for button action processing
    - **Property 26: Button action processing**
    - **Validates: Requirements 13.1, 13.2, 13.3, 13.4, 13.5**
  
  - [x] 11.5 Write property test for Shopify order synchronization
    - **Property 27: Shopify order synchronization**
    - **Validates: Requirements 14.2, 14.3, 14.4, 14.5, 14.6**
  
  - [x] 11.6 Write property test for webhook authentication
    - **Property 28: Webhook authentication**
    - **Validates: Requirements 11.6**
  
  - [x] 11.7 Write property test for rate limiting enforcement
    - **Property 29: Rate limiting enforcement**
    - **Validates: Requirements 16.4**

- [x] 12. Implement error handling and logging
  - [x] 12.1 Create error handling middleware
    - Implement global error handler for Express
    - Format all errors with consistent structure (code, message, timestamp)
    - Map different error types to appropriate HTTP status codes
    - Ensure sensitive data is never exposed in error responses
    - _Requirements: 18.1, 18.6_
  
  - [x] 12.2 Implement logging service
    - Set up logging library (Winston or Pino)
    - Log all errors with timestamp, details, and stack traces
    - Log all webhook receptions (success and failure)
    - Log all authentication failures
    - Ensure sensitive data is redacted from logs
    - _Requirements: 16.5, 18.2, 18.3, 18.4, 18.5, 18.6_
  
  - [x] 12.3 Write property test for structured error responses
    - **Property 33: Structured error responses**
    - **Validates: Requirements 18.1**
  
  - [x] 12.4 Write property test for comprehensive error logging
    - **Property 34: Comprehensive error and audit logging**
    - **Validates: Requirements 18.2, 18.3, 18.4, 18.5**
  
  - [x] 12.5 Write property test for sensitive information protection
    - **Property 30: Sensitive information protection**
    - **Validates: Requirements 18.6**

- [x] 13. Checkpoint - Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Implement frontend authentication components
  - [x] 14.1 Create authentication context and hooks
    - Create AuthContext to manage authentication state
    - Implement useAuth hook for accessing auth state
    - Store JWT token in localStorage
    - Implement token refresh logic
    - _Requirements: 1.3, 1.6_
  
  - [x] 14.2 Create LoginForm component
    - Build form with email and password inputs
    - Implement form validation
    - Call `/api/auth/login` endpoint on submit
    - Handle success (store token, redirect) and error states
    - _Requirements: 1.3, 1.4_
  
  - [x] 14.3 Create RegisterForm component
    - Build form with email, password, and confirm password inputs
    - Implement password validation
    - Call `/api/auth/register` endpoint on submit
    - Handle success (store token, redirect) and error states
    - _Requirements: 1.1, 1.2_
  
  - [x] 14.4 Write unit tests for authentication components
    - Test form validation logic
    - Test successful login/register flows
    - Test error handling
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 15. Implement frontend API client and WebSocket connection
  - [x] 15.1 Create API client with authentication
    - Set up Axios or Fetch wrapper with base URL
    - Add request interceptor to attach JWT token to all requests
    - Add response interceptor to handle 401 errors (redirect to login)
    - Implement error handling and retry logic
    - _Requirements: 16.1, 16.2_
  
  - [x] 15.2 Create WebSocket client manager
    - Initialize Socket.io client with authentication
    - Implement connection and disconnection handlers
    - Implement automatic reconnection logic
    - Create hooks for subscribing to WebSocket events
    - _Requirements: 8.1, 8.4, 8.5_
  
  - [x] 15.3 Write unit tests for API client
    - Test token attachment to requests
    - Test 401 error handling
    - _Requirements: 16.1, 16.2_

- [x] 16. Implement frontend dashboard components
  - [x] 16.1 Create DashboardStats component
    - Fetch statistics from `/api/dashboard/stats`
    - Display total, confirmed, and cancelled order counts
    - Subscribe to `stats:update` WebSocket event for real-time updates
    - Style with Tailwind CSS
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [x] 16.2 Create Sidebar component with responsive behavior
    - Build navigation menu with links to dashboard, chat, orders, settings
    - Implement mobile toggle functionality
    - Use Tailwind CSS responsive classes for mobile/desktop layouts
    - Add logout functionality
    - _Requirements: 5.2, 5.3, 5.4_
  
  - [x] 16.3 Write property test for real-time statistics updates
    - **Property 11: Real-time statistics updates**
    - **Validates: Requirements 4.4**
  
  - [x] 16.4 Write unit tests for responsive sidebar
    - Test sidebar visibility at different viewport widths
    - Test mobile toggle functionality
    - _Requirements: 5.2, 5.3, 5.4_

- [x] 17. Implement frontend customer and chat components
  - [x] 17.1 Create CustomerList component
    - Fetch customers from `/api/customers`
    - Display customers with phone number and name
    - Sort customers by most recent message timestamp
    - Subscribe to `customer:new` WebSocket event
    - Handle customer selection
    - _Requirements: 6.1, 6.2, 6.4, 6.5_
  
  - [x] 17.2 Create ChatThread component
    - Fetch messages from `/api/messages/:customerId` when customer is selected
    - Display messages ordered by timestamp with direction styling
    - Render text and image messages
    - Subscribe to `message:new` WebSocket event
    - Auto-scroll to bottom on new messages
    - _Requirements: 7.1, 7.2, 7.3, 7.6, 8.2, 8.3_
  
  - [x] 17.3 Create MessageBubble component
    - Render message content (text or image)
    - Style differently for incoming vs outgoing messages
    - Display timestamp
    - Handle image lazy loading
    - _Requirements: 7.2, 7.3_
  
  - [x] 17.4 Create message input component with send functionality
    - Build text input with send button
    - Implement image upload with file picker
    - Validate image file type and size
    - Call `/api/messages/send` endpoint
    - Handle success and error states
    - _Requirements: 7.4, 7.5, 15.1, 15.2, 15.3_
  
  - [x] 17.5 Write property test for customer selection loads thread
    - **Property 13: Customer selection loads thread**
    - **Validates: Requirements 6.3, 7.1**
  
  - [x] 17.6 Write property test for real-time customer list updates
    - **Property 14: Real-time customer list updates**
    - **Validates: Requirements 6.5**
  
  - [x] 17.7 Write unit tests for chat components
    - Test message rendering
    - Test image upload validation
    - Test WebSocket message reception
    - _Requirements: 7.2, 7.3, 15.2, 15.3_

- [x] 18. Implement frontend order management components
  - [x] 18.1 Create OrderList component
    - Fetch orders from `/api/orders`
    - Display orders with order number, total, and status
    - Implement status filter dropdown
    - Subscribe to `order:update` WebSocket event
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.6_
  
  - [x] 18.2 Create OrderCard component
    - Display order details
    - Add "Confirm" and "Cancel" action buttons
    - Call `/api/orders/:id/status` endpoint on button click
    - Handle success and error states
    - _Requirements: 10.1_
  
  - [x] 18.3 Write property test for real-time order display updates
    - **Property 25: Real-time order display updates**
    - **Validates: Requirements 9.6**
  
  - [x] 18.4 Write unit tests for order components
    - Test order filtering
    - Test status update actions
    - Test WebSocket order updates
    - _Requirements: 9.4, 10.1_

- [x] 19. Implement frontend settings component
  - [x] 19.1 Create IntegrationSettings component
    - Fetch settings from `/api/settings`
    - Build form with inputs for n8n webhook URL, Shopify domain, and API key
    - Implement URL validation
    - Call `/api/settings` endpoint on save
    - Handle success and error states
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [x] 19.2 Write unit tests for settings component
    - Test form validation
    - Test save functionality
    - _Requirements: 3.3, 3.4_

- [x] 20. Implement responsive design and mobile optimization
  - [x] 20.1 Apply Tailwind CSS responsive classes throughout
    - Ensure all components adapt to mobile viewport (<768px)
    - Test layouts at different breakpoints (mobile, tablet, desktop)
    - Ensure touch-friendly button sizes on mobile
    - _Requirements: 5.1, 5.2, 5.5_
  
  - [x] 20.2 Write unit tests for responsive behavior
    - Test CSS class application at different viewport widths
    - _Requirements: 5.2_

- [x] 21. Checkpoint - Ensure all frontend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 22. Integration and end-to-end wiring
  - [x] 22.1 Wire all frontend components together in main App
    - Set up React Router for navigation
    - Implement protected routes requiring authentication
    - Connect all components to API client and WebSocket
    - Ensure proper error boundaries
    - _Requirements: All_
  
  - [x] 22.2 Set up environment configuration
    - Create environment variable files for development and production
    - Configure API base URLs, WebSocket URLs, database connection strings
    - Document all required environment variables
    - _Requirements: All_
  
  - [x] 22.3 Write end-to-end integration tests
    - Test complete user flows: register → login → send message → receive message
    - Test order synchronization flow: webhook → database → WebSocket → UI update
    - Test multi-tenant isolation: verify users cannot access other accounts' data
    - _Requirements: 1.1, 1.3, 2.4, 2.5, 7.6, 14.5_

- [x] 23. Final checkpoint - Ensure all tests pass
  - Run all unit tests, property tests, and integration tests
  - Verify test coverage meets targets (>80%)
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at major milestones
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples, edge cases, and UI interactions
- The implementation follows a bottom-up approach: database → services → API → frontend → integration
- WebSocket integration is added after core API functionality is complete
- All property tests should run with minimum 100 iterations using fast-check library
- Each property test must include a comment tag: `// Feature: whatsapp-shopify-crm, Property {number}: {property_text}`
