# Requirements Document

## Introduction

The 4Pixels WhatsApp-Shopify CRM is a multi-tenant SaaS platform that enables Shopify merchants to manage customer conversations through WhatsApp and track orders in a unified dashboard. The system provides complete workspace isolation, real-time communication capabilities, and seamless integration between Shopify stores and WhatsApp messaging through n8n automation.

## Glossary

- **System**: The 4Pixels WhatsApp-Shopify CRM platform
- **User**: A Shopify merchant who has registered for the platform
- **Account**: An isolated workspace belonging to a single User
- **Customer**: An end-user who communicates with a merchant via WhatsApp
- **Tenant**: A User's isolated workspace with complete data separation
- **n8n**: An automation platform that serves as middleware for WhatsApp-Shopify integration
- **Thread**: A conversation history between a merchant and a specific Customer
- **Order**: A Shopify order record associated with a Customer
- **Webhook**: An HTTP endpoint that receives real-time data from external services
- **Message**: A communication unit (text or image) sent between merchant and Customer
- **Dashboard**: The main interface displaying statistics and management tools

## Requirements

### Requirement 1: User Registration and Authentication

**User Story:** As a Shopify merchant, I want to register and log in to the platform, so that I can access my isolated workspace and manage my customer communications.

#### Acceptance Criteria

1. WHEN a new merchant provides valid email and password, THE System SHALL create a new User account with a unique Account identifier
2. WHEN a merchant provides an email that already exists, THE System SHALL reject the registration and return an error message
3. WHEN a registered User provides correct credentials, THE System SHALL authenticate the User and grant access to their Account
4. WHEN a User provides incorrect credentials, THE System SHALL reject the login attempt and return an error message
5. THE System SHALL hash and securely store all User passwords
6. WHEN a User logs in successfully, THE System SHALL create a session token for subsequent authenticated requests

### Requirement 2: Multi-tenant Data Isolation

**User Story:** As a platform administrator, I want complete data isolation between tenants, so that no User can access another User's data.

#### Acceptance Criteria

1. THE System SHALL associate every Customer record with exactly one Account identifier
2. THE System SHALL associate every Message record with a Customer that belongs to the requesting User's Account
3. THE System SHALL associate every Order record with a Customer that belongs to the requesting User's Account
4. WHEN a User queries for data, THE System SHALL filter all results by the User's Account identifier
5. WHEN a User attempts to access data from another Account, THE System SHALL reject the request and return an authorization error
6. THE System SHALL validate Account ownership for all data modification operations

### Requirement 3: Integration Configuration Management

**User Story:** As a User, I want to configure my Shopify and n8n integration settings, so that the System can communicate with my store and WhatsApp.

#### Acceptance Criteria

1. THE System SHALL provide a settings interface for Users to input their n8n Webhook URL
2. THE System SHALL provide a settings interface for Users to input their Shopify API Key and Domain
3. WHEN a User saves configuration settings, THE System SHALL validate the format of the Webhook URL
4. WHEN a User saves configuration settings, THE System SHALL store them associated with the User's Account
5. THE System SHALL retrieve and use the User's stored configuration for all integration operations
6. WHEN configuration values are missing, THE System SHALL prevent integration operations and return an error

### Requirement 4: Dashboard Statistics Display

**User Story:** As a User, I want to view key statistics on my dashboard, so that I can monitor my business performance at a glance.

#### Acceptance Criteria

1. THE System SHALL calculate and display the total number of Orders for the User's Account
2. THE System SHALL calculate and display the number of Orders with "Confirmed" status for the User's Account
3. THE System SHALL calculate and display the number of Orders with "Cancelled" status for the User's Account
4. WHEN Order data changes, THE System SHALL update the displayed statistics in real-time without page refresh
5. THE System SHALL display statistics only for Orders belonging to the User's Account

### Requirement 5: Responsive Dashboard Interface

**User Story:** As a User, I want to access the dashboard on any device, so that I can manage my business from desktop or mobile.

#### Acceptance Criteria

1. THE System SHALL render the dashboard interface using responsive design principles
2. WHEN accessed on mobile devices, THE System SHALL adapt the layout for screen widths below 768px
3. WHEN accessed on desktop devices, THE System SHALL display the full sidebar navigation
4. WHEN accessed on mobile devices, THE System SHALL provide a collapsible navigation menu
5. THE System SHALL ensure all interactive elements are touch-friendly on mobile devices

### Requirement 6: Customer List Management

