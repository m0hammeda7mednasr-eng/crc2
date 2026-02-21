# ✅ الـ Railway URL الصحيح

## 🎯 الـ Domain الصحيح:

```
https://crc2-production.up.railway.app
```

**مش:** `https://backend-production-8d86c.up.railway.app` ❌

---

## 🔧 التحديثات المطلوبة:

### 1. في Railway Variables:

غير `SHOPIFY_REDIRECT_URI` إلى:
```
https://crc2-production.up.railway.app/api/shopify/auth/callback
```

### 2. في Railway Variables (تأكد من):

```env
CLIENT_URL=https://crc2-backend.vercel.app
FRONTEND_URL=https://crc2-backend.vercel.app
SHOPIFY_REDIRECT_URI=https://crc2-production.up.railway.app/api/shopify/auth/callback
```

### 3. في Vercel (Frontend) - صحيح بالفعل ✅:

```env
VITE_API_URL=https://crc2-production.up.railway.app
```

---

## 🧪 اختبار الـ URLs:

### Test 1: Backend Health
```
https://crc2-production.up.railway.app
```
**المفروض يرجع:** `{"message": "WhatsApp CRM API is running"}`

### Test 2: Redirect URI
```
https://crc2-production.up.railway.app/api/shopify/redirect-uri
```
**المفروض يرجع:**
```json
{
  "redirectUri": "https://crc2-production.up.railway.app/api/shopify/auth/callback"
}
```

### Test 3: Frontend
```
https://crc2-backend.vercel.app
```
**المفروض يفتح:** صفحة الـ CRM

### Test 4: Settings Page
```
https://crc2-backend.vercel.app/settings
```
**المفروض يظهر:** الـ Redirect URI الكامل

---

## 📋 الـ URLs الصحيحة:

### Backend (Railway):
```
https://crc2-production.up.railway.app
```

### Frontend (Vercel):
```
https://crc2-backend.vercel.app
```

### Database (Supabase):
```
postgresql://postgres.djsybibajbgatdupufri:01066184859Mm@aws-1-eu-central-1.pooler.supabase.com:5432/postgres
```

### Shopify Redirect URI:
```
https://crc2-production.up.railway.app/api/shopify/auth/callback
```

### Shopify Webhook URL (مثال):
```
https://crc2-production.up.railway.app/api/webhook/shopify/orders/whk_abc123
```

### WhatsApp Webhook URL (مثال):
```
https://crc2-production.up.railway.app/api/webhook/incoming/whk_abc123
```

---

## ✅ Checklist:

- [ ] حدثت `SHOPIFY_REDIRECT_URI` في Railway Variables
- [ ] تأكدت من `VITE_API_URL` في Vercel (صحيح بالفعل ✅)
- [ ] اختبرت Backend URL: `https://crc2-production.up.railway.app`
- [ ] اختبرت Frontend URL: `https://crc2-backend.vercel.app`
- [ ] اختبرت Settings page وشفت الـ Redirect URI كامل
- [ ] جربت Connect with Shopify

---

## 🎉 الخلاصة:

الـ backend شغال تمام على:
```
https://crc2-production.up.railway.app
```

بس محتاج تحدث الـ `SHOPIFY_REDIRECT_URI` في Railway Variables عشان الـ Shopify OAuth يشتغل صح!

---

**آخر تحديث:** 21 فبراير 2026 - 5:15 AM
**Status:** ✅ Backend Working - Need to Update Variables
