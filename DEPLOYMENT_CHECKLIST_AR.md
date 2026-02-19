# ✅ Deployment Checklist - قائمة التحقق

## 📋 قبل البدء

- [ ] حساب GitHub جاهز
- [ ] المشروع مرفوع على GitHub
- [ ] حساب Supabase جاهز
- [ ] حساب Railway جاهز
- [ ] حساب Vercel جاهز

---

## 1️⃣ Database (Supabase)

### إنشاء Project:
- [ ] فتح https://supabase.com/
- [ ] إنشاء project جديد
- [ ] اختيار password قوي وحفظه
- [ ] انتظار إنشاء الـ project (2-3 دقائق)

### الحصول على Connection String:
- [ ] Settings → Database
- [ ] نسخ Connection string
- [ ] استبدال [PASSWORD] بالـ password الحقيقي
- [ ] حفظ الـ URL في مكان آمن

### تشغيل Migrations:
- [ ] فتح Terminal
- [ ] `cd backend`
- [ ] `DATABASE_URL="[URL]" npx prisma migrate deploy`
- [ ] التأكد من نجاح الـ migrations

---

## 2️⃣ Backend (Railway)

### إنشاء Project:
- [ ] فتح https://railway.app/
- [ ] تسجيل دخول بـ GitHub
- [ ] New Project → Deploy from GitHub repo
- [ ] اختيار Repository: crc2
- [ ] Deploy

### إعداد Build Settings:
- [ ] Settings → Build
- [ ] Root Directory: `backend`
- [ ] Build Command: `npm install && npx prisma generate && npm run build`
- [ ] Start Command: `npm run start`
- [ ] Watch Paths: `backend/**`
- [ ] Save

### إضافة Environment Variables:
- [ ] Variables tab
- [ ] إضافة `DATABASE_URL` (من Supabase)
- [ ] إضافة `JWT_SECRET` (استخدم: `openssl rand -base64 32`)
- [ ] إضافة `JWT_EXPIRES_IN=7d`
- [ ] إضافة `PORT=5000`
- [ ] إضافة `NODE_ENV=production`
- [ ] إضافة `SHOPIFY_SCOPES=read_orders,write_webhooks,read_customers`
- [ ] إضافة `RATE_LIMIT_WINDOW_MS=900000`
- [ ] إضافة `RATE_LIMIT_MAX_REQUESTS=100`
- [ ] إضافة `MAX_FILE_SIZE=5242880`
- [ ] إضافة `UPLOAD_DIR=./uploads`

