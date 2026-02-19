# ربط Shopify بالـ CRM - الدليل النهائي 🎯

## كل حاجة جاهزة! اللينك موجود في Settings

---

## الخطوات (دقيقتين فقط!)

### 1️⃣ افتح الـ CRM
```
http://localhost:3000
```

### 2️⃣ روح Settings
- اضغط على **Settings** من القائمة الجانبية

### 3️⃣ انسخ الـ Webhook URL
- في قسم **Shopify Integration**
- تحت **Shopify Webhook Setup**
- اضغط **Copy URL** 📋
- اللينك جاهز ومعاه الـ userId تلقائي! ✅

### 4️⃣ روح Shopify Admin
1. **Settings** → **Notifications**
2. اسكرول لتحت → **Webhooks**
3. **Create webhook**

### 5️⃣ املا البيانات
```
Event: Order creation
Format: JSON
URL: [الصق اللينك اللي نسخته]
Webhook API version: 2024-01
```

### 6️⃣ Save ✅

### 7️⃣ اختبر!
- اعمل order تجريبي في Shopify
- روح صفحة **Orders** في الـ CRM
- هتلاقي الأوردر ظهر! 🎉

---

## مثال على اللينك

```
http://localhost:5000/api/webhook/shopify/orders?userId=cm3abc123xyz
```

**ملاحظة:** الـ userId بيتحط تلقائي من الـ token بتاعك!

---

## لو بتستخدم localhost

### محتاج ngrok عشان Shopify يوصلك:

```bash
# Terminal جديد
ngrok http 5000
```

**هيديك URL زي:**
```
https://abc123-xyz.ngrok-free.app
```

**استخدمه بدل localhost:**
```
https://abc123-xyz.ngrok-free.app/api/webhook/shopify/orders?userId=cm3abc123xyz
```

---

## للـ Production (Domain حقيقي)

لما تنشر الموقع:

```
https://your-domain.com/api/webhook/shopify/orders?userId=YOUR_USER_ID
```

مش محتاج ngrok! ✅

---

## الكود اللي اتعمل

### ✅ Backend Updated
- `webhook.controller.ts` - يستقبل Shopify webhooks مباشرة
- يستخرج بيانات العميل والأوردر تلقائي
- يعمل Customer جديد لو مش موجود
- يحفظ الأوردر في الـ database
- يبعت notification للـ frontend (real-time)

### ✅ Frontend Updated
- Settings page فيها اللينك جاهز
- زرار Copy للنسخ بسهولة
- تعليمات واضحة
- دعم ngrok

---

## اختبار سريع

### Test 1: من Shopify
```
1. روح Shopify webhook settings
2. اضغط "Send test notification"
3. شوف الـ CRM Orders page
```

### Test 2: Order حقيقي
```
1. اعمل order في متجرك
2. شوف الـ CRM Orders page
3. المفروض يظهر فوراً!
```

---

## المميزات

✅ **بدون n8n** - مباشر من Shopify للـ CRM
✅ **تلقائي بالكامل** - userId بيتحط تلقائي
✅ **Real-time** - الأوردر يظهر فوراً
✅ **Multi-user** - كل مستخدم عنده webhook خاص
✅ **آمن** - userId في الـ URL مش في الـ body

---

## المشاكل الشائعة

### ❌ الأوردر مش بيظهر

**الحل:**
1. تأكد إن الـ backend شغال: `cd backend && npm run dev`
2. تأكد إن الـ webhook URL صحيح
3. شوف logs في Shopify webhook settings
4. لو localhost، تأكد إن ngrok شغال

### ❌ Error: User not found

**الحل:**
- تأكد إن الـ userId في الـ URL صحيح
- انسخ اللينك من Settings تاني

### ❌ ngrok URL مش شغال

**الحل:**
```bash
# أعد تشغيل ngrok
ngrok http 5000

# انسخ الـ URL الجديد
# حدث الـ webhook في Shopify
```

---

## الخلاصة

🎯 **كل حاجة جاهزة!**

1. افتح Settings في الـ CRM
2. انسخ الـ webhook URL
3. حطه في Shopify
4. خلاص! 🎉

**اللينك موجود في Settings page جاهز للنسخ!** 📋

---

## الدعم

لو عندك أي مشكلة:
1. شوف الـ logs في backend console
2. شوف webhook logs في Shopify
3. تأكد إن الـ URL صحيح
4. جرب test notification في Shopify

---

تم بحمد الله! 🚀
