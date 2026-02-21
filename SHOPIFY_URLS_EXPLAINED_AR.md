# 🔗 شرح روابط Shopify - الفرق بين Webhook URL و Redirect URI

## ❓ السؤال الشائع
**"مش فاهم... فيه كام رابط؟ وكل واحد بيتحط فين؟"**

---

## 📊 الإجابة المختصرة

فيه **2 روابط مختلفة تماماً** في إعدادات Shopify:

### 1️⃣ Shopify Webhook URL (الأزرق 🔵)
```
https://backend-production-8d86c.up.railway.app/api/webhook/shopify/orders/whk_abc123
```
- **يُستخدم في:** Shopify Admin → Settings → Notifications → Webhooks
- **الغرض:** استقبال الطلبات (Orders) من Shopify
- **مختلف لكل متجر:** كل عميل عنده رابط فريد

### 2️⃣ Redirect URI (الأصفر 🟡)
```
https://backend-production-8d86c.up.railway.app/api/shopify/auth/callback
```
- **يُستخدم في:** Shopify Admin → Settings → Apps → Develop apps
- **الغرض:** ربط Custom App بـ Shopify (OAuth)
- **واحد للجميع:** نفس الرابط لكل العملاء

---

## 📝 الشرح التفصيلي

### 🔵 الرابط الأول: Shopify Webhook URL

#### ما هو؟
ده الرابط اللي Shopify هيبعت عليه الطلبات (Orders) لما حد يعمل order جديد.

#### فين بيتحط؟
1. افتح **Shopify Admin** (your-store.myshopify.com/admin)
2. اذهب إلى: **Settings** → **Notifications**
3. اضغط **Create webhook**
4. املأ البيانات:
   - **Event:** Order creation
   - **Format:** JSON
   - **URL:** الصق الرابط الأزرق من Settings
5. احفظ ✅

#### مثال:
```
User 1: https://backend.com/api/webhook/shopify/orders/whk_abc123
User 2: https://backend.com/api/webhook/shopify/orders/whk_xyz789
User 3: https://backend.com/api/webhook/shopify/orders/whk_def456
```

كل user عنده رابط مختلف عشان الطلبات متتخلطش!

---

### 🟡 الرابط الثاني: Redirect URI

#### ما هو؟
ده الرابط اللي Shopify هيرجع عليه العميل بعد ما يوافق على ربط التطبيق (OAuth).

#### فين بيتحط؟
1. افتح **Shopify Admin** (your-store.myshopify.com/admin)
2. اذهب إلى: **Settings** → **Apps and sales channels** → **Develop apps**
3. اضغط **Create an app** أو اختر تطبيق موجود
4. في تبويب **Configuration**:
   - **App URL:** الصق الرابط الأصفر
   - **Allowed redirection URL(s):** الصق نفس الرابط
5. احفظ ✅

#### مثال:
```
All Users: https://backend.com/api/shopify/auth/callback
```

كل العملاء بيستخدموا نفس الرابط لأنه خاص بالتطبيق نفسه مش بالمتجر!

---

## 🎯 الفرق الأساسي

| الميزة | Webhook URL 🔵 | Redirect URI 🟡 |
|--------|---------------|----------------|
| **الاستخدام** | استقبال Orders | ربط التطبيق (OAuth) |
| **المكان** | Shopify Admin → Notifications | Shopify Admin → Develop apps |
| **التكرار** | فريد لكل متجر | واحد للجميع |
| **التغيير** | يتغير لكل عميل | ثابت |
| **الأمان** | Token فريد | OAuth state |

---

## 🔄 خطوات الإعداد الكاملة

### المرحلة 1: إنشاء Custom App في Shopify Admin (لكل عميل)

1. اذهب إلى متجرك: **your-store.myshopify.com/admin**
2. من القائمة: **Settings** → **Apps and sales channels**
3. اضغط **Develop apps**
4. اضغط **Create an app**
5. أدخل اسم التطبيق (مثلاً: "CRM Integration")
6. في تبويب **Configuration**:
   - **App URL:** الصق الـ **Redirect URI** (الأصفر) من CRM Settings
   - **Allowed redirection URL(s):** الصق نفس الـ **Redirect URI**
7. في تبويب **API credentials**:
   - انسخ **API key** (Client ID)
   - انسخ **API secret key** (Client Secret)
8. احفظ ✅

---

### المرحلة 2: ربط المتجر في CRM (لكل عميل)

1. افتح **Settings** في CRM
2. في قسم **Shopify Integration**:
   - اضغط **Configure Shopify Credentials**
   - أدخل:
     - **Shop Domain:** your-store.myshopify.com
     - **Client ID:** من Shopify Admin
     - **Client Secret:** من Shopify Admin
   - احفظ
3. اضغط **Connect with Shopify**
4. وافق على الصلاحيات في Shopify
5. سيتم الرجوع للـ CRM ✅

---

### المرحلة 3: إضافة Webhook في Shopify Admin (لكل عميل)