**User Story:** As a User, I want to view a list of all my customers, so that I can select and view their conversation threads.

#### Acceptance Criteria

1. THE System SHALL display all Customers associated with the User's Account
2. WHEN displaying Customers, THE System SHALL show the Customer's phone number and name
3. WHEN a User selects a Customer, THE System SHALL load and display that Customer's Thread
4. THE System SHALL order Customers by most recent Message timestamp
5. WHEN a new Customer sends a Message, THE System SHALL add the Customer to the list in real-time

### Requirement 7: Thread-based Chat Interface

**User Story:** As a User, I want to view and send messages in individual customer threads, so that I can manage conversations effectively.

#### Acceptance Criteria

1. WHEN a User selects a Customer, THE System SHALL display all Messages in that Thread ordered by timestamp
2. THE System SHALL display each Message with its content, timestamp, and direction (incoming/outgoing)
3. WHEN a Message contains an image, THE System SHALL display the image inline in the Thread
4. WHEN a User sends a text Message, THE System SHALL store it with direction "outgoing" and send it via n8n
5. WHEN a User uploads an image Message, THE System SHALL store the image and send it via n8n
6. WHEN a new Message arrives via webhook, THE System SHALL add it to the appropriate Thread in real-time

### Requirement 8: Real-time Message Updates

**User Story:** As a User, I want to receive messages in real-time, so that I can respond promptly to customer inquiries.

#### Acceptance Criteria

1. THE System SHALL establish a WebSocket connection when a User accesses the chat interface
2. WHEN a new Message arrives for the User's Account, THE System SHALL push the Message to the User's client via WebSocket
3. WHEN a Message is pushed via WebSocket, THE System SHALL update the Thread display without page refresh
4. THE System SHALL maintain WebSocket connections only for authenticated Users
5. WHEN a WebSocket connection is lost, THE System SHALL attempt to reconnect automatically

### Requirement 9: Order Display and Management

**User Story:** As a User, I want to view and manage all orders from my Shopify store, so that I can track order status and fulfillment.

#### Acceptance Criteria

1. THE System SHALL display all Orders associated with the User's Account
2. WHEN displaying Orders, THE System SHALL show Order Number, Total amount, and Status
3. THE System SHALL provide filters for Order Status (Pending, Confirmed, Cancelled)
4. WHEN a User applies a filter, THE System SHALL display only Orders matching the selected Status
5. THE System SHALL link each Order to its associated Customer
6. WHEN Order data is updated, THE System SHALL refresh the display in real-time

### Requirement 10: Order Status Updates

**User Story:** As a User, I want to update order status, so that I can confirm or cancel orders based on customer responses.

#### Acceptance Criteria

1. THE System SHALL allow Users to change an Order's Status to "Confirmed" or "Cancelled"
2. WHEN a User updates an Order Status, THE System SHALL validate that the Order belongs to the User's Account
3. WHEN an Order Status is updated, THE System SHALL persist the change to the database
4. WHEN an Order Status is updated, THE System SHALL broadcast the change via WebSocket to update the dashboard
5. THE System SHALL record the timestamp of Status changes

### Requirement 11: Incoming WhatsApp Message Processing

**User Story:** As the System, I want to receive and process incoming WhatsApp messages via n8n webhook, so that customer messages appear in the correct threads.

#### Acceptance Criteria

1. THE System SHALL expose a webhook endpoint to receive incoming Messages from n8n
2. WHEN a webhook receives a Message, THE System SHALL extract the Customer phone number, message content, and message type
3. WHEN a Customer does not exist for the phone number, THE System SHALL create a new Customer record
4. WHEN a webhook receives a Message, THE System SHALL store it with direction "incoming" and associate it with the Customer
5. WHEN a webhook receives an image Message, THE System SHALL store the image URL or data
6. THE System SHALL validate that the webhook request contains required authentication or signature
7. WHEN a Message is received via webhook, THE System SHALL broadcast it to the appropriate User's WebSocket connection

### Requirement 12: Outgoing WhatsApp Message Sending

**User Story:** As a User, I want to send messages to customers via WhatsApp, so that I can respond to inquiries and provide support.

#### Acceptance Criteria

1. WHEN a User sends a Message, THE System SHALL retrieve the User's n8n Webhook URL from configuration
2. WHEN a User sends a Message, THE System SHALL format the request payload with Customer phone number and message content
3. THE System SHALL send the Message to the n8n Webhook URL via HTTP POST request
4. WHEN the n8n request succeeds, THE System SHALL store the Message with direction "outgoing"
5. WHEN the n8n request fails, THE System SHALL return an error to the User and not store the Message
6. THE System SHALL support sending both text and image Messages through n8n

