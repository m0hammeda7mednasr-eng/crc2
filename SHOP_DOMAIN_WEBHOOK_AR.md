# 🎯 Webhook URL بالـ Shop Domain - أسهل وأوضح!

## الفكرة الجديدة

بدل ما كل user يستخدم `userId` في الـ webhook URL، دلوقتي هيستخدم **shop domain** بتاعه!

---

## المقارنة

### ❌ الطريقة القديمة (userId)

```
https://api.yourdomain.com/api/webhook/shopify/orders?userId=cm3xyz789abc
                                                              ↑
                                                    مش واضح ومعقد!
```

**المشاكل:**
- userId مش واضح ❌
- صعب تفتكره ❌
- لو عندك أكثر من متجر، مش هتعرف مين مين ❌

---

### ✅ الطريقة الجديدة (shop domain)

```
https://api.yourdomain.com/api/webhook/shopify/orders?shop=my-store
                                                              ↑
                                                    واضح وسهل!
```

**المميزات:**
- واضح ومفهوم ✅
- سهل تفتكره ✅
- كل متجر ليه URL مميز ✅
- احترافي أكثر ✅

---

## كيف يشتغل؟

### 1️⃣ المستخدم يحط Shopify Domain في Settings

```
Settings → Shopify Integration
Shop Domain: my-store.myshopify.com
```

### 2️⃣ النظام يولد Webhook URL تلقائي

```
https://api.yourdomain.com/api/webhook/shopify/orders?shop=my-store
```

### 3️⃣ Shopify يبعت Order

```
POST /api/webhook/shopify/orders?shop=my-store
Headers:
  X-Shopify-Shop-Domain: my-store.myshopify.com
Body:
  { order data... }
```

### 4️⃣ Backend يلاقي المستخدم تلقائي

```typescript
// يدور على user بالـ shop domain
const user = await prisma.user.findFirst({
  where: {
    OR: [
      { shopifyDomain: 'my-store.myshopify.com' },
      { shopifyDomain: 'my-store' },
    ],
  },
});

// يحفظ الـ order للـ user الصحيح ✅
```

---

## أمثلة

### مثال 1: متجر واحد

```
User: Ahmed
Shop: ahmed-store.myshopify.com
Webhook: https://api.yourdomain.com/api/webhook/shopify/orders?shop=ahmed-store
```

### مثال 2: عدة متاجر

```
User 1: Ahmed
Shop: ahmed-store.myshopify.com
Webhook: https://api.yourdomain.com/api/webhook/shopify/orders?shop=ahmed-store

User 2: Mohamed
Shop: mohamed-shop.myshopify.com
Webhook: https://api.yourdomain.com/api/webhook/shopify/orders?shop=mohamed-shop

User 3: Sara
Shop: sara-boutique.myshopify.com
Webhook: https://api.yourdomain.com/api/webhook/shopify/orders?shop=sara-boutique
```

**كل واحد ليه URL مميز وواضح!** ✅

---

## الإعداد

### في Settings Page

```typescript
// المستخدم يدخل:
Shop Domain: my-store.myshopify.com

// النظام يولد تلقائي:
Webhook URL: https://api.yourdomain.com/api/webhook/shopify/orders?shop=my-store
```

### في Shopify

```
Settings → Notifications → Webhooks → Create webhook
Event: Order creation
Format: JSON
URL: https://api.yourdomain.com/api/webhook/shopify/orders?shop=my-store
```

---

## التوافق مع الطريقة القديمة

### ✅ لسه شغال!

الطريقة القديمة بالـ `userId` لسه شغالة:

```
https://api.yourdomain.com/api/webhook/shopify/orders?userId=cm3xyz
```

**بس الطريقة الجديدة أفضل!** 🎯

---

## الكود

### Backend (webhook.controller.ts)

```typescript
// يدعم الطريقتين:
// 1. Shop domain (جديد)
let shopDomain = req.query.shop as string;
if (shopDomain) {
  const user = await prisma.user.findFirst({
    where: { shopifyDomain: shopDomain }
  });
  userId = user.id;
}

// 2. userId (قديم - للتوافق)
let userId = req.query.userId as string;
```

### Frontend (Settings.tsx)

```typescript
// يجيب الـ URL من Backend
const response = await api.get(`/api/webhook/shopify/url?userId=${userId}`);

// لو فيه shop domain، يرجع:
// https://api.yourdomain.com/api/webhook/shopify/orders?shop=my-store

// لو مفيش، يرجع:
// https://api.yourdomain.com/api/webhook/shopify/orders?userId=xxx
```

---

## المميزات

### 1. واضح ومفهوم
```
?shop=my-store  ← واضح!
?userId=cm3xyz  ← مش واضح
```

### 2. سهل الإدارة
```
عندك 10 متاجر؟
كل واحد ليه URL واضح بالاسم!
```

### 3. احترافي
```
العميل يشوف اسم متجره في الـ URL
يحس بالاحترافية ✅
```

### 4. أمان
```
Shop domain مش حساس زي userId
ممكن يتشارك بأمان
```

---

## الخلاصة

### الطريقة القديمة:
```
❌ userId معقد
❌ مش واضح
❌ صعب الإدارة
```

### الطريقة الجديدة:
```
✅ Shop domain واضح
✅ سهل الإدارة
✅ احترافي
✅ لسه متوافق مع القديم
```

---

## التطبيق

### 1. المستخدم يحط Shop Domain

```
Settings → Shopify Integration
Shop Domain: my-store.myshopify.com
Save ✅
```

### 2. ينسخ الـ Webhook URL

```
https://api.yourdomain.com/api/webhook/shopify/orders?shop=my-store
```

### 3. يحطه في Shopify

```
Shopify → Settings → Notifications → Webhooks
Create webhook
URL: [paste]
Save ✅
```

### 4. خلاص! 🎉

```
Orders هتيجي تلقائي
كل متجر لوحده
واضح ومنظم ✅
```

---

**الطريقة الجديدة أسهل وأوضح وأحترافي! 🚀**

