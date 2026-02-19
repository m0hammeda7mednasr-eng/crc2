# Design Document: WhatsApp-Shopify CRM

## Overview

The 4Pixels WhatsApp-Shopify CRM is a multi-tenant SaaS platform built with a modern web stack. The architecture follows a client-server model with real-time communication capabilities. The frontend is a React.js single-page application styled with Tailwind CSS, communicating with a Node.js/Express backend via REST APIs and WebSocket connections. PostgreSQL serves as the primary database with Prisma ORM for type-safe data access. The system integrates with external services (Shopify and WhatsApp) through n8n webhooks, enabling automated order synchronization and message routing.

The design emphasizes complete tenant isolation at the database level, ensuring that each merchant's data remains strictly separated. Real-time updates are achieved through Socket.io for instant message delivery and dashboard statistics updates. The system is designed to be responsive across devices, with mobile-first considerations for the chat interface.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Dashboard  │  │  Chat UI     │  │  Orders UI   │      │
│  │  Component   │  │  Component   │  │  Component   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │  API Client     │                        │
│                   │  (REST + WS)    │                        │
│                   └────────┬────────┘                        │
└────────────────────────────┼──────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   Load Balancer │
                    └────────┬────────┘
                             │
┌────────────────────────────┼──────────────────────────────────┐
│                   Backend Layer                               │
│                   ┌────────▼────────┐                         │
│                   │  Express Server │                         │
│                   └────────┬────────┘                         │
│                            │                                  │
│         ┌──────────────────┼──────────────────┐              │
│         │                  │                  │              │
│  ┌──────▼──────┐  ┌────────▼────────┐  ┌─────▼──────┐       │
│  │   Auth      │  │   API Routes    │  │  WebSocket │       │
│  │ Middleware  │  │   Controller    │  │   Server   │       │
│  └──────┬──────┘  └────────┬────────┘  └─────┬──────┘       │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │  Service Layer  │                        │
│                   └────────┬────────┘                        │
│                            │                                 │
│                   ┌────────▼────────┐                        │
│                   │  Prisma ORM     │                        │
│                   └────────┬────────┘                        │
└────────────────────────────┼──────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   PostgreSQL    │
                    └─────────────────┘

External Integrations:
┌──────────────┐         ┌──────────────┐
│   Shopify    │────────▶│     n8n      │
└──────────────┘         └──────┬───────┘
                                │
                         Webhook│
                                │
                         ┌──────▼───────┐
                         │   Backend    │
                         │   Webhooks   │
                         └──────────────┘
