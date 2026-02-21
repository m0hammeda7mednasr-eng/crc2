# 🛍️ دليل Shopify Webhooks الفريدة

## ✅ التحديثات المنفذة

### 1. Webhook URL فريد لكل متجر Shopify
الآن كل متجر Shopify عنده webhook URL خاص بيه باستخدام الـ webhook token!

**قبل:**
```
❌ https://backend.com/api/webhook/shopify/orders?shop=store1
❌ https://backend.com/api/webhook/shopify/orders?shop=store2
```
المشكلة: Shop domain ممكن يتغير أو يتخمن

**بعد:**
```
✅ https://backend.com/api/webhook/shopify/orders/whk_abc123def456
✅ https://backend.com/api/webhook/shopify/orders/whk_xyz789uvw012
```
الحل: كل متجر عنده token فريد مش ممكن يتخمن!

---

### 2. عرض Redirect URI في Settings
الآن الـ Redirect URI بيظهر بوضوح في صفحة Settings مع زر Copy!

**الفائدة:**
- مش محتاج تدور في الـ environment variables
- Copy بضغطة واحدة
- تعليمات واضحة لإضافته في Shopify

---

## 📋 كيفية الاستخدام

### الخطوة 1: احصل على Webhook URLs من Settings

1. افتح صفحة **Settings** في الـ CRM
2. اذهب لقسم **Shopify Integration**
3. هتلاقي 3 URLs مهمة:

#### أ) Redirect URI (للـ OAuth)
```
https://backend-production-8d86c.up.railway.app/api/shopify/auth/callback
```
- استخدمه في: Shopify Partners → App Settings
- أضفه كـ: "App URL" و "Allowed redirection URL(s)"

#### ب) Shopify Webhook URL (للـ Orders)
```
https://backend-production-8d86c.up.railway.app/api/webhook/shopify/orders/whk_abc123
```
- استخدمه في: Shopify Admin → Settings → Notifications → Webhooks
- Event: Order creation
- Format: JSON

#### ج) WhatsApp Webhook URL (للـ Messages)
```
https://backend-production-8d86c.up.railway.app/api/webhook/incoming/whk_abc123
```
- استخدمه في: n8n أو أي integration
- لاستقبال رسائل WhatsApp

---

### الخطوة 2: إعداد Shopify App

#### في Shopify Partners:
1. اذهب إلى: https://partners.shopify.com
2. Apps → Create app → Custom app
3. App setup:
   - **App URL:** الصق الـ Redirect URI
   - **Allowed redirection URL(s):** الصق نفس الـ Redirect URI
4. API credentials:
   - انسخ **API key** (Client ID)
   - انسخ **API secret key** (Client Secret)

---

### الخطوة 3: ربط المتجر بالـ CRM

#### في CRM Settings:
1. اضغط **Configure Shopify Credentials**
2. أدخل:
   - **Shop Domain:** your-store.myshopify.com
   - **Client ID:** من Shopify Partners
   - **Client Secret:** من Shopify Partners
3. اضغط **Save Credentials**
4. اضغط **Connect with Shopify**
5. سيتم توجيهك لـ Shopify للموافقة
6. بعد الموافقة، سيتم الرجوع للـ CRM

---

### الخطوة 4: إضافة Webhook في Shopify

#### في Shopify Admin:
1. اذهب إلى: Settings → Notifications
2. اضغط **Create webhook**
3. املأ البيانات:
   - **Event:** Order creation
   - **Format:** JSON
   - **URL:** الصق الـ Shopify Webhook URL من Settings
4. اضغط **Save**

---

## 🔒 الأمان

### مميزات الأمان:
- ✅ كل متجر عنده token فريد
- ✅ الـ token مش ممكن يتخمن (256-bit random)
- ✅ مفيش طريقة تعرف token متجر تاني
- ✅ ممكن تعمل regenerate للـ token في أي وقت

### Best Practices:
- 🔐 متشاركش الـ webhook URL مع حد
- 🔄 لو شككت إن حد عرف الـ URL، اعمل regenerate
- 📝 احفظ الـ URLs في مكان آمن
- 🚫 متحطش الـ URLs في أي مكان عام

