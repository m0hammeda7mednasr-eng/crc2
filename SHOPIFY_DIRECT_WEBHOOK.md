# ربط Shopify مباشرة بالـ CRM (بدون n8n)

## الطريقة الأسرع! 🚀

### 1. شغل ngrok

```bash
# في terminal جديد
ngrok http 5000
```

هيديك URL زي:
```
https://abc123-xyz.ngrok-free.app
```

**انسخ الـ URL ده!** 📋

---

### 2. حدث الـ Webhook Controller

الـ controller محتاج يستقبل Shopify webhooks مباشرة. دعني أحدثه...

---

### 3. روح على Shopify Admin

1. **Settings** → **Notifications**
2. اسكرول لتحت لحد **Webhooks**
3. اضغط **Create webhook**

---

### 4. إعدادات الـ Webhook

**Event:** Order creation

**Format:** JSON

**URL:** 
```
https://YOUR-NGROK-URL.ngrok-free.app/api/webhook/shopify/orders
```

مثال:
```
https://abc123-xyz.ngrok-free.app/api/webhook/shopify/orders
```

**Webhook API version:** 2024-01 (أو أحدث)

اضغط **Save**

---

### 5. اختبر الـ Webhook

في Shopify:
1. اضغط **Send test notification**
2. أو اعمل order تجريبي

في الـ CRM:
1. روح صفحة **Orders**
2. المفروض تلاقي الأوردر ظهر! ✅

---

## المشكلة: userId مش موجود!

Shopify مش بيبعت userId في الـ webhook. محتاجين نحلها:

### الحل 1: استخدام Query Parameter

في Shopify webhook URL، أضف userId:
```
https://abc123-xyz.ngrok-free.app/api/webhook/shopify/orders?userId=YOUR_USER_ID
```

### الحل 2: استخدام Header

في Shopify webhook settings، أضف header:
```
X-User-ID: YOUR_USER_ID
```

### الحل 3: Auto-detect (الأسهل)

الـ backend يشوف أول user في الـ database ويستخدمه (للـ single user).

---

## الكود المحدث

دعني أحدث الـ webhook controller عشان يشتغل مع Shopify مباشرة...

---

## ملاحظات مهمة

### ✅ ngrok لازم يفضل شغال
- لو قفلت ngrok، الـ webhook مش هيشتغل
- كل مرة تشغل ngrok، الـ URL بيتغير
- لازم تحدث الـ URL في Shopify

### ✅ للـ Production
استخدم domain حقيقي بدل ngrok:
```
https://your-domain.com/api/webhook/shopify/orders
```

### ✅ Security
Shopify بيبعت HMAC signature للتحقق. محتاجين نضيفها للأمان.

---

## الخطوات بالترتيب

1. ✅ شغل الـ backend: `cd backend && npm run dev`
2. ✅ شغل ngrok: `ngrok http 5000`
3. ✅ انسخ ngrok URL
4. ✅ روح Shopify → Settings → Notifications → Webhooks
5. ✅ Create webhook → Order creation
6. ✅ حط الـ URL: `https://YOUR-NGROK-URL/api/webhook/shopify/orders?userId=YOUR_USER_ID`
7. ✅ Save
8. ✅ Test!

---

## الـ User ID بتاعك

عشان تجيب الـ User ID:

1. روح Settings في الـ CRM
2. انسخ الـ User ID من قسم Shopify Integration
3. أو شوف الـ token:
```javascript
// في console المتصفح
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('User ID:', payload.userId);
```

---

يلا نحدث الكود! 🚀