```

### Technology Stack

- **Frontend**: React.js 18+, Tailwind CSS, Socket.io-client
- **Backend**: Node.js 18+, Express.js, Socket.io
- **Database**: PostgreSQL 14+, Prisma ORM
- **Authentication**: JWT tokens, bcrypt for password hashing
- **Real-time**: Socket.io for bidirectional communication
- **Integration**: n8n webhooks for Shopify and WhatsApp

### Deployment Architecture

- Frontend: Static hosting (Vercel, Netlify) or served from Express
- Backend: Node.js server (containerized with Docker)
- Database: Managed PostgreSQL (AWS RDS, DigitalOcean, or similar)
- File Storage: Cloud storage for images (AWS S3, Cloudinary)

## Components and Interfaces

### Frontend Components

#### 1. Authentication Components

**LoginForm**
- Purpose: Handle user login
- Props: `onLoginSuccess: (token: string) => void`
- State: `email: string`, `password: string`, `error: string`
- Methods:
  - `handleSubmit()`: Validate and submit credentials to `/api/auth/login`
  - `handleInputChange()`: Update form state

**RegisterForm**
- Purpose: Handle new user registration
- Props: `onRegisterSuccess: (token: string) => void`
- State: `email: string`, `password: string`, `confirmPassword: string`, `error: string`
- Methods:
  - `handleSubmit()`: Validate and submit registration to `/api/auth/register`
  - `validatePassword()`: Ensure password meets requirements

#### 2. Dashboard Components

**DashboardStats**
- Purpose: Display order statistics
- Props: `accountId: string`
- State: `stats: { totalOrders: number, confirmedOrders: number, cancelledOrders: number }`
- Methods:
  - `fetchStats()`: Load statistics from `/api/dashboard/stats`
  - `subscribeToUpdates()`: Listen for WebSocket updates on `stats:update` event

**Sidebar**
- Purpose: Navigation menu
- Props: `isOpen: boolean`, `onToggle: () => void`, `isMobile: boolean`
- Methods:
  - `handleNavigation()`: Route to different sections
  - `handleLogout()`: Clear session and redirect

#### 3. Chat Components

**CustomerList**
- Purpose: Display list of customers
- Props: `accountId: string`, `onSelectCustomer: (customerId: string) => void`
- State: `customers: Customer[]`, `selectedCustomerId: string`
- Methods:
  - `fetchCustomers()`: Load customers from `/api/customers`
  - `subscribeToNewCustomers()`: Listen for `customer:new` WebSocket event
  - `sortByRecentMessage()`: Order customers by latest message timestamp

**ChatThread**
- Purpose: Display and send messages for a customer
- Props: `customerId: string`, `accountId: string`
- State: `messages: Message[]`, `inputText: string`, `uploadedImage: File | null`
- Methods:
  - `fetchMessages()`: Load messages from `/api/messages/:customerId`
  - `sendTextMessage()`: POST to `/api/messages/send`
  - `sendImageMessage()`: Upload image and POST to `/api/messages/send`
  - `subscribeToMessages()`: Listen for `message:new` WebSocket event
  - `scrollToBottom()`: Auto-scroll to latest message

**MessageBubble**
- Purpose: Render individual message
- Props: `message: Message`, `direction: 'incoming' | 'outgoing'`
- Methods:
  - `renderText()`: Display text content
  - `renderImage()`: Display image with lazy loading
  - `formatTimestamp()`: Format message timestamp

#### 4. Order Components

**OrderList**
- Purpose: Display and filter orders
- Props: `accountId: string`
- State: `orders: Order[]`, `statusFilter: 'all' | 'pending' | 'confirmed' | 'cancelled'`
- Methods:
  - `fetchOrders()`: Load orders from `/api/orders`
  - `applyFilter()`: Filter orders by status
  - `subscribeToOrderUpdates()`: Listen for `order:update` WebSocket event

**OrderCard**
- Purpose: Display single order with actions
- Props: `order: Order`, `onStatusChange: (orderId: string, status: string) => void`
- Methods:
  - `handleConfirm()`: Update order status to "Confirmed"
  - `handleCancel()`: Update order status to "Cancelled"

#### 5. Settings Components

**IntegrationSettings**
- Purpose: Configure Shopify and n8n settings
- Props: `accountId: string`
- State: `n8nWebhookUrl: string`, `shopifyDomain: string`, `shopifyApiKey: string`
- Methods:
  - `fetchSettings()`: Load settings from `/api/settings`
  - `handleSave()`: POST updated settings to `/api/settings`
  - `validateWebhookUrl()`: Validate URL format

### Backend Components

#### 1. Authentication Module

**AuthController**
- Routes:
  - `POST /api/auth/register`: Create new user account
  - `POST /api/auth/login`: Authenticate user and return JWT token
- Methods:
  - `register(req, res)`: Hash password, create user, return token
  - `login(req, res)`: Verify credentials, generate JWT token
  - `hashPassword(password)`: Use bcrypt to hash password
  - `comparePassword(password, hash)`: Verify password against hash
  - `generateToken(userId, accountId)`: Create JWT with user and account claims

**AuthMiddleware**
- Purpose: Protect routes and extract user context
- Methods:
  - `authenticate(req, res, next)`: Verify JWT token, attach user to request
  - `extractAccountId(req)`: Get accountId from authenticated user

#### 2. Customer Module

**CustomerController**
- Routes:
  - `GET /api/customers`: List all customers for account
  - `GET /api/customers/:id`: Get single customer details
  - `POST /api/customers`: Create new customer (internal use)
- Methods:
  - `listCustomers(req, res)`: Query customers filtered by accountId
  - `getCustomer(req, res)`: Get customer by ID with account validation
  - `createCustomer(req, res)`: Create customer with account association

**CustomerService**
- Methods:
  - `findOrCreateByPhone(phoneNumber, accountId, name?)`: Get existing or create new customer
  - `getCustomersByAccount(accountId)`: Query all customers for account
  - `validateAccountOwnership(customerId, accountId)`: Ensure customer belongs to account

#### 3. Message Module

**MessageController**
- Routes:
  - `GET /api/messages/:customerId`: Get all messages for a customer thread
  - `POST /api/messages/send`: Send outgoing message
- Methods:
  - `getMessages(req, res)`: Query messages for customer with account validation
  - `sendMessage(req, res)`: Store message and forward to n8n webhook

**MessageService**
- Methods:
  - `createMessage(customerId, content, type, direction)`: Store message in database
  - `getMessagesByCustomer(customerId, accountId)`: Query messages with account filter
  - `sendToN8n(webhookUrl, phoneNumber, content, type)`: HTTP POST to n8n
  - `handleImageUpload(file)`: Upload image to storage, return URL

#### 4. Order Module

**OrderController**
- Routes:
  - `GET /api/orders`: List all orders for account
  - `GET /api/orders/:id`: Get single order details
  - `PATCH /api/orders/:id/status`: Update order status
- Methods:
  - `listOrders(req, res)`: Query orders filtered by accountId
  - `getOrder(req, res)`: Get order by ID with account validation
  - `updateOrderStatus(req, res)`: Update status with account validation

**OrderService**
- Methods:
  - `createOrder(shopifyOrderId, orderNumber, total, status, customerId)`: Store order
  - `updateStatus(orderId, status, accountId)`: Update order status with validation
  - `getOrdersByAccount(accountId, statusFilter?)`: Query orders with optional filter
  - `getOrdersByCustomer(customerId, accountId)`: Get customer's orders

#### 5. Dashboard Module

**DashboardController**
- Routes:
  - `GET /api/dashboard/stats`: Get order statistics
- Methods:
  - `getStats(req, res)`: Calculate and return order counts by status

**DashboardService**
- Methods:
  - `calculateStats(accountId)`: Query database for order counts
  - `getOrderCountByStatus(accountId, status)`: Count orders with specific status

#### 6. Webhook Module

**WebhookController**
- Routes:
  - `POST /api/webhooks/whatsapp/incoming`: Receive incoming WhatsApp messages
  - `POST /api/webhooks/whatsapp/button`: Handle button responses
  - `POST /api/webhooks/shopify/orders`: Receive Shopify order updates
- Methods:
  - `handleIncomingMessage(req, res)`: Process incoming message, create customer if needed
  - `handleButtonResponse(req, res)`: Update order status based on button action
  - `handleShopifyOrder(req, res)`: Sync order from Shopify

**WebhookService**
- Methods:
  - `processIncomingMessage(payload)`: Extract data, find/create customer, store message
  - `processButtonResponse(payload)`: Extract order ID and action, update order
  - `processShopifyOrder(payload)`: Extract order data, find/create customer, store order
  - `validateWebhookSignature(req)`: Verify webhook authenticity
  - `determineAccountFromPayload(payload)`: Map webhook to correct account

#### 7. Settings Module

**SettingsController**
- Routes:
  - `GET /api/settings`: Get user's integration settings
  - `PUT /api/settings`: Update integration settings
- Methods:
  - `getSettings(req, res)`: Return user's n8n and Shopify configuration
  - `updateSettings(req, res)`: Validate and store configuration

**SettingsService**
- Methods:
  - `getSettingsByAccount(accountId)`: Query user settings
  - `updateSettings(accountId, settings)`: Update user configuration
  - `validateWebhookUrl(url)`: Ensure URL is valid format

#### 8. WebSocket Module

**SocketManager**
- Purpose: Manage real-time connections and broadcasts
- Methods:
  - `initialize(server)`: Set up Socket.io server
  - `authenticateConnection(socket)`: Verify JWT token on connection
  - `joinAccountRoom(socket, accountId)`: Add socket to account-specific room
  - `broadcastToAccount(accountId, event, data)`: Emit event to all sockets in account room
  - `handleDisconnect(socket)`: Clean up on connection close

**Events**:
- `message:new`: Broadcast new message to account
- `customer:new`: Broadcast new customer to account
- `order:update`: Broadcast order status change to account
- `stats:update`: Broadcast updated statistics to account

## Data Models

### Database Schema (Prisma)

```prisma
model User {
  id              String    @id @default(uuid())
  email           String    @unique
  passwordHash    String
  shopifyDomain   String?
  shopifyApiKey   String?
  n8nWebhookUrl   String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  customers       Customer[]
  
  @@map("users")
}

