# 📝 Environment Variables - Template كامل

## 🎯 نسخ ولصق جاهز

---

## 1️⃣ Backend (Railway)

### انسخ ده كله والصقه في Railway Variables:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD_HERE@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
JWT_SECRET=GENERATE_THIS_WITH_OPENSSL_RAND_BASE64_32
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=production
CLIENT_URL=https://YOUR_VERCEL_APP_NAME.vercel.app
FRONTEND_URL=https://YOUR_VERCEL_APP_NAME.vercel.app
SHOPIFY_REDIRECT_URI=https://YOUR_RAILWAY_APP_NAME.up.railway.app/api/shopify/auth/callback
SHOPIFY_SCOPES=read_orders,write_webhooks,read_customers
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

### 📝 استبدل:
- `YOUR_PASSWORD_HERE` → Supabase database password
- `YOUR_PROJECT_REF` → Supabase project reference (من الـ URL)
- `GENERATE_THIS_WITH_OPENSSL_RAND_BASE64_32` → شغل: `openssl rand -base64 32`
- `YOUR_VERCEL_APP_NAME` → اسم الـ app على Vercel
- `YOUR_RAILWAY_APP_NAME` → اسم الـ app على Railway

---

## 2️⃣ Frontend (Vercel)

### انسخ ده والصقه في Vercel Environment Variables:

```
VITE_API_URL=https://YOUR_RAILWAY_APP_NAME.up.railway.app
```

### 📝 استبدل:
- `YOUR_RAILWAY_APP_NAME` → اسم الـ app على Railway

---

## 🔧 كيف تحصل على القيم

### 1. Supabase DATABASE_URL:

```
1. افتح Supabase Dashboard
2. Settings → Database
3. Connection string → URI
4. انسخ الـ URL
5. استبدل [YOUR-PASSWORD] بالـ password الحقيقي

مثال:
postgresql://postgres:MySecurePass123@db.abcdefghijk.supabase.co:5432/postgres
```

### 2. JWT_SECRET:

```bash
# في Terminal:
openssl rand -base64 32

# النتيجة مثلاً:
K7x9mP2nQ5wR8tY3vB6cD1eF4gH0jL9mN2oP5qR8sT1u
```

### 3. Railway URL:

```
1. في Railway Dashboard
2. Settings → Domains
3. اضغط "Generate Domain"
4. انسخ الـ URL

مثال:
https://whatsapp-crm-backend-production.up.railway.app
```

### 4. Vercel URL:

```
1. بعد Deploy على Vercel
2. انسخ الـ URL من Dashboard

مثال:
https://whatsapp-crm-frontend.vercel.app
```

---

## 📋 Checklist - تأكد من كل حاجة

### Backend (Railway):
- [ ] DATABASE_URL صحيح ويعمل
- [ ] JWT_SECRET عشوائي وطويل (32+ chars)
- [ ] CLIENT_URL = Vercel URL الصحيح
- [ ] FRONTEND_URL = Vercel URL الصحيح
- [ ] SHOPIFY_REDIRECT_URI = Railway URL + /api/shopify/auth/callback
- [ ] كل المتغيرات موجودة (12 متغير)

### Frontend (Vercel):
- [ ] VITE_API_URL = Railway URL الصحيح
- [ ] بدون trailing slash (/)
- [ ] HTTPS فقط

---

## 🎯 مثال كامل (للتوضيح فقط)

### Backend:
```env
DATABASE_URL=postgresql://postgres:MyPass123@db.abcdefg.supabase.co:5432/postgres
JWT_SECRET=K7x9mP2nQ5wR8tY3vB6cD1eF4gH0jL9mN2oP5qR8sT1u
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=production
CLIENT_URL=https://my-crm-app.vercel.app
FRONTEND_URL=https://my-crm-app.vercel.app
SHOPIFY_REDIRECT_URI=https://my-crm-backend.up.railway.app/api/shopify/auth/callback
SHOPIFY_SCOPES=read_orders,write_webhooks,read_customers
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

### Frontend:
```env
VITE_API_URL=https://my-crm-backend.up.railway.app
```

---

## ⚠️ مهم جداً

### لا تشارك أبداً:
- ❌ DATABASE_URL
- ❌ JWT_SECRET
- ❌ Supabase Password

### يمكن مشاركتها:
- ✅ Railway URL (public)
- ✅ Vercel URL (public)
- ✅ SHOPIFY_SCOPES (public)

---

## 🔍 التحقق من الصحة

### Backend:
```bash
# اختبر الـ API:
curl https://YOUR_RAILWAY_URL/

# يجب أن ترجع:
{"message":"WhatsApp CRM API is running"}
```

### Frontend:
```bash
# افتح في المتصفح:
https://YOUR_VERCEL_URL/

# يجب أن تشوف صفحة Login
```

### Database:
```bash
# اختبر الاتصال:
cd backend
DATABASE_URL="YOUR_DATABASE_URL" npx prisma db pull

# يجب أن يعمل بدون errors
```

---

## 📞 محتاج مساعدة؟

### مشكلة في Database:
- تأكد من Password صحيح
- تأكد من Project Reference صحيح
- تأكد من تشغيل Migrations

### مشكلة في CORS:
- تأكد من CLIENT_URL = Vercel URL
- تأكد من FRONTEND_URL = Vercel URL
- Redeploy Backend بعد التعديل

### مشكلة في Shopify:
- تأكد من SHOPIFY_REDIRECT_URI صحيح
- تأكد من Railway URL صحيح
- تأكد من /api/shopify/auth/callback موجود

---

## ✅ بعد إضافة كل المتغيرات

1. **Railway**: Redeploy تلقائياً
2. **Vercel**: Redeploy يدوياً (Settings → Deployments → Redeploy)
3. **اختبر**: افتح Frontend وجرب Login

---

**كل حاجة جاهزة! 🚀**