1. افتح **Shopify Admin** للمتجر
2. اذهب إلى: **Settings** → **Notifications**
3. اضغط **Create webhook**
4. املأ:
   - **Event:** Order creation
   - **Format:** JSON
   - **URL:** انسخ الـ **Shopify Webhook URL** (الأزرق) من CRM Settings
5. احفظ ✅

---

## ✅ Checklist للتأكد

### في Shopify Partners:
- [ ] Redirect URI موجود في **App URL**
- [ ] نفس الـ Redirect URI موجود في **Allowed redirection URL(s)**
- [ ] نسخت الـ **API key** و **API secret key**

### في CRM Settings:
- [ ] أدخلت Shop Domain + Client ID + Client Secret
- [ ] ضغطت **Connect with Shopify** ووافقت
- [ ] نسخت الـ **Shopify Webhook URL** (الأزرق)

### في Shopify Admin:
- [ ] أضفت webhook جديد
- [ ] Event: Order creation
- [ ] Format: JSON
- [ ] URL: الصقت الـ Shopify Webhook URL
- [ ] حفظت الـ webhook

---

## 🧪 الاختبار

### Test 1: OAuth Connection
1. اضغط **Connect with Shopify** في CRM
2. يجب أن يتم توجيهك لـ Shopify
3. وافق على الصلاحيات
4. يجب أن يتم الرجوع للـ CRM مع رسالة "Connected successfully"

✅ **إذا نجح:** الـ Redirect URI صحيح!
❌ **إذا فشل:** تأكد من الـ Redirect URI في Shopify Partners

### Test 2: Webhook
1. اعمل test order في Shopify
2. افتح **Orders** في CRM
3. يجب أن يظهر الـ order الجديد

✅ **إذا نجح:** الـ Webhook URL صحيح!
❌ **إذا فشل:** تأكد من الـ Webhook URL في Shopify Admin

---

## 🆘 حل المشاكل الشائعة

### المشكلة 1: "Redirect URI mismatch"
**السبب:** الـ Redirect URI في Shopify Partners مش مطابق

**الحل:**
1. افتح CRM Settings
2. انسخ الـ **Redirect URI** (الأصفر)
3. افتح Shopify Partners → App setup
4. تأكد إن الرابط مطابق تماماً في المكانين:
   - App URL
   - Allowed redirection URL(s)

### المشكلة 2: Orders مش بتوصل
**السبب:** الـ Webhook URL غلط أو مش متضاف

**الحل:**
1. افتح CRM Settings
2. انسخ الـ **Shopify Webhook URL** (الأزرق)
3. افتح Shopify Admin → Settings → Notifications
4. تأكد إن فيه webhook بنفس الـ URL
5. لو مش موجود، اعمل webhook جديد

### المشكلة 3: "Invalid webhook token"
**السبب:** الـ token expired أو غلط

**الحل:**
1. افتح CRM Settings
2. اضغط **Regenerate Token**
3. انسخ الـ URL الجديد
4. حدّث الـ webhook في Shopify Admin

---

## 💡 نصائح مهمة

### 1. الـ Redirect URI واحد للجميع
- ده طبيعي وصحيح
- كل العملاء بيستخدموا نفس الرابط
- التمييز بيحصل بالـ OAuth state

### 2. الـ Webhook URL فريد لكل عميل
- كل عميل عنده رابط مختلف
- ده عشان الطلبات متتخلطش
- الـ token بيتولد تلقائياً

### 3. متخلطش بينهم!
- الـ Redirect URI → Shopify Partners
- الـ Webhook URL → Shopify Admin
- كل واحد ليه مكانه الخاص

---

## 📸 Screenshots Guide

### Screenshot 1: Shopify Admin - Develop Apps
```
┌─────────────────────────────────────┐
│ Configuration                       │
│                                     │
│ App URL                             │
│ [Redirect URI هنا]                 │
│                                     │
│ Allowed redirection URL(s)          │
│ [نفس الـ Redirect URI هنا]         │
└─────────────────────────────────────┘
```

### Screenshot 2: Shopify Admin - Webhooks
```
┌─────────────────────────────────────┐
│ Event: Order creation               │
│ Format: JSON                        │
│ URL: [Webhook URL هنا]              │
└─────────────────────────────────────┘
```

---

## 🎉 الخلاصة

### الرابط الأزرق (Webhook URL):
- 🔵 **فين:** Shopify Admin → Settings → Notifications → Webhooks
- 🔵 **ليه:** استقبال Orders
- 🔵 **مختلف:** لكل متجر

### الرابط الأصفر (Redirect URI):
- 🟡 **فين:** Shopify Admin → Settings → Apps → Develop apps
- 🟡 **ليه:** ربط Custom App (OAuth)
- 🟡 **واحد:** لكل المتاجر

**ملحوظة مهمة:** كل الإعداد بيتم من Shopify Admin مباشرة، مش محتاجين Shopify Partners!

**الآن واضح؟** 😊

---

**آخر تحديث:** 21 فبراير 2026 - 4:15 AM
**الإصدار:** 1.0.0
**Status:** ✅ Complete Guide
