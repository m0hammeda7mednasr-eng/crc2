# Quick Start Guide - 4Pixels WhatsApp-Shopify CRM

Get up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- Git installed

## Step 1: Clone and Install (2 minutes)

```bash
# Clone repository
git clone <repository-url>
cd 4pixels-whatsapp-shopify-crm

# Install all dependencies
npm install
```

## Step 2: Database Setup (1 minute)

```bash
# Create database
createdb crm_db

# Or using psql
psql -U postgres
CREATE DATABASE crm_db;
\q
```

## Step 3: Configure Environment (1 minute)

```bash
# Backend
cd backend
cp .env.example .env

# Edit .env and set:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/crm_db"
# JWT_SECRET="your-secret-key"

# Frontend
cd ../frontend
cp .env.example .env
# Default values should work for local development

cd ..
```

## Step 4: Initialize Database (30 seconds)

```bash
cd backend
npm run prisma:migrate
npm run prisma:generate
mkdir uploads
cd ..
```

## Step 5: Start Application (30 seconds)

```bash
# From root directory
npm run dev
```

This starts:
- Backend: http://localhost:5000
- Frontend: http://localhost:3000

## Step 6: Create Your Account

1. Open http://localhost:3000
2. Click "Register"
3. Enter email and password
4. Click "Register"

Done! You're now logged in.

## Next Steps

### Configure n8n Integration

1. Install n8n:
```bash
npm install -g n8n
n8n start
```

2. Open http://localhost:5678
3. Create WhatsApp workflow
4. Copy webhook URL
5. Go to Settings in CRM
6. Paste webhook URL
7. Save

### Test the System

1. **Dashboard**: View statistics
2. **Chat**: See customer list (empty initially)
3. **Orders**: View orders (empty initially)
4. **Settings**: Configure integrations

### Simulate Incoming Message

Use curl to test webhook:

```bash
curl -X POST http://localhost:5000/api/webhooks/whatsapp/incoming \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "content": "Hello!",
    "type": "text",
    "userId": "YOUR_USER_ID",
    "customerName": "Test Customer"
  }'
```

Replace `YOUR_USER_ID` with your actual user ID (check database or API response).

### Simulate Order

```bash
curl -X POST http://localhost:5000/api/webhooks/shopify/orders \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "12345",
    "orderNumber": "ORD-001",
    "total": 99.99,
    "status": "pending",
    "customerPhone": "+1234567890",
    "customerName": "Test Customer",
    "userId": "YOUR_USER_ID"
  }'
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database Connection Error

```bash
# Check PostgreSQL is running
pg_isready

# Restart PostgreSQL
# Mac: brew services restart postgresql
# Linux: sudo systemctl restart postgresql
# Windows: net start postgresql-x64-14
```

### Prisma Migration Error

```bash
cd backend
npx prisma migrate reset
npx prisma migrate dev
npx prisma generate
```

## Docker Quick Start (Alternative)

If you prefer Docker:

```bash
# Start everything with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop
docker-compose down
```

## Useful Commands

```bash
# Backend only
cd backend && npm run dev

# Frontend only
cd frontend && npm run dev

# Run tests
npm test

# Build for production
npm run build

# View database
cd backend && npx prisma studio
```

## Default Ports

- Frontend: 3000
- Backend: 5000
- PostgreSQL: 5432
- n8n: 5678
- Prisma Studio: 5555

## Getting Help

- Check README.md for detailed information
- See INSTALLATION.md for step-by-step guide
- Review API_DOCUMENTATION.md for API details
- Read PROJECT_SUMMARY.md for architecture overview

## What's Next?

1. ✅ System is running
2. ✅ Account created
3. 🔄 Configure n8n workflows
4. 🔄 Connect Shopify store
5. 🔄 Test message flow
6. 🔄 Invite team members
7. 🚀 Start managing conversations!

---

**Need help?** Check the documentation or contact support.

**Happy coding! 🎉**
