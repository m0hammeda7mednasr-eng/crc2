# 🚀 WhatsApp CRM - Shopify Integration

A professional CRM system for managing WhatsApp messages, Shopify orders, and customers with real-time updates.

## ✨ Features

- 📱 **WhatsApp Integration** - Manage customer messages
- 🛍️ **Shopify Integration** - Automatic order sync with shop domain support
- 👥 **Customer Management** - Track all customer interactions
- 📊 **Admin Dashboard** - Analytics and insights
- 🔐 **Secure Authentication** - JWT-based auth system
- ⚡ **Real-time Updates** - Socket.IO for instant notifications
- 🌐 **Multi-user Support** - Each user has their own data
- 🔗 **Webhook Support** - Direct Shopify webhooks with shop domain

## 🎯 New Feature: Shop Domain Webhooks

Instead of using complex user IDs, each store now has a clean webhook URL:

```
https://api.yourdomain.com/api/webhook/shopify/orders?shop=my-store
```

**Benefits:**
- ✅ Clear and intuitive
- ✅ Easy to manage multiple stores
- ✅ Professional appearance
- ✅ Automatic user detection

## 🛠️ Tech Stack

### Backend
- Node.js + Express + TypeScript
- Prisma ORM
- PostgreSQL / SQLite
- Socket.IO
- JWT Authentication

### Frontend
- React + TypeScript
- Vite
- TailwindCSS
- Socket.IO Client

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
npx prisma migrate dev
node create-admin.js
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## 🚀 Quick Start

### Development

```bash
# Start everything at once (Windows)
start-all.bat

# Or manually:
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: ngrok (for Shopify)
npx ngrok http 5000
```

### Default Admin Credentials

```
Email: admin@crm.com
Password: Admin@123456
```

## 🌐 Deployment

Deploy for free using:
- **Backend:** Railway
- **Frontend:** Vercel
- **Database:** Supabase

See [DEPLOY_COMPLETE_AR.md](./DEPLOY_COMPLETE_AR.md) for detailed instructions.

## 📝 Environment Variables

### Backend (.env)

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
CLIENT_URL="http://localhost:3000"
SHOPIFY_REDIRECT_URI="http://localhost:5000/api/shopify/auth/callback"
SHOPIFY_SCOPES="read_orders,write_webhooks,read_customers"
FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env)

```env
VITE_API_URL="http://localhost:5000"
```

## 🔗 Shopify Integration

### Setup Webhook

1. Go to Settings in the CRM
2. Copy the Shopify Webhook URL (includes your shop domain)
3. In Shopify Admin:
   - Settings → Notifications → Webhooks
   - Create webhook
   - Event: Order creation
   - Format: JSON
   - URL: Paste the copied URL
   - Save

### Webhook URL Format

```
https://api.yourdomain.com/api/webhook/shopify/orders?shop=your-store
```

The system automatically detects the user based on the shop domain!

## 📚 Documentation

### Quick Start
- [QUICK_START_AR.md](./QUICK_START_AR.md) - Quick start guide (Arabic)
- [START_HERE_AR.md](./START_HERE_AR.md) - Getting started (Arabic)

### Features
- [SHOP_DOMAIN_WEBHOOK_AR.md](./SHOP_DOMAIN_WEBHOOK_AR.md) - Shop domain webhooks (Arabic)
- [JWT_EXPLAINED_AR.md](./JWT_EXPLAINED_AR.md) - JWT authentication explained (Arabic)
- [ENV_VARIABLES_EXPLAINED_AR.md](./ENV_VARIABLES_EXPLAINED_AR.md) - Environment variables (Arabic)

### Deployment
- [DEPLOY_COMPLETE_AR.md](./DEPLOY_COMPLETE_AR.md) - Complete deployment guide (Arabic)
- [README_DEPLOY.md](./README_DEPLOY.md) - Deployment summary (English)

### Troubleshooting
- [FIX_ORDERS_AR.md](./FIX_ORDERS_AR.md) - Fix orders not showing (Arabic)
- [DEBUG_ORDERS_AR.md](./DEBUG_ORDERS_AR.md) - Debug guide (Arabic)

### Complete Index
- [INDEX_AR.md](./INDEX_AR.md) - Complete documentation index (Arabic)

## 🔧 Development

### Run Tests

```bash
cd backend
npm test
```

### Build for Production

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with modern web technologies
- Designed for Shopify store owners
- Optimized for WhatsApp customer communication

## 📞 Support

For issues and questions:
- Check the [documentation](./INDEX_AR.md)
- Review [troubleshooting guides](./FIX_ORDERS_AR.md)
- Open an issue on GitHub

---

**Made with ❤️ for Shopify store owners**

