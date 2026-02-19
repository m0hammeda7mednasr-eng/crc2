# ربط Shopify مباشرة - 5 دقائق ⚡

## الخطوات

### 1. شغل ngrok (Terminal 1)
```bash
ngrok http 5000
```

**انسخ الـ URL:**
```
https://abc123-xyz.ngrok-free.app
```

---

### 2. اجمع الـ User ID

**في المتصفح (Console):**
```javascript
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('User ID:', payload.userId);
```

**أو من Settings page:**
- روح Settings
- انسخ User ID من قسم Shopify Integration

---

### 3. اعمل الـ Webhook URL

```
https://YOUR-NGROK-URL/api/webhook/shopify/orders?userId=YOUR_USER_ID
```

**مثال:**
```
https://abc123-xyz.ngrok-free.app/api/webhook/shopify/orders?userId=cm123abc456
```

---

### 4. روح Shopify Admin

1. **Settings** → **Notifications**
2. اسكرول لتحت → **Webhooks**
3. **Create webhook**

**الإعدادات:**
- Event: **Order creation**
- Format: **JSON**
- URL: الصق الـ URL من الخطوة 3
- Webhook API version: **2024-01**

اضغط **Save** ✅

---

### 5. اختبر!

**في Shopify:**
- اضغط **Send test notification** جنب الـ webhook

**أو:**
- اعمل order تجريبي في متجرك

**في الـ CRM:**
- روح صفحة **Orders**
- المفروض تلاقي الأوردر ظهر! 🎉

---

## مثال كامل

```
Shopify Webhook Settings:
┌─────────────────────────────────────────────────────────────┐
│ Event: Order creation                                       │
│ Format: JSON                                                │
│ URL: https://abc123.ngrok-free.app/api/webhook/shopify/    │
│      orders?userId=cm3abc123xyz                             │
│ Version: 2024-01                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## لو حصلت مشكلة

### الأوردر مش بيظهر؟

1. **شوف logs في الـ backend:**
```bash
cd backend
npm run dev
# شوف الـ console
```

2. **تأكد إن ngrok شغال:**
```bash
# في terminal ngrok
# المفروض تشوف: Session Status: online
```

3. **تأكد إن الـ URL صحيح:**
- لازم يبدأ بـ `https://`
- لازم فيه `?userId=`
- لازم الـ userId صحيح

4. **شوف webhook logs في Shopify:**
- Settings → Notifications → Webhooks
- اضغط على الـ webhook
- شوف Recent deliveries

---

## للـ Production

لما تنشر الموقع على domain حقيقي:

```
https://your-domain.com/api/webhook/shopify/orders?userId=YOUR_USER_ID
```

مش محتاج ngrok! ✅

---

## ملاحظات

- ✅ الـ backend محدث ويدعم Shopify webhooks مباشرة
- ✅ لو مفيش userId، هياخد أول user تلقائي (single-user)
- ✅ بيستخرج رقم الهاتف من Order تلقائي
- ✅ بيعمل Customer جديد لو مش موجود
- ✅ الأوردر بيظهر في Orders page فوراً

---

يلا جرب دلوقتي! 🚀