---

## 🧪 الاختبار

### Test 1: Webhook URL فريد
1. افتح Settings لـ User 1
2. انسخ الـ Shopify Webhook URL
3. افتح Settings لـ User 2
4. انسخ الـ Shopify Webhook URL
5. ✅ تأكد إن الـ URLs مختلفة تماماً

### Test 2: Redirect URI
1. افتح Settings
2. انسخ الـ Redirect URI
3. افتح Shopify Partners
4. الصق الـ URL في App settings
5. ✅ تأكد إن الـ URL صحيح

### Test 3: Order Webhook
1. أضف الـ Shopify Webhook URL في Shopify
2. اعمل test order في Shopify
3. افتح الـ CRM
4. ✅ تأكد إن الـ order ظهر في Orders page

---

## 📊 مقارنة: قبل وبعد

### قبل التحديث:
```
Webhook URL: /api/webhook/shopify/orders?shop=store1
- ❌ Shop domain واضح في الـ URL
- ❌ ممكن يتخمن أو يتغير
- ❌ مش آمن بما فيه الكفاية
```

### بعد التحديث:
```
Webhook URL: /api/webhook/shopify/orders/whk_abc123def456
- ✅ Token فريد ومشفر
- ✅ مستحيل يتخمن
- ✅ أمان عالي جداً
```

---

## 🔄 Backward Compatibility

النظام لسه بيدعم الطرق القديمة للتوافق:

### الطريقة القديمة 1 (لسه شغالة):
```
POST /api/webhook/shopify/orders?shop=store.myshopify.com
```

### الطريقة القديمة 2 (لسه شغالة):
```
POST /api/webhook/shopify/orders?userId=xxx
```

### الطريقة الجديدة (موصى بها):
```
POST /api/webhook/shopify/orders/whk_abc123def456
```

⚠️ **ملحوظة:** الطرق القديمة هتفضل شغالة، بس الطريقة الجديدة أأمن وأفضل!

---

## 🆘 استكشاف الأخطاء

### المشكلة: "Invalid webhook token"
**السبب:** الـ token غلط أو expired
**الحل:**
1. افتح Settings
2. اعمل regenerate للـ webhook token
3. حدّث الـ URL في Shopify

### المشكلة: "Redirect URI mismatch"
**السبب:** الـ Redirect URI في Shopify مش مطابق
**الحل:**
1. افتح Settings في CRM
2. انسخ الـ Redirect URI
3. افتح Shopify Partners
4. تأكد إن الـ URL مطابق تماماً

### المشكلة: Orders مش بتوصل
**السبب:** الـ webhook URL غلط أو مش متضاف
**الحل:**
1. افتح Shopify Admin → Settings → Notifications
2. تأكد إن الـ webhook موجود
3. تأكد إن الـ URL صحيح
4. اعمل test order

---

## 📝 ملاحظات مهمة

### 1. Redirect URI واحد لكل المستخدمين
- الـ Redirect URI نفسه لكل المستخدمين
- ده عادي وطبيعي في OAuth
- كل user بيتميز بالـ state parameter

### 2. Webhook URL فريد لكل user
- كل user عنده webhook URL خاص بيه
- الـ token بيتولد تلقائياً
- ممكن تعمل regenerate في أي وقت

### 3. الأمان
- الـ tokens بتتخزن في الـ database بشكل آمن
- مفيش طريقة تعرف token user تاني
- الـ OAuth state بيتحقق منه قبل الـ callback

---

## ✅ Checklist

- [x] Webhook URL فريد لكل متجر
- [x] Redirect URI معروض في Settings
- [x] Copy buttons لكل الـ URLs
- [x] Backward compatibility
- [x] Security improvements
- [x] Documentation
- [x] Code committed to GitHub
- [x] Auto-deploy setup
- [ ] Test على Production (TODO)
- [ ] User testing (TODO)

---

**آخر تحديث:** 21 فبراير 2026 - 4:00 AM
**الإصدار:** 2.3.0
**Status:** ✅ Ready for Testing