model Customer {
  id          String    @id @default(uuid())
  phoneNumber String
  name        String?
  accountId   String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  account     User      @relation(fields: [accountId], references: [id], onDelete: Cascade)
  messages    Message[]
  orders      Order[]
  
  @@unique([phoneNumber, accountId])
  @@index([accountId])
  @@map("customers")
}

model Message {
  id          String    @id @default(uuid())
  customerId  String
  content     String
  type        String    // 'text' | 'image'
  direction   String    // 'incoming' | 'outgoing'
  imageUrl    String?
  createdAt   DateTime  @default(now())
  
  customer    Customer  @relation(fields: [customerId], references: [id], onDelete: Cascade)
  
  @@index([customerId])
  @@index([createdAt])
  @@map("messages")
}

model Order {
  id              String    @id @default(uuid())
  shopifyOrderId  String    @unique
  orderNumber     String
  total           Float
  status          String    // 'pending' | 'confirmed' | 'cancelled'
  customerId      String
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  customer        Customer  @relation(fields: [customerId], references: [id], onDelete: Cascade)
  
  @@index([customerId])
  @@index([status])
  @@map("orders")
}
```

### TypeScript Interfaces

```typescript
// Frontend/Backend shared types

interface User {
  id: string;
  email: string;
  shopifyDomain?: string;
  shopifyApiKey?: string;
  n8nWebhookUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Customer {
  id: string;
  phoneNumber: string;
  name?: string;
  accountId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Message {
  id: string;
  customerId: string;
  content: string;
  type: 'text' | 'image';
  direction: 'incoming' | 'outgoing';
  imageUrl?: string;
  createdAt: Date;
}

interface Order {
  id: string;
  shopifyOrderId: string;
  orderNumber: string;
  total: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  customerId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DashboardStats {
  totalOrders: number;
  confirmedOrders: number;
  cancelledOrders: number;
}

// API Request/Response types

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: Omit<User, 'passwordHash'>;
}

interface SendMessageRequest {
  customerId: string;
  content: string;
  type: 'text' | 'image';
  imageUrl?: string;
}

interface UpdateOrderStatusRequest {
  status: 'confirmed' | 'cancelled';
}

// Webhook payload types

interface IncomingMessagePayload {
  phoneNumber: string;
  content: string;
  type: 'text' | 'image';
  imageUrl?: string;
  accountIdentifier: string; // Used to determine which account
}

interface ButtonResponsePayload {
  orderId: string;
  action: 'Confirm' | 'Cancel' | 'Support';
  phoneNumber: string;
  accountIdentifier: string;
}

interface ShopifyOrderPayload {
  orderId: string;
  orderNumber: string;
  total: number;
  status: string;
  customerPhone: string;
  customerName?: string;
  accountIdentifier: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Authentication and Authorization Properties

Property 1: User registration creates unique accounts
*For any* valid email and password combination that hasn't been registered, creating a new user account should result in a user record with a unique account identifier and hashed password that differs from the plaintext password.
**Validates: Requirements 1.1, 1.5**

Property 2: Duplicate email registration rejection
*For any* email that already exists in the system, attempting to register with that email should be rejected with an error message, regardless of the password provided.
**Validates: Requirements 1.2**

Property 3: Authentication round-trip
*For any* registered user, providing their correct credentials should grant authentication and return a valid session token, while providing incorrect credentials should reject the login attempt.
**Validates: Requirements 1.3, 1.4, 1.6**

Property 4: Protected endpoint authentication enforcement
*For any* protected API endpoint, requests without valid authentication tokens should be rejected with 401 Unauthorized error, while requests with valid tokens should be processed.
**Validates: Requirements 16.1, 16.2, 16.3**

### Multi-tenant Isolation Properties

Property 5: Complete tenant data isolation
*For any* user account, querying for customers, messages, or orders should return only data associated with that user's account identifier, and attempts to access data from other accounts should be rejected with authorization errors.
**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 4.5**

Property 6: Tenant-scoped data modification
*For any* data modification operation (update order status, send message, etc.), the system should validate that the target data belongs to the requesting user's account before applying changes, rejecting cross-account modifications.
**Validates: Requirements 2.6, 10.2, 13.6**

### Configuration Management Properties

Property 7: Configuration storage round-trip
*For any* valid configuration settings (n8n webhook URL, Shopify domain, API key), saving the settings and then retrieving them should return the same values associated with the correct account.
**Validates: Requirements 3.4, 3.5**

Property 8: Webhook URL validation
*For any* string provided as a webhook URL, the system should accept only valid URL formats and reject invalid formats with an error message.
**Validates: Requirements 3.3**

Property 9: Missing configuration prevents operations
*For any* integration operation (sending messages, processing webhooks), when required configuration values are missing, the operation should be prevented and return an error.
**Validates: Requirements 3.6**

### Dashboard and Statistics Properties

Property 10: Order statistics accuracy
*For any* account with a set of orders, the calculated statistics (total orders, confirmed orders, cancelled orders) should exactly match the count of orders in each status category for that account.
**Validates: Requirements 4.1, 4.2, 4.3**

Property 11: Real-time statistics updates
*For any* account, when order data changes (new order created, status updated), the dashboard statistics should update in real-time via WebSocket without requiring page refresh.
**Validates: Requirements 4.4**

### Customer Management Properties

Property 12: Customer list completeness and ordering
*For any* account, the displayed customer list should include all customers associated with that account, ordered by most recent message timestamp, with each customer showing their phone number and name.
**Validates: Requirements 6.1, 6.2, 6.4**

Property 13: Customer selection loads thread
*For any* customer in the list, selecting that customer should load and display all messages in their thread ordered by timestamp.
**Validates: Requirements 6.3, 7.1**

Property 14: Real-time customer list updates
*For any* account, when a new customer sends a message via webhook, that customer should appear in the customer list in real-time without page refresh.
**Validates: Requirements 6.5**

### Message Management Properties

Property 15: Message display completeness
*For any* message in a thread, the displayed message should include its content, timestamp, direction (incoming/outgoing), and if the message type is image, the image should be rendered inline.
**Validates: Requirements 7.2, 7.3, 15.5**

Property 16: Outgoing message storage and delivery
*For any* text or image message sent by a user, the system should store the message with direction "outgoing", send it to the user's configured n8n webhook URL with correct payload format (phone number, content, type), and only store the message if the n8n request succeeds.
**Validates: Requirements 7.4, 7.5, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6**

Property 17: Incoming message processing and real-time delivery
*For any* incoming message webhook with phone number, content, and type, the system should extract the data, find or create the customer, store the message with direction "incoming", and broadcast it to the appropriate account's WebSocket connection in real-time.
**Validates: Requirements 7.6, 11.2, 11.3, 11.4, 11.7**

Property 18: Image message handling
*For any* image message (incoming or outgoing), the system should validate file type (JPEG, PNG, GIF) and size (max 5MB), store the image with an accessible URL, and include the image URL in the message record.
**Validates: Requirements 11.5, 15.2, 15.3, 15.4, 15.6**

### WebSocket Properties

Property 19: WebSocket authentication and connection
*For any* authenticated user accessing the chat interface, a WebSocket connection should be established, while unauthenticated connection attempts should be rejected.
**Validates: Requirements 8.1, 8.4**

Property 20: WebSocket message delivery and UI updates
*For any* new message arriving for an account, the message should be pushed to the user's client via WebSocket and the thread display should update without page refresh.
**Validates: Requirements 8.2, 8.3**

Property 21: WebSocket reconnection
*For any* WebSocket connection that is lost, the client should automatically attempt to reconnect.
**Validates: Requirements 8.5**

### Order Management Properties

Property 22: Order display and filtering
*For any* account with orders, the system should display all orders with their order number, total, and status, and when a status filter is applied, only orders matching that status should be displayed.
**Validates: Requirements 9.1, 9.2, 9.4**

Property 23: Order-customer relationship
*For any* order, the order should be correctly linked to its associated customer, who must belong to the same account.
**Validates: Requirements 9.5**

Property 24: Order status update round-trip
*For any* order, updating its status to "Confirmed" or "Cancelled" should persist the change to the database (verifiable by querying the order), update the timestamp, and broadcast the change via WebSocket.
**Validates: Requirements 10.1, 10.3, 10.4, 10.5**

Property 25: Real-time order display updates
*For any* account, when order data is updated (new order, status change), the order display should refresh in real-time via WebSocket.
**Validates: Requirements 9.6**

### Button Response Properties

Property 26: Button action processing
*For any* button response webhook with action "Confirm", "Cancel", or "Support", the system should extract the order identifier, and for Confirm/Cancel actions update the order status accordingly, or for Support action create a new message in the customer's thread, then broadcast the update via WebSocket.
**Validates: Requirements 13.1, 13.2, 13.3, 13.4, 13.5**

### Shopify Integration Properties

Property 27: Shopify order synchronization
*For any* Shopify order webhook, the system should extract order number, total, status, and customer information, match or create a customer record based on phone number, store the order with the Shopify order ID reference, associate it with the correct account, and broadcast the change via WebSocket.
**Validates: Requirements 14.2, 14.3, 14.4, 14.5, 14.6**

### Security Properties

Property 28: Webhook authentication
*For any* webhook endpoint, requests without required authentication or signature should be rejected.
**Validates: Requirements 11.6**

Property 29: Rate limiting enforcement
*For any* webhook endpoint, when requests exceed the rate limit threshold, subsequent requests should be rejected until the rate limit window resets.
**Validates: Requirements 16.4**

Property 30: Sensitive information protection
*For any* error or log entry, sensitive information (passwords, tokens, API keys) should not be exposed in error messages or log output.
**Validates: Requirements 18.6**

### Data Integrity Properties

Property 31: Database schema completeness
*For any* created record (user, customer, message, order), all required fields should be stored correctly: users with email, password hash, shopify domain, n8n webhook URL; customers with phone number, name, account ID; messages with content, type, direction, customer reference, timestamp; orders with shopify ID, order number, total, status, customer reference.
**Validates: Requirements 17.1, 17.2, 17.3, 17.4**

Property 32: Referential integrity enforcement
*For any* attempt to create a customer with invalid account ID, message with invalid customer ID, or order with invalid customer ID, the database should reject the operation due to foreign key constraint violations.
**Validates: Requirements 17.5, 17.6, 17.7**

### Error Handling Properties

Property 33: Structured error responses
*For any* error occurring in an API endpoint, the system should return a structured error response with error code and message in a consistent format.
**Validates: Requirements 18.1**

Property 34: Comprehensive error and audit logging
*For any* error (API errors, webhook validation failures, integration failures) or successful webhook reception, the system should log the event with timestamp, relevant details, and for errors include stack traces.
**Validates: Requirements 18.2, 18.3, 18.4, 18.5**

## Error Handling

### Error Categories

1. **Authentication Errors (401)**
   - Invalid or missing JWT token
   - Expired session token
   - Invalid credentials during login

2. **Authorization Errors (403)**
   - Attempting to access data from another account
   - Attempting to modify data from another account
   - Insufficient permissions for operation

3. **Validation Errors (400)**
   - Invalid email format during registration
   - Invalid webhook URL format
   - Invalid file type for image upload
   - File size exceeds 5MB limit
   - Missing required fields in request
   - Invalid webhook payload structure

4. **Not Found Errors (404)**
   - Customer ID not found
   - Order ID not found
   - Message ID not found
   - User not found

5. **Conflict Errors (409)**
   - Email already exists during registration
   - Duplicate Shopify order ID

6. **Integration Errors (502)**
   - n8n webhook request failed
   - Shopify API request failed
   - Image download from webhook failed

7. **Rate Limiting Errors (429)**
   - Too many webhook requests
   - Too many API requests from client

8. **Server Errors (500)**
   - Database connection failures
   - Unexpected exceptions
   - WebSocket server errors

### Error Response Format

All API errors follow a consistent JSON structure:

```typescript
interface ErrorResponse {
  error: {
    code: string;        // Machine-readable error code
    message: string;     // Human-readable error message
    details?: any;       // Optional additional context
    timestamp: string;   // ISO 8601 timestamp
  }
}
```

Example:
```json
{
  "error": {
    "code": "UNAUTHORIZED_ACCESS",
    "message": "You do not have permission to access this resource",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Error Handling Strategy

**Frontend Error Handling:**
- Display user-friendly error messages in UI
- Log errors to console for debugging
- Retry failed requests with exponential backoff for network errors
- Redirect to login page on 401 errors
- Show toast notifications for transient errors

**Backend Error Handling:**
- Catch all exceptions in route handlers
- Log errors with full context (user ID, account ID, request details)
- Return appropriate HTTP status codes
- Never expose stack traces or sensitive data to clients
- Use error monitoring service (e.g., Sentry) for production

**WebSocket Error Handling:**
- Emit error events to clients for failed operations
- Automatically reconnect on connection loss
- Log WebSocket errors on server
- Gracefully handle disconnections

**Webhook Error Handling:**
- Return appropriate HTTP status codes to n8n
- Log all webhook failures for debugging
- Implement retry logic on n8n side for failed webhooks
- Validate webhook signatures to prevent spoofing

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, error conditions, and integration points between components
- **Property-based tests**: Verify universal properties across all inputs through randomized testing

Both approaches are complementary and necessary. Unit tests catch concrete bugs and validate specific scenarios, while property-based tests verify general correctness across a wide input space.

### Property-Based Testing Configuration

**Library Selection:**
- **JavaScript/TypeScript**: Use `fast-check` library for property-based testing
- **Installation**: `npm install --save-dev fast-check @types/fast-check`

**Test Configuration:**
- Each property test must run minimum 100 iterations (due to randomization)
- Each property test must reference its design document property in a comment
- Tag format: `// Feature: whatsapp-shopify-crm, Property {number}: {property_text}`

**Example Property Test Structure:**

```typescript
import fc from 'fast-check';

describe('Authentication Properties', () => {
  // Feature: whatsapp-shopify-crm, Property 1: User registration creates unique accounts
  it('should create unique accounts with hashed passwords for valid registrations', () => {
    fc.assert(
      fc.property(
        fc.emailAddress(),
        fc.string({ minLength: 8, maxLength: 50 }),
        async (email, password) => {
          // Test implementation
          const user = await registerUser(email, password);
          expect(user.id).toBeDefined();
          expect(user.passwordHash).not.toBe(password);
          expect(user.accountId).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Testing Strategy

**Focus Areas for Unit Tests:**
- Specific examples demonstrating correct behavior (e.g., registering with a specific email)
- Edge cases (e.g., empty strings, null values, boundary conditions)
- Error conditions (e.g., invalid inputs, missing configuration)
- Integration points between components (e.g., controller → service → database)
- UI component rendering and interactions

**Avoid Over-Testing:**
- Don't write many unit tests for scenarios covered by property tests
- Property tests handle comprehensive input coverage
- Unit tests should complement, not duplicate, property test coverage

### Test Organization

**Frontend Tests:**
- Component tests using React Testing Library
- Integration tests for API client
- WebSocket connection tests
- Responsive design tests (viewport size changes)

**Backend Tests:**
- API endpoint tests (request/response validation)
- Service layer tests (business logic)
- Database integration tests (Prisma operations)
- Webhook processing tests
- WebSocket server tests
- Authentication middleware tests

**End-to-End Tests:**
- Critical user flows (registration → login → send message)
- Order synchronization flow (Shopify → webhook → display)
- Real-time message delivery flow

### Test Data Management

**Generators for Property Tests:**
- Use `fast-check` arbitraries to generate random test data
- Custom generators for domain objects (users, customers, messages, orders)
- Ensure generated data respects business rules (e.g., valid phone numbers, positive order totals)

**Test Database:**
- Use separate test database instance
- Reset database state between tests
- Use transactions for test isolation where possible
- Seed minimal required data for tests

### Continuous Integration

- Run all tests on every commit
- Fail builds on test failures
- Generate code coverage reports (target: >80% coverage)
- Run property tests with increased iterations in CI (e.g., 1000 runs)

### Testing Tools

- **Unit Testing**: Jest
- **Property Testing**: fast-check
- **Frontend Testing**: React Testing Library, Jest
- **API Testing**: Supertest
- **E2E Testing**: Playwright or Cypress
- **Mocking**: Jest mocks, MSW (Mock Service Worker) for API mocking
