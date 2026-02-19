# Webhook URLs Guide - Per-User Configuration

## Overview
Each user now has their own unique webhook URL for receiving incoming WhatsApp messages from n8n. This ensures proper message routing in multi-user environments.

## User-Specific Webhook URL

### Format
```
http://localhost:5000/api/webhook/incoming/{userId}
```

For production:
```
https://your-domain.com/api/webhook/incoming/{userId}
```

### How to Get Your Webhook URL

1. Login to your CRM account
2. Go to **Settings** page
3. In the **WhatsApp Integration** section, you'll see:
   - **Your Incoming Webhook URL** (read-only field)
   - Click the **Copy** button to copy the URL

### Example URLs

User 1:
```
http://localhost:5000/api/webhook/incoming/abc123-user-id-1
```

User 2:
```
http://localhost:5000/api/webhook/incoming/xyz789-user-id-2
```

## n8n Configuration

### Step 1: Get Your Webhook URL from CRM
1. Open CRM Settings page
2. Copy your unique incoming webhook URL

### Step 2: Configure n8n Workflow

In your n8n WhatsApp workflow:

1. Add an **HTTP Request** node after receiving the WhatsApp message
2. Configure the node:
   - **Method**: POST
   - **URL**: Paste your copied webhook URL
   - **Body Content Type**: JSON
   - **Body**:
     ```json
     {
       "phoneNumber": "{{ $json.from }}",
       "content": "{{ $json.body }}",
       "type": "text",
       "customerName": "{{ $json.name }}"
     }
     ```

### Example n8n Workflow Structure

```
WhatsApp Trigger
    ↓
HTTP Request (Send to CRM)
    URL: http://localhost:5000/api/webhook/incoming/YOUR_USER_ID
    Method: POST
    Body: {
      "phoneNumber": "{{ $json.from }}",
      "content": "{{ $json.body }}",
      "type": "text"
    }
```

## Webhook Endpoints

### 1. Incoming Messages (User-Specific) ✅ RECOMMENDED
```http
POST /api/webhook/incoming/:userId
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "content": "Hello!",
  "type": "text",
  "customerName": "John Doe"
}
```

**Benefits:**
- Automatic user routing
- No need to include userId in payload
- Secure and isolated per user

### 2. Outgoing Messages (n8n Webhook)
Configure in CRM Settings:
```
n8n Outgoing Webhook URL: https://your-n8n-instance.com/webhook/send-whatsapp
```

The CRM will send messages to this URL when you reply to customers.

### 3. Legacy Endpoints (Backward Compatibility)

These still work but are not recommended for multi-user setups:

```http
POST /api/webhook/whatsapp/incoming
POST /api/webhook/whatsapp/button
POST /api/webhook/shopify/orders
```

## Settings Page Features

### WhatsApp Integration Section

1. **Your Incoming Webhook URL** (Read-Only)
   - Displays your unique webhook URL
   - Includes a Copy button for easy copying
   - Format: `http://localhost:5000/api/webhook/incoming/{your-user-id}`

2. **n8n Outgoing Webhook URL** (Editable)
   - Enter your n8n webhook URL for sending messages
   - This is where the CRM sends outgoing messages

### Shopify Integration Section

1. **Configure Credentials**
   - Shop Domain
   - Client ID (API Key)
   - Client Secret (API Secret Key)

2. **Connect with Shopify**
   - OAuth authorization flow
   - Secure token storage

3. **Connection Status**
   - Shows if connected
   - Test connection button
   - Disconnect option

## Security Features

1. **User Isolation**: Each user's webhook URL is unique and isolated
2. **Rate Limiting**: Webhook endpoints are rate-limited to prevent abuse
3. **Validation**: All incoming data is validated before processing
4. **Error Handling**: Proper error responses for debugging

## Testing Your Webhook

### Using curl (Linux/Mac)
```bash
curl -X POST http://localhost:5000/api/webhook/incoming/YOUR_USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "content": "Test message",
    "type": "text"
  }'
```

### Using PowerShell (Windows)
```powershell
$body = @{
    phoneNumber = "+1234567890"
    content = "Test message"
    type = "text"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/webhook/incoming/YOUR_USER_ID" `
  -Method Post `
  -Body $body `
  -ContentType "application/json"
```

### Expected Response
```json
{
  "message": "Message received and processed",
  "customer": {
    "id": "...",
    "phoneNumber": "+1234567890",
    "name": "..."
  },
  "messageId": "..."
}
```

## Troubleshooting

### "User not found" Error
- Make sure you're using the correct userId in the URL
- Copy the URL from the Settings page to ensure accuracy

### Messages Not Appearing in CRM
1. Check that the webhook URL is correct
2. Verify the payload format matches the expected structure
3. Check backend logs for errors
4. Ensure the user is logged in to see real-time updates

### n8n Connection Issues
1. Verify the outgoing webhook URL is correct in Settings
2. Check that n8n is accessible from your CRM server
3. Test the n8n webhook independently

## Production Deployment

### Important Changes:

1. **Update Webhook URLs**:
   - Use HTTPS in production
   - Update the base URL in environment variables

2. **Environment Variables**:
   ```env
   BACKEND_URL=https://your-domain.com
   FRONTEND_URL=https://your-frontend-domain.com
   ```

3. **n8n Configuration**:
   - Update webhook URLs to use production domain
   - Ensure n8n can reach your production server

4. **Security**:
   - Enable HTTPS
   - Use proper authentication tokens
   - Implement webhook signature verification (recommended)

## Multi-User Benefits

With user-specific webhook URLs:

1. **Isolation**: Each user's messages are automatically routed to their account
2. **Scalability**: Support unlimited users without conflicts
3. **Security**: Users can't access each other's messages
4. **Simplicity**: No need to include userId in every webhook payload
5. **Debugging**: Easy to identify which user a webhook belongs to

## Migration from Legacy Webhooks

If you're currently using the legacy webhook format:

1. Update your n8n workflow to use the new URL format
2. Copy your unique webhook URL from the Settings page
3. Test the new webhook
4. Remove the old webhook configuration

The legacy endpoints will continue to work but are not recommended for multi-user setups.

## Support

If you encounter any issues:

1. Check the Settings page for your correct webhook URL
2. Verify the payload format
3. Check backend logs for detailed error messages
4. Test with curl/PowerShell to isolate the issue