### الحصول على Railway URL:
- [ ] Settings → Domains
- [ ] Generate Domain
- [ ] نسخ الـ URL (مثال: https://xxx.up.railway.app)
- [ ] حفظه للاستخدام في Vercel

### تحديث Shopify Variables:
- [ ] إضافة `SHOPIFY_REDIRECT_URI=https://[RAILWAY-URL]/api/shopify/auth/callback`
- [ ] Save

### التحقق:
- [ ] فتح https://[RAILWAY-URL]/
- [ ] يجب أن تشوف: "WhatsApp CRM API is running"

---

## 3️⃣ Frontend (Vercel)

### Import Project:
- [ ] فتح https://vercel.com/
- [ ] تسجيل دخول بـ GitHub
- [ ] Add New → Project
- [ ] اختيار Repository: crc2
- [ ] Import

### Configure Project:
- [ ] Framework Preset: `Vite`
- [ ] Root Directory: `frontend`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `npm install`

### إضافة Environment Variables:
- [ ] Environment Variables section
- [ ] Name: `VITE_API_URL`
- [ ] Value: `https://[RAILWAY-URL]` (بدون trailing slash)
- [ ] Apply to: Production, Preview, Development

### Deploy:
- [ ] اضغط Deploy
- [ ] انتظر 2-3 دقائق
- [ ] نسخ Vercel URL بعد النجاح

### التحقق:
- [ ] فتح https://[VERCEL-URL]/
- [ ] يجب أن تشوف صفحة Login

---

## 4️⃣ ربط Frontend بـ Backend

### تحديث Railway Variables:
- [ ] الرجوع لـ Railway Dashboard
- [ ] Variables tab
- [ ] إضافة `CLIENT_URL=https://[VERCEL-URL]`
- [ ] إضافة `FRONTEND_URL=https://[VERCEL-URL]`
- [ ] Save
- [ ] انتظار Redeploy التلقائي

### التحقق من CORS:
- [ ] فتح Frontend
- [ ] محاولة Login
- [ ] يجب أن يعمل بدون CORS errors

---

## 5️⃣ إنشاء Admin User

### الطريقة 1: Railway CLI
```bash
railway login
railway link
cd backend
railway run node create-admin.js
```

- [ ] تثبيت Railway CLI
- [ ] تسجيل دخول
- [ ] ربط الـ project
- [ ] تشغيل create-admin script

### الطريقة 2: Prisma Studio
```bash
cd backend
DATABASE_URL="[SUPABASE-URL]" npx prisma studio
```

- [ ] فتح Prisma Studio
- [ ] Users table
- [ ] إضافة user:
  - email: admin@crm.com
  - passwordHash: [استخدم bcrypt]
  - role: ADMIN

### التحقق:
- [ ] فتح Frontend
- [ ] Login بـ admin@crm.com
- [ ] يجب أن يعمل

---

## 6️⃣ اختبار النظام

### Frontend:
- [ ] صفحة Login تعمل
- [ ] تسجيل دخول Admin يعمل
- [ ] Dashboard يظهر
- [ ] Settings page تعمل
- [ ] Chat page تعمل

### Backend:
- [ ] API يستجيب
- [ ] Authentication يعمل
- [ ] Database connection تعمل
- [ ] Socket.IO يعمل

### Shopify Integration:
- [ ] Settings → Shopify Integration
- [ ] إدخال Client ID, Secret, Shop Domain
- [ ] OAuth flow يعمل
- [ ] Webhook URL يظهر

---

## 7️⃣ إعداد Shopify Webhooks

### في Shopify Admin:
- [ ] Settings → Notifications → Webhooks
- [ ] Create webhook
- [ ] Event: Order creation
- [ ] Format: JSON
- [ ] URL: `https://[RAILWAY-URL]/api/webhook/shopify/orders?shop=[SHOP-DOMAIN]`
- [ ] Save

### اختبار Webhook:
- [ ] إنشاء order تجريبي في Shopify
- [ ] التحقق من ظهوره في CRM
- [ ] التحقق من Customer data
- [ ] التحقق من Order details

---

## 8️⃣ الأمان والصيانة

### الأمان:
- [ ] تغيير Admin password
- [ ] التأكد من JWT_SECRET عشوائي
- [ ] التأكد من DATABASE_URL آمن
- [ ] التأكد من HTTPS فقط

### Monitoring:
- [ ] Railway Logs
- [ ] Vercel Analytics
- [ ] Supabase Logs

### Backups:
- [ ] Supabase automatic backups enabled
- [ ] Git repository updated

---

## ✅ النجاح!

إذا كل الخطوات ✅:

### URLs النهائية:
```
Frontend: https://[YOUR-APP].vercel.app
Backend:  https://[YOUR-APP].up.railway.app
Database: db.[YOUR-REF].supabase.co
```

### Credentials:
```
Admin Email: admin@crm.com
Admin Password: [اللي اخترته]
```

### Shopify Webhook:
```
https://[YOUR-APP].up.railway.app/api/webhook/shopify/orders?shop=[SHOP-DOMAIN]
```

---

## 📊 Environment Variables - النسخة النهائية

### Backend (Railway):
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
JWT_SECRET=[RANDOM-32-CHARS]
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=production
CLIENT_URL=https://[VERCEL-URL]
FRONTEND_URL=https://[VERCEL-URL]
SHOPIFY_REDIRECT_URI=https://[RAILWAY-URL]/api/shopify/auth/callback
SHOPIFY_SCOPES=read_orders,write_webhooks,read_customers
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

### Frontend (Vercel):
```
VITE_API_URL=https://[RAILWAY-URL]
```

---

## 🎉 تم!

المشروع الآن:
- ✅ Live على الإنترنت
- ✅ متصل بـ Database
- ✅ جاهز لاستقبال Shopify orders
- ✅ آمن ومحمي
- ✅ جاهز للاستخدام

**مبروك! 🚀**
