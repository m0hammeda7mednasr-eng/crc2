# API Documentation - 4Pixels WhatsApp-Shopify CRM

Base URL: `http://localhost:5000`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Response Format

All errors follow this structure:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Endpoints

### Authentication

#### Register User
```
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token"
}
```

#### Login
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token"
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "shopifyDomain": "store.myshopify.com",
    "n8nWebhookUrl": "https://n8n.example.com/webhook/...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Customers

#### List Customers
```
GET /api/customers
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "customers": [
    {
      "id": "uuid",
      "phoneNumber": "+1234567890",
      "name": "John Doe",
      "userId": "uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "_count": {
        "messages": 10
      }
    }
  ]
}
```

#### Get Customer
```
GET /api/customers/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "customer": {
    "id": "uuid",
    "phoneNumber": "+1234567890",
    "name": "John Doe",
    "userId": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "_count": {
      "messages": 10,
      "orders": 5
    }
  }
}
```

### Messages

#### Get Messages
```
GET /api/messages/:customerId
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "messages": [
    {
      "id": "uuid",
      "customerId": "uuid",
      "content": "Hello!",
      "type": "text",
      "direction": "incoming",
      "imageUrl": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "customer": {
        "id": "uuid",
        "phoneNumber": "+1234567890",
        "name": "John Doe"
      }
    }
  ]
}
```

#### Send Message
```
POST /api/messages/send
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "customerId": "uuid",
  "content": "Hello from CRM!",
  "type": "text",
  "imageUrl": null
}
```

**Response:** `201 Created`
```json
{
  "message": "Message sent successfully",
  "data": {
    "id": "uuid",
    "customerId": "uuid",
    "content": "Hello from CRM!",
    "type": "text",
    "direction": "outgoing",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Upload Image
```
POST /api/messages/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `image`: File (JPEG, PNG, GIF, max 5MB)

**Response:** `200 OK`
```json
{
  "message": "Image uploaded successfully",
  "imageUrl": "/uploads/1234567890-image.jpg"
}
```

### Orders

#### List Orders
```
GET /api/orders?status=all
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): `all`, `pending`, `confirmed`, `cancelled`

**Response:** `200 OK`
```json
{
  "orders": [
    {
      "id": "uuid",
      "shopifyOrderId": "12345",
      "orderNumber": "ORD-001",
      "customerName": "John Doe",
      "customerPhone": "+1234567890",
      "total": 99.99,
      "status": "pending",
      "items": {},
      "userId": "uuid",
      "customerId": "uuid",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "customer": {
        "id": "uuid",
        "phoneNumber": "+1234567890",
        "name": "John Doe"
      }
    }
  ]
}
```

#### Get Order
```
GET /api/orders/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "order": {
    "id": "uuid",
    "shopifyOrderId": "12345",
    "orderNumber": "ORD-001",
    "customerName": "John Doe",
    "customerPhone": "+1234567890",
    "total": 99.99,
    "status": "pending",
    "items": {},
    "userId": "uuid",
    "customerId": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Update Order Status
```
PATCH /api/orders/:id/status
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Response:** `200 OK`
```json
{
  "message": "Order status updated successfully",
  "order": {
    "id": "uuid",
    "status": "confirmed",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Dashboard

#### Get Statistics
```
GET /api/dashboard/stats
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "stats": {
    "totalOrders": 100,
    "confirmedOrders": 75,
    "cancelledOrders": 10
  }
}
```

### Settings

#### Get Settings
```
GET /api/settings
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "settings": {
    "id": "uuid",
    "email": "user@example.com",
    "shopifyDomain": "store.myshopify.com",
    "shopifyApiKey": "sk_...",
    "n8nWebhookUrl": "https://n8n.example.com/webhook/..."
  }
}
```

#### Update Settings
```
PUT /api/settings
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "n8nWebhookUrl": "https://n8n.example.com/webhook/...",
  "shopifyDomain": "store.myshopify.com",
  "shopifyApiKey": "sk_..."
}
```

**Response:** `200 OK`
```json
{
  "message": "Settings updated successfully",
  "settings": {
    "id": "uuid",
    "email": "user@example.com",
    "shopifyDomain": "store.myshopify.com",
    "n8nWebhookUrl": "https://n8n.example.com/webhook/..."
  }
}
```

### Webhooks

#### Incoming WhatsApp Message
```
POST /api/webhooks/whatsapp/incoming
```

**Request Body:**
```json
{
  "phoneNumber": "+1234567890",
  "content": "Hello!",
  "type": "text",
  "imageUrl": null,
  "userId": "uuid",
  "customerName": "John Doe"
}
```

**Response:** `200 OK`
```json
{
  "message": "Message received successfully",
  "data": {
    "id": "uuid",
    "customerId": "uuid",
    "content": "Hello!",
    "type": "text",
    "direction": "incoming",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### WhatsApp Button Response
```
POST /api/webhooks/whatsapp/button
```

**Request Body:**
```json
{
  "orderId": "uuid",
  "action": "Confirm",
  "phoneNumber": "+1234567890",
  "userId": "uuid"
}
```

**Actions:** `Confirm`, `Cancel`, `Support`

**Response:** `200 OK`
```json
{
  "message": "Button response processed successfully"
}
```

#### Shopify Order Sync
```
POST /api/webhooks/shopify/orders
```

**Request Body:**
```json
{
  "orderId": "12345",
  "orderNumber": "ORD-001",
  "total": 99.99,
  "status": "pending",
  "customerPhone": "+1234567890",
  "customerName": "John Doe",
  "userId": "uuid",
  "items": {}
}
```

**Response:** `200 OK`
```json
{
  "message": "Order synced successfully",
  "data": {
    "id": "uuid",
    "shopifyOrderId": "12345",
    "orderNumber": "ORD-001",
    "total": 99.99,
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## WebSocket Events

### Client → Server

#### Connect
```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'your-jwt-token' }
});
```

### Server → Client

#### New Message
```javascript
socket.on('message:new', (message) => {
  console.log('New message:', message);
});
```

#### New Customer
```javascript
socket.on('customer:new', (customer) => {
  console.log('New customer:', customer);
});
```

#### Order Update
```javascript
socket.on('order:update', (order) => {
  console.log('Order updated:', order);
});
```

#### Stats Update
```javascript
socket.on('stats:update', (stats) => {
  console.log('Stats updated:', stats);
});
```

## Rate Limiting

- API endpoints: 100 requests per 15 minutes
- Webhook endpoints: 60 requests per minute

## Error Codes

- `VALIDATION_ERROR`: Invalid request data
- `NO_TOKEN`: Missing authentication token
- `INVALID_TOKEN`: Invalid or expired token
- `UNAUTHORIZED`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `EMAIL_EXISTS`: Email already registered
- `INVALID_CREDENTIALS`: Wrong email or password
- `CONFIGURATION_ERROR`: Missing configuration
- `INTEGRATION_ERROR`: External service error
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `SERVER_ERROR`: Internal server error
