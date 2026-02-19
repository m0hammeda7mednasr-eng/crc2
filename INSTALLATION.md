# Installation Guide - 4Pixels WhatsApp-Shopify CRM

## Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 14
- npm or yarn
- Git

## Step-by-Step Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd 4pixels-whatsapp-shopify-crm
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

cd ..
```

### 3. Set Up PostgreSQL Database

Create a new PostgreSQL database:

```sql
CREATE DATABASE crm_db;
CREATE USER crm_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE crm_db TO crm_user;
```

### 4. Configure Environment Variables

#### Backend Configuration

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
DATABASE_URL="postgresql://crm_user:your_password@localhost:5432/crm_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
CLIENT_URL="http://localhost:3000"
MAX_FILE_SIZE=5242880
UPLOAD_DIR="./uploads"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend Configuration

```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=http://localhost:5000
```

### 5. Set Up Database Schema

```bash
cd backend
npm run prisma:migrate
npm run prisma:generate
```

### 6. Create Upload Directory

```bash
mkdir uploads
```

### 7. Start Development Servers

From the root directory:

```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend server on http://localhost:3000

Or start them separately:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 8. Access the Application

Open your browser and navigate to:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

### 9. Register Your First User

1. Go to http://localhost:3000/register
2. Enter your email and password
3. Click "Register"
4. You'll be automatically logged in

### 10. Configure Integrations

1. Go to Settings page
2. Add your n8n Webhook URL
3. Add your Shopify Domain and API Key
4. Click "Save Settings"

## n8n Integration Setup

### 1. Install n8n

```bash
npm install -g n8n
```

### 2. Start n8n

```bash
n8n start
```

### 3. Create WhatsApp Workflow

1. Open n8n at http://localhost:5678
2. Create a new workflow
3. Add WhatsApp Trigger node
4. Add HTTP Request node pointing to:
   - URL: `http://localhost:5000/api/webhooks/whatsapp/incoming`
   - Method: POST
   - Body: JSON with phoneNumber, content, type, userId

### 4. Create Shopify Workflow

1. Add Shopify Trigger node (Order Created)
2. Add HTTP Request node pointing to:
   - URL: `http://localhost:5000/api/webhooks/shopify/orders`
   - Method: POST
   - Body: JSON with order details

## Troubleshooting

### Database Connection Issues

If you get database connection errors:

1. Check PostgreSQL is running:
```bash
# Windows
net start postgresql-x64-14

# Linux/Mac
sudo systemctl status postgresql
```

2. Verify database credentials in `.env`
3. Test connection:
```bash
psql -U crm_user -d crm_db
```

### Port Already in Use

If port 5000 or 3000 is already in use:

1. Change PORT in `backend/.env`
2. Update VITE_API_URL in `frontend/.env`
3. Restart servers

### Prisma Migration Issues

If migrations fail:

```bash
cd backend
npx prisma migrate reset
npx prisma migrate dev
npx prisma generate
```

### WebSocket Connection Issues

1. Check CORS settings in `backend/src/index.ts`
2. Verify CLIENT_URL in `backend/.env`
3. Check browser console for errors

## Production Deployment

### 1. Build Applications

```bash
# Build backend
cd backend
npm run build

# Build frontend
cd ../frontend
npm run build
```

### 2. Set Production Environment Variables

Update `.env` files with production values:
- Use strong JWT_SECRET
- Set NODE_ENV=production
- Use production database URL
- Configure proper CORS origins

### 3. Start Production Server

```bash
# Backend
cd backend
npm start

# Frontend (serve static files)
# Use nginx or serve from Express
```

### 4. Use Process Manager

```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start dist/index.js --name crm-backend

# Monitor
pm2 monit
```

## Docker Deployment (Optional)

See `docker-compose.yml` for containerized deployment.

```bash
docker-compose up -d
```

## Support

For issues and questions:
- Check the README.md
- Review the API documentation
- Contact support team

## Next Steps

1. Configure your n8n workflows
2. Connect your Shopify store
3. Test WhatsApp message flow
4. Invite team members
5. Start managing conversations!
