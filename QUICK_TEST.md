# 🧪 اختبار سريع للنظام

## 1️⃣ اختبار Settings

### الطريقة الأولى: من الواجهة
1. افتح http://localhost:3000
2. سجل دخول
3. اذهب إلى Settings
4. ضع أي URL في n8n Webhook URL (مثل: `https://test.com/webhook`)
5. اضغط Save
6. افتح Console (F12) وشوف الأخطاء

### الطريقة الثانية: باستخدام cURL

أولاً، احصل على Token:
1. افتح http://localhost:3000
2. سجل دخول
3. افتح Console (F12)
4. اكتب: `localStorage.getItem('token')`
5. انسخ الـ token

ثم استخدم cURL:
```bash
curl -X PUT http://localhost:5000/api/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "n8nWebhookUrl": "https://test.com/webhook",
    "shopifyDomain": "test-store.myshopify.com",
    "shopifyApiKey": "test-key"
  }'
```

---

## 2️⃣ اختبار Webhook (استقبال رسالة)

```bash
curl -X POST http://localhost:5000/api/webhooks/whatsapp/incoming \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+201234567890",
    "content": "مرحبا! رسالة تجريبية",
    "type": "text",
    "customerName": "أحمد محمد"
  }'
```

**النتيجة المتوقعة:**
- ✅ Status 200
- ✅ الرسالة تظهر في CRM فوراً
- ✅ العميل يُضاف تلقائياً إذا كان جديد

---

## 3️⃣ اختبار إرسال رسالة

### الخطوة 1: احفظ n8n Webhook URL في Settings
```
https://your-n8n.com/webhook/send-whatsapp
```

### الخطوة 2: أرسل رسالة من الواجهة
1. اذهب إلى Chat
2. اختر عميل
3. اكتب رسالة
4. اضغط Send

### الخطوة 3: تحقق من n8n
- يجب أن يستقبل n8n الطلب مع البيانات:
```json
{
  "phoneNumber": "+201234567890",
  "content": "نص الرسالة",
  "type": "text"
}
```

---

## 4️⃣ اختبار WebSocket (الرسائل الفورية)

### الطريقة 1: من المتصفح
1. افتح http://localhost:3000
2. سجل دخول
3. اذهب إلى Chat
4. افتح Console (F12)
5. ابحث عن: `WebSocket connected`

### الطريقة 2: أرسل webhook وشاهد الرسالة تظهر فوراً
```bash
# في terminal منفصل
curl -X POST http://localhost:5000/api/webhooks/whatsapp/incoming \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+201111111111",
    "content": "رسالة فورية!",
    "type": "text"
  }'
```

**النتيجة المتوقعة:**
- ✅ الرسالة تظهر فوراً في Chat بدون تحديث الصفحة

---

## 5️⃣ استكشاف الأخطاء

### المشكلة: Settings لا تُحفظ

**الحلول:**
1. تحقق من Console في المتصفح (F12)
2. تحقق من Backend logs في Terminal
3. تأكد من أنك مسجل دخول
4. تأكد من أن الـ URL صحيح (يبدأ بـ http:// أو https://)

### المشكلة: Webhook لا يعمل

**الحلول:**
1. تأكد من أن Backend يعمل على port 5000
2. تحقق من الـ payload - يجب أن يحتوي على `phoneNumber` و `content`
3. شوف Backend logs للأخطاء

### المشكلة: الرسائل لا تظهر فوراً

**الحلول:**
1. تحقق من أن WebSocket متصل (Console: "WebSocket connected")
2. تأكد من أنك مسجل دخول
3. حدّث الصفحة (F5)

---

## 📊 الحالة الطبيعية

عند تشغيل النظام بشكل صحيح، يجب أن ترى:

### Backend Terminal:
```
🚀 Server running on port 5000
📡 WebSocket server ready
🌍 Environment: development
User connected: [user-id]
```

### Frontend Console:
```
WebSocket connected
```

### عند إرسال webhook:
```
Update settings request: { userId: '...', n8nWebhookUrl: '...' }
Settings updated successfully: { ... }
```

---

## ✅ Checklist

- [ ] Backend يعمل على http://localhost:5000
- [ ] Frontend يعمل على http://localhost:3000
- [ ] يمكنني تسجيل الدخول
- [ ] WebSocket متصل (Console: "WebSocket connected")
- [ ] يمكنني حفظ Settings
- [ ] يمكنني إرسال رسالة من الواجهة
- [ ] Webhook يستقبل الرسائل بنجاح
- [ ] الرسائل تظهر فوراً بدون تحديث

---

**إذا كل شيء يعمل، أنت جاهز! 🎉**