### Requirement 13: WhatsApp Button Response Handling

**User Story:** As the System, I want to process WhatsApp button responses (Confirm, Cancel, Support), so that order status can be updated automatically based on customer actions.

#### Acceptance Criteria

1. WHEN a webhook receives a button response with action "Confirm", THE System SHALL update the associated Order Status to "Confirmed"
2. WHEN a webhook receives a button response with action "Cancel", THE System SHALL update the associated Order Status to "Cancelled"
3. WHEN a webhook receives a button response with action "Support", THE System SHALL create a new Message in the Customer's Thread
4. THE System SHALL extract the Order identifier from the button response payload
5. WHEN a button response updates an Order, THE System SHALL broadcast the update via WebSocket
6. THE System SHALL validate that the Order belongs to the correct Account before updating

### Requirement 14: Shopify Order Synchronization

**User Story:** As a User, I want my Shopify orders to sync with the CRM, so that I can manage them alongside customer conversations.

#### Acceptance Criteria

1. THE System SHALL receive Order data from Shopify via n8n webhook
2. WHEN an Order webhook is received, THE System SHALL extract Order Number, Total, Status, and Customer information
3. WHEN an Order webhook is received, THE System SHALL match or create a Customer record based on phone number
4. THE System SHALL store the Order with a reference to the Shopify Order ID
5. WHEN an Order is created or updated, THE System SHALL broadcast the change via WebSocket
6. THE System SHALL associate each Order with the correct Account based on the User's Shopify configuration

### Requirement 15: Image Upload and Display

**User Story:** As a User, I want to send and receive images in conversations, so that I can share product photos and visual information with customers.

#### Acceptance Criteria

1. THE System SHALL provide an interface for Users to upload image files
2. WHEN a User uploads an image, THE System SHALL validate the file type (JPEG, PNG, GIF)
3. WHEN a User uploads an image, THE System SHALL validate the file size does not exceed 5MB
4. THE System SHALL store uploaded images and generate accessible URLs
5. WHEN displaying Messages with images, THE System SHALL render the image inline in the Thread
6. WHEN an incoming webhook contains an image, THE System SHALL download and store the image

### Requirement 16: API Security and Authentication

**User Story:** As a platform administrator, I want all API endpoints to be secure, so that unauthorized access is prevented.

#### Acceptance Criteria

1. THE System SHALL require authentication tokens for all protected API endpoints
2. WHEN a request lacks a valid authentication token, THE System SHALL return a 401 Unauthorized error
3. THE System SHALL validate authentication tokens on every protected request
4. THE System SHALL implement rate limiting on webhook endpoints to prevent abuse
5. THE System SHALL log all authentication failures for security monitoring
6. THE System SHALL use HTTPS for all API communications in production

### Requirement 17: Database Schema and Relationships

**User Story:** As a developer, I want a well-structured database schema, so that data relationships are clear and queries are efficient.

#### Acceptance Criteria

1. THE System SHALL store User records with Email, Password hash, Shopify Domain, and n8n Webhook URL
2. THE System SHALL store Customer records with Phone Number, Name, and Account identifier
3. THE System SHALL store Message records with Content, Type, Direction, Customer reference, and Timestamp
4. THE System SHALL store Order records with Shopify ID, Order Number, Total, Status, and Customer reference
5. THE System SHALL enforce foreign key constraints between Customers and Accounts
6. THE System SHALL enforce foreign key constraints between Messages and Customers
7. THE System SHALL enforce foreign key constraints between Orders and Customers
8. THE System SHALL create indexes on Account identifiers and Customer identifiers for query performance

### Requirement 18: Error Handling and Logging

**User Story:** As a developer, I want comprehensive error handling and logging, so that I can diagnose and fix issues quickly.

#### Acceptance Criteria

1. WHEN an error occurs in any API endpoint, THE System SHALL return a structured error response with error code and message
2. THE System SHALL log all errors with timestamp, error details, and stack trace
3. WHEN a webhook request fails validation, THE System SHALL log the failure and return a 400 Bad Request error
4. WHEN an integration request to n8n fails, THE System SHALL log the failure and return an error to the User
5. THE System SHALL log all successful webhook receptions for audit purposes
6. THE System SHALL not expose sensitive information (passwords, tokens) in error messages or logs

