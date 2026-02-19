# Shopify OAuth Integration Setup Guide

## Overview
This CRM uses Shopify OAuth for secure store integration. Each user configures their own Shopify app credentials, similar to how n8n handles Shopify connections.

## How It Works

### 1. User-Specific Credentials
- Each user provides their own Shopify app credentials
- Credentials are stored securely in the database (encrypted in production)
- The OAuth redirect URL is the same for all users

### 2. OAuth Flow
```
User → Configure Credentials → Start OAuth → Shopify Authorization → Callback → Connected
```

## Setup Instructions

### Step 1: Create a Shopify App

1. Go to your Shopify Admin Panel
2. Navigate to **Settings** → **Apps and sales channels** → **Develop apps**
3. Click **Create an app**
4. Enter app name (e.g., "My CRM Integration")
5. Click **Create app**

### Step 2: Configure App Permissions

1. Click **Configure Admin API scopes**
2. Select the following scopes:
   - `read_orders` - Read order data
   - `write_webhooks` - Create webhooks for order notifications
   - `read_customers` - Read customer information
3. Click **Save**

### Step 3: Get OAuth Credentials

1. Click **API credentials** tab
2. Under **Admin API access token**, click **Install app**
3. You'll see:
   - **API key** (this is your Client ID)
   - **API secret key** (this is your Client Secret)
4. Copy both values

### Step 4: Configure OAuth Redirect URL

In your Shopify app settings:

1. Go to **App setup** → **URLs**
2. Set **Allowed redirection URL(s)** to:
   ```
   http://localhost:5000/api/shopify/auth/callback
   ```
   
   For production, use your actual domain:
   ```
   https://your-domain.com/api/shopify/auth/callback
   ```

### Step 5: Configure in CRM

1. Login to your CRM account
2. Go to **Settings** page
3. In the **Shopify Integration** section:
   - Click **Configure Shopify Credentials**
   - Enter your **Shop Domain** (e.g., `your-store.myshopify.com`)
   - Enter your **Client ID** (API Key from Shopify)
   - Enter your **Client Secret** (API Secret Key from Shopify)
   - Click **Save Credentials**

4. Click **Connect with Shopify**
5. You'll be redirected to Shopify to authorize the connection
6. After authorization, you'll be redirected back to the CRM

## Environment Variables

### Backend (.env)

```env
# Shopify OAuth Configuration
# This is the redirect URL that Shopify will call after authorization
SHOPIFY_REDIRECT_URI="http://localhost:5000/api/shopify/auth/callback"
SHOPIFY_SCOPES="read_orders,write_webhooks,read_customers"

# Frontend URL for OAuth redirects
FRONTEND_URL="http://localhost:3000"
```

For production:
```env
SHOPIFY_REDIRECT_URI="https://your-domain.com/api/shopify/auth/callback"
FRONTEND_URL="https://your-frontend-domain.com"
```

## Database Schema

The following fields are stored per user:

```prisma
model User {
  shopifyDomain         String?    // e.g., your-store.myshopify.com
  shopifyClientId       String?    // Shopify API Key (Client ID)
  shopifyClientSecret   String?    // Encrypted - Shopify API Secret Key
  shopifyAccessToken    String?    // Encrypted - OAuth Access Token
  shopifyWebhookId      String?    // Webhook ID for order notifications
}
```

## API Endpoints

### Save Credentials
```http
POST /api/shopify/credentials
Authorization: Bearer <token>
Content-Type: application/json

{
  "shopifyDomain": "your-store.myshopify.com",
  "shopifyClientId": "your-api-key",
  "shopifyClientSecret": "your-api-secret"
}
```

### Start OAuth Flow
```http
GET /api/shopify/auth/start
Authorization: Bearer <token>
```

Returns:
```json
{
  "authUrl": "https://your-store.myshopify.com/admin/oauth/authorize?..."
}
```

### OAuth Callback (handled automatically)
```http
GET /api/shopify/auth/callback?code=...&state=...&shop=...&hmac=...
```

### Test Connection
```http
GET /api/shopify/test-connection
Authorization: Bearer <token>
```

### Disconnect Store
```http
POST /api/shopify/disconnect
Authorization: Bearer <token>
```

## Security Features

1. **CSRF Protection**: State parameter prevents cross-site request forgery
2. **HMAC Verification**: Validates that the callback came from Shopify
3. **Encrypted Storage**: Client secrets and access tokens are encrypted (in production)
4. **User Isolation**: Each user's credentials are completely separate

## Troubleshooting

### "Credentials not configured" error
- Make sure you've saved your Shopify credentials in the Settings page first
- Check that all three fields (domain, client ID, client secret) are filled

### "HMAC verification failed"
- Your Client Secret might be incorrect
- Re-enter your credentials and try again

### "Invalid redirect URI"
- Make sure the redirect URI in your Shopify app matches exactly:
  - Development: `http://localhost:5000/api/shopify/auth/callback`
  - Production: `https://your-domain.com/api/shopify/auth/callback`

### Connection test fails
- Your access token might have expired
- Try disconnecting and reconnecting your store

## Production Deployment

### Important Changes for Production:

1. **Update Environment Variables**:
   ```env
   SHOPIFY_REDIRECT_URI="https://your-domain.com/api/shopify/auth/callback"
   FRONTEND_URL="https://your-frontend-domain.com"
   ```

2. **Update Shopify App Settings**:
   - Change the redirect URL to your production domain
   - Add your production domain to allowed domains

3. **Enable Encryption**:
   - Implement proper encryption for `shopifyClientSecret` and `shopifyAccessToken`
   - Use a secure encryption key stored in environment variables

4. **Use HTTPS**:
   - Shopify requires HTTPS for OAuth in production
   - Ensure your domain has a valid SSL certificate

## Multi-User Support

This implementation supports multiple users, each with their own Shopify store:

- User A can connect to `store-a.myshopify.com`
- User B can connect to `store-b.myshopify.com`
- Each user's credentials and data are completely isolated
- The same redirect URL works for all users

## Comparison with n8n

This implementation follows the same pattern as n8n's Shopify OAuth:

| Feature | n8n | This CRM |
|---------|-----|----------|
| User provides credentials | ✅ | ✅ |
| Shared redirect URL | ✅ | ✅ |
| Per-user OAuth tokens | ✅ | ✅ |
| HMAC verification | ✅ | ✅ |
| State parameter | ✅ | ✅ |

## Next Steps

After connecting your Shopify store:

1. Orders will automatically sync to the CRM
2. Webhooks will be created for real-time order notifications
3. Customer data will be linked with WhatsApp conversations
4. You can test the connection using the "Test Connection" button

## Support

If you encounter any issues:

1. Check the browser console for errors
2. Check the backend logs for detailed error messages
3. Verify your Shopify app configuration
4. Ensure all environment variables are set correctly
