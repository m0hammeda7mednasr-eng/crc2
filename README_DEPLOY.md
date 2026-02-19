# WhatsApp CRM - Deployment Ready! 🚀

## Quick Deploy (5 Minutes)

### 1. Database - Supabase
- Go to https://supabase.com
- Create project
- Copy `DATABASE_URL`

### 2. Backend - Railway
- Go to https://railway.app
- Deploy from GitHub
- Add environment variables
- Done!

### 3. Frontend - Vercel
- Go to https://vercel.com
- Import repository
- Add `VITE_API_URL`
- Done!

---

## Files Included

- ✅ `railway.json` - Railway configuration
- ✅ `vercel.json` - Vercel configuration
- ✅ `.env.production.example` - Environment variables template
- ✅ `DEPLOY_COMPLETE_AR.md` - Complete deployment guide (Arabic)
- ✅ `DEPLOY_GUIDE_AR.md` - Detailed guide (Arabic)

---

## Environment Variables

### Backend (Railway)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
NODE_ENV=production
CLIENT_URL=https://your-app.vercel.app
FRONTEND_URL=https://your-app.vercel.app
SHOPIFY_REDIRECT_URI=https://your-backend.railway.app/api/shopify/auth/callback
SHOPIFY_SCOPES=read_orders,write_webhooks,read_customers
```

### Frontend (Vercel)
```env
VITE_API_URL=https://your-backend.railway.app
```

---

## Post-Deployment

### Create Admin User
```bash
curl -X POST https://your-backend.railway.app/api/setup-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@crm.com","password":"Admin@123456"}'
```

### Shopify Webhook URL
```
https://your-backend.railway.app/api/webhook/shopify/orders?userId=YOUR_USER_ID
```

---

## Features

✅ 100% Free hosting
✅ Automatic HTTPS
✅ Fixed URLs (no ngrok!)
✅ Auto-deploy from GitHub
✅ Built-in logging
✅ Auto-scaling

---

## Tech Stack

- **Frontend:** React + TypeScript + Vite + TailwindCSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL (Supabase)
- **Real-time:** Socket.IO
- **Auth:** JWT
- **ORM:** Prisma

---

## Documentation

- 📖 [Complete Deployment Guide (Arabic)](./DEPLOY_COMPLETE_AR.md)
- 📖 [Detailed Guide (Arabic)](./DEPLOY_GUIDE_AR.md)
- 📖 [Production vs Localhost (Arabic)](./LOCALHOST_VS_PRODUCTION_AR.md)

---

## Support

For deployment help, check:
1. `DEPLOY_COMPLETE_AR.md` - Quick guide
2. `DEPLOY_GUIDE_AR.md` - Detailed guide
3. Railway/Vercel logs - For debugging

---

**Ready to deploy!** 🚀

