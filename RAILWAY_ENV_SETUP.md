# 🚂 Railway Environment Variables Setup

## ⚠️ مهم جداً: إضافة Environment Variables في Railway

بعد رفع الكود على GitHub، لازم تضيف الـ environment variables في Railway عشان الـ backend يشتغل صح.

---

## 📝 الخطوات:

### 1. افتح Railway Dashboard
1. اذهب إلى: https://railway.app
2. اختر الـ project بتاعك
3. اختر الـ backend service

### 2. اضغط على Variables
في القائمة الجانبية، اضغط على **Variables**

### 3. أضف الـ Variables التالية:

```env
# Database (Supabase)
DATABASE_URL=postgresql://postgres.djsybibajbgatdupufri:01066184859Mm@aws-1-eu-central-1.pooler.supabase.com:5432/postgres

# JWT Authentication
JWT_SECRET=BD-JF9I$16ejXoS*KdcAtyai8WgN_nm4f?h+vMU=&uEzT0xb
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URL (Vercel)
FRONTEND_URL=https://crc2-backend.vercel.app
CLIENT_URL=https://crc2-backend.vercel.app

# Shopify OAuth - الرابط الكامل! ✅
SHOPIFY_REDIRECT_URI=https://backend-production-8d86c.up.railway.app/api/shopify/auth/callback
SHOPIFY_SCOPES=read_orders,write_webhooks,read_customers
```

---

## ✅ التأكد من الرابط الصحيح

### الرابط الكامل للـ Redirect URI:
```
https://backend-production-8d86c.up.railway.app/api/shopify/auth/callback
```

### كيف تعرف الرابط بتاعك:
1. افتح Railway Dashboard
2. اختر الـ backend service
3. في تبويب **Settings**
4. تحت **Domains**، هتلاقي الـ domain بتاعك
5. انسخه وضيف `/api/shopify/auth/callback` في الآخر

### مثال:
```
Railway Domain: backend-production-8d86c.up.railway.app
Redirect URI: https://backend-production-8d86c.up.railway.app/api/shopify/auth/callback
```

---

## 🔄 بعد إضافة الـ Variables

### Railway هيعمل auto-redeploy:
1. بعد ما تضيف الـ variables
2. Railway هيعمل redeploy تلقائياً
3. استنى شوية (1-2 دقيقة)
4. الـ backend هيكون جاهز

### تأكد إن الـ deployment نجح:
1. افتح الـ backend URL في المتصفح
2. لو شفت رسالة "WhatsApp CRM API is running"
3. يبقى كل حاجة تمام ✅

---

## 🧪 اختبار الـ Redirect URI

### Test 1: افتح الرابط في المتصفح
```
https://backend-production-8d86c.up.railway.app/api/shopify/redirect-uri
```

**المفروض يرجع:**
```json
{
  "redirectUri": "https://backend-production-8d86c.up.railway.app/api/shopify/auth/callback",
  "instructions": "Use this URL in Shopify Admin → Settings → Apps → Develop apps → Configuration"
}
```

### Test 2: افتح Settings في CRM
1. افتح: https://crc2-backend.vercel.app/settings
2. في قسم Shopify Integration
3. المفروض تشوف الـ Redirect URI كامل
4. لو شفت `[YOUR-RAILWAY-APP-NAME]` يبقى فيه مشكلة

---

## 🆘 حل المشاكل

### المشكلة 1: الرابط لسه placeholder
**السبب:** الـ `SHOPIFY_REDIRECT_URI` مش موجود في Railway

**الحل:**
1. افتح Railway Dashboard
2. Variables
3. أضف `SHOPIFY_REDIRECT_URI` بالرابط الكامل
4. احفظ
5. استنى الـ redeploy

### المشكلة 2: Backend مش شغال
**السبب:** الـ environment variables ناقصة

**الحل:**
1. تأكد إن كل الـ variables موجودة
2. خصوصاً `DATABASE_URL` و `JWT_SECRET`
3. احفظ
4. استنى الـ redeploy

### المشكلة 3: "Config Error"
**السبب:** الـ `SHOPIFY_REDIRECT_URI` غلط

**الحل:**
1. تأكد من الرابط:
   - يبدأ بـ `https://`
   - فيه domain الـ Railway الصحيح
   - ينتهي بـ `/api/shopify/auth/callback`
2. مفيش مسافات زيادة
3. احفظ

---

## 📋 Checklist

قبل ما تكمل، تأكد من:

- [ ] أضفت `DATABASE_URL` في Railway
- [ ] أضفت `JWT_SECRET` في Railway
- [ ] أضفت `SHOPIFY_REDIRECT_URI` بالرابط الكامل
- [ ] أضفت `FRONTEND_URL` (Vercel URL)
- [ ] أضفت `NODE_ENV=production`
- [ ] Railway عمل redeploy
- [ ] Backend شغال (افتح الـ URL)
- [ ] Redirect URI بيظهر كامل في Settings

---

## 🎉 الخلاصة

بعد ما تضيف الـ `SHOPIFY_REDIRECT_URI` في Railway:
- ✅ الرابط هيظهر كامل في Settings
- ✅ مش هيكون placeholder
- ✅ جاهز للـ copy مباشرة
- ✅ العملاء يقدروا يستخدموه في Shopify

---

**آخر تحديث:** 21 فبراير 2026 - 4:45 AM
**Status:** ✅ Ready for Railway Setup
