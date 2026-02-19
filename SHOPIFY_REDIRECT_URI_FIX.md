# حل مشكلة: The redirect_uri is not whitelisted

## المشكلة
```
Oauth error invalid_request: The redirect_uri is not whitelisted
```

هذا يعني إن الـ redirect URL مش موجود في إعدادات الـ Shopify App.

---

## الحل السريع (3 خطوات)

### 1. روح على Shopify App Settings

1. افتح Shopify Admin
2. **Settings** → **Apps and sales channels**
3. **Develop apps**
4. اختار الـ App اللي عملته
5. اضغط **Configuration**

### 2. أضف الـ Redirect URL

في قسم **App setup** → **URLs**:

1. اضغط **Edit** جنب "Allowed redirection URL(s)"
2. أضف الـ URL ده:
   ```
   http://localhost:5000/api/shopify/auth/callback
   ```
3. اضغط **Save**

### 3. جرب تاني

1. ارجع للـ CRM
2. روح Settings
3. اضغط **Connect with Shopify** تاني
4. المفروض يشتغل دلوقتي! ✅

---

## للـ Production (لما تنشر الموقع)

لما تستخدم domain حقيقي أو ngrok:

### باستخدام ngrok:

```bash
# شغل ngrok
ngrok http 5000
```

هيديك URL زي: `https://abc123.ngrok.io`

### حدث الإعدادات:

1. **في Shopify App**:
   - أضف: `https://abc123.ngrok.io/api/shopify/auth/callback`

2. **في backend/.env**:
   ```env
   SHOPIFY_REDIRECT_URI="https://abc123.ngrok.io/api/shopify/auth/callback"
   FRONTEND_URL="https://xyz789.ngrok.io"
   ```

3. **أعد تشغيل الـ backend**:
   ```bash
   cd backend
   npm run dev
   ```

---

## ملاحظات مهمة

### ✅ الـ URLs المسموحة في Shopify:

يمكنك إضافة أكثر من URL:

```
http://localhost:5000/api/shopify/auth/callback
https://your-domain.com/api/shopify/auth/callback
https://abc123.ngrok.io/api/shopify/auth/callback
```

### ✅ تأكد من:

1. الـ URL بالضبط زي ما في الـ .env
2. مفيش مسافات زيادة
3. الـ protocol صحيح (http أو https)
4. الـ port صحيح (5000)

### ❌ أخطاء شائعة:

```
❌ http://localhost:5000/api/shopify/callback  (مفيش auth/)
❌ http://localhost:3000/api/shopify/auth/callback  (port غلط)
❌ https://localhost:5000/api/shopify/auth/callback  (https بدل http)
```

---

## Screenshot للخطوات

### في Shopify App:

```
Configuration
  └── App setup
      └── URLs
          └── Allowed redirection URL(s)
              [Edit]
              
              ┌─────────────────────────────────────────────┐
              │ http://localhost:5000/api/shopify/auth/    │
              │ callback                                    │
              └─────────────────────────────────────────────┘
              
              [Save]
```

---

## اختبار الإعداد

بعد ما تضيف الـ URL:

```bash
# 1. تأكد إن الـ backend شغال
cd backend
npm run dev

# 2. تأكد إن الـ frontend شغال
cd frontend
npm run dev

# 3. افتح المتصفح
http://localhost:3000

# 4. روح Settings
# 5. أدخل بيانات Shopify
# 6. اضغط Connect with Shopify
# 7. المفروض يفتح صفحة Shopify للموافقة
```

---

## لو لسه مش شغال

### تأكد من الـ .env:

```env
# backend/.env
SHOPIFY_REDIRECT_URI="http://localhost:5000/api/shopify/auth/callback"
FRONTEND_URL="http://localhost:3000"
```

### تأكد من الـ backend شغال:

```bash
# شوف الـ logs
cd backend
npm run dev

# المفروض تشوف:
# 🚀 Server running on port 5000
```

### تأكد من الـ route موجود:

الـ route موجود في: `backend/src/routes/shopify.routes.ts`

```typescript
router.get('/auth/callback', ShopifyController.handleCallback);
```

---

## الدعم

لو لسه عندك مشكلة:

1. ✅ تأكد إن الـ URL في Shopify بالضبط زي الـ .env
2. ✅ امسح الـ cookies والـ cache
3. ✅ جرب في incognito/private window
4. ✅ تأكد إن الـ Client ID و Client Secret صحيحين
5. ✅ شوف الـ logs في الـ backend

---

تمام! المفروض يشتغل دلوقتي 🎉
