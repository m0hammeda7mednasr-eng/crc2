# 🔐 Environment Variables - القيم الصحيحة

## 🚂 Railway Backend Environment Variables

```env
# Database (Supabase)
DATABASE_URL=postgresql://postgres.djsybibajbgatdupufri:01066184859Mm@aws-1-eu-central-1.pooler.supabase.com:5432/postgres

# JWT
JWT_SECRET=BD-JF9I$16ejXoS*KdcAtyai8WgN_nm4f?h+vMU=&uEzT0xb
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=production

# Frontend URLs (⚠️ استبدل بـ Vercel URL الحقيقي)
CLIENT_URL=https://crc2-backend.vercel.app
FRONTEND_URL=https://crc2-backend.vercel.app

# Shopify (⚠️ استبدل بـ Railway URL الحقيقي)
SHOPIFY_REDIRECT_URI=https://backend-production-8d86c.up.railway.app/api/shopify/auth/callback
SHOPIFY_SCOPES=read_orders,write_webhooks,read_customers

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

---

## 🌐 Vercel Frontend Environment Variables

```env
# Backend API URL (⚠️ استبدل بـ Railway URL الحقيقي)
VITE_API_URL=https://backend-production-8d86c.up.railway.app
```

⚠️ **مهم جداً:**
- بدون `/` في الآخر
- بدون `/api` في الآخر
- استخدم Railway URL (مش Vercel URL!)

---

## 📝 ملاحظات مهمة

### Railway URLs
- Backend: `https://backend-production-8d86c.up.railway.app`
- احصل عليه من: Railway Dashboard → Service → Settings → Domains

### Vercel URLs
- Frontend: `https://crc2-backend.vercel.app`
- احصل عليه من: Vercel Dashboard → Project → Domains

### Shopify Redirect URI
- يجب أن يكون: `{RAILWAY_URL}/api/shopify/auth/callback`
- مثال: `https://backend-production-8d86c.up.railway.app/api/shopify/auth/callback`
- استخدمه في Shopify App Settings

---

## 🔄 كيفية التحديث

### في Railway:
1. افتح Railway Dashboard
2. اختر الـ Service
3. Variables tab
4. أضف أو عدل المتغيرات
5. احفظ (سيعمل Redeploy تلقائياً)

### في Vercel:
1. افتح Vercel Dashboard
2. اختر المشروع
3. Settings → Environment Variables
4. أضف أو عدل `VITE_API_URL`
5. اختر: Production, Preview, Development
6. احفظ
7. Deployments → اختر آخر Deployment → Redeploy

---

## ✅ Checklist

- [ ] Railway: DATABASE_URL صح
- [ ] Railway: JWT_SECRET موجود
- [ ] Railway: CLIENT_URL = Vercel URL
- [ ] Railway: FRONTEND_URL = Vercel URL
- [ ] Railway: SHOPIFY_REDIRECT_URI = Railway URL + /api/shopify/auth/callback
- [ ] Vercel: VITE_API_URL = Railway URL (بدون / في الآخر)
- [ ] Vercel: Redeploy بعد تغيير ENV
- [ ] اختبار: Frontend يتصل بـ Backend
- [ ] اختبار: Login يشتغل
- [ ] اختبار: Shopify OAuth يشتغل

---

## 🆘 المشاكل الشائعة

### 1. Double URL في الطلبات
```
https://crc2-backend.vercel.app/backend-production-8d86c.up.railway.app/api/...
```

**السبب:** `VITE_API_URL` في Vercel غلط

**الحل:** اضبطه على Railway URL فقط:
```
VITE_API_URL=https://backend-production-8d86c.up.railway.app
```

### 2. CORS Error
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**السبب:** `CLIENT_URL` في Railway غلط أو مش موجود

**الحل:** أضف في Railway:
```
CLIENT_URL=https://crc2-backend.vercel.app
FRONTEND_URL=https://crc2-backend.vercel.app
```

### 3. Shopify OAuth Redirect Error
```
Redirect URI mismatch
```

**السبب:** `SHOPIFY_REDIRECT_URI` مش مطابق لـ Shopify App Settings

**الحل:** 
1. تأكد من Railway ENV: `SHOPIFY_REDIRECT_URI=https://[RAILWAY-URL]/api/shopify/auth/callback`
2. تأكد من Shopify App Settings: نفس الـ URL بالظبط

---

## 🎯 الخطوة التالية

بعد ما تضبط كل الـ ENV Variables:
1. ✅ Redeploy Railway (تلقائي بعد تغيير ENV)
2. ✅ Redeploy Vercel (يدوي من Dashboard)
3. ✅ اختبر Login
4. ✅ اختبر Shopify OAuth
5. ✅ أنشئ Admin User

جاهز! 🚀
