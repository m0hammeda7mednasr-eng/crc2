# 🔗 دليل ربط n8n مع WhatsApp CRM

## 📋 نظرة عامة

هذا الدليل يشرح كيفية ربط n8n مع نظام WhatsApp CRM لإرسال واستقبال الرسائل تلقائياً.

---

## 🎯 السيناريو 1: استقبال رسائل WhatsApp

### الخطوة 1: إنشاء Workflow في n8n

1. افتح n8n
2. أنشئ workflow جديد
3. أضف **Webhook Trigger** node

### الخطوة 2: إعداد Webhook Trigger

في node الـ Webhook:
- **HTTP Method**: POST
- **Path**: `/whatsapp-incoming` (أو أي اسم تريده)
- **Response Mode**: Immediately

### الخطوة 3: إضافة HTTP Request Node

أضف **HTTP Request** node وربطه بالـ Webhook:

**الإعدادات:**
- **Method**: POST
- **URL**: `http://localhost:5000/api/webhooks/whatsapp/incoming`
- **Body Content Type**: JSON
- **Body**:
```json
{
  "phoneNumber": "{{ $json.from }}",
  "content": "{{ $json.body }}",
  "type": "text",
  "customerName": "{{ $json.name }}"
}
```

**ملاحظة مهمة:** 
- لا تحتاج لإرسال `userId` - النظام سيتعرف عليه تلقائياً!
- إذا كان العميل موجود، سيستخدم حسابه
- إذا كان عميل جديد، سيُضاف لأول مستخدم في النظام

### الخطوة 4: تفعيل الـ Workflow

1. احفظ الـ workflow
2. فعّله (Active)
3. انسخ رابط الـ webhook

---

## 🎯 السيناريو 2: إرسال رسائل WhatsApp

### الخطوة 1: إعداد n8n Webhook لاستقبال الرسائل الصادرة

1. أنشئ workflow جديد
2. أضف **Webhook Trigger** node
3. **Path**: `/whatsapp-outgoing`

### الخطوة 2: إضافة WhatsApp Node

أضف node لإرسال الرسالة عبر WhatsApp (حسب الخدمة التي تستخدمها):
- **Twilio**
- **WhatsApp Business API**
- **أي خدمة أخرى**

**البيانات المستلمة من CRM:**
```json
{
  "phoneNumber": "+201234567890",
  "content": "نص الرسالة",
  "type": "text",
  "imageUrl": "رابط الصورة (اختياري)"
}
```

### الخطوة 3: حفظ رابط الـ Webhook في CRM

1. سجل دخول إلى CRM
2. اذهب إلى **Settings**
3. ضع رابط n8n webhook في خانة **n8n Webhook URL**
4. احفظ

---

## 🔄 Workflow كامل (إرسال واستقبال)

### Workflow 1: استقبال من WhatsApp → CRM

```
[WhatsApp Service] 
    ↓
[n8n Webhook Trigger]
    ↓
[HTTP Request to CRM]
    → POST http://localhost:5000/api/webhooks/whatsapp/incoming
```

### Workflow 2: إرسال من CRM → WhatsApp

```
[CRM Send Message]
    ↓
[n8n Webhook Trigger]
    ↓
[WhatsApp Service Node]
    → إرسال الرسالة
```

---

## 📝 أمثلة عملية

### مثال 1: استقبال رسالة من Twilio

**n8n Workflow:**

1. **Webhook Trigger**
   - Path: `/twilio-webhook`
   - Method: POST

2. **Function Node** (تنسيق البيانات)
```javascript
return {
  phoneNumber: items[0].json.From,
  content: items[0].json.Body,
  type: 'text',
  customerName: items[0].json.ProfileName || null
};
```

3. **HTTP Request**
   - URL: `http://localhost:5000/api/webhooks/whatsapp/incoming`
   - Method: POST
   - Body: `{{ $json }}`

### مثال 2: إرسال رسالة عبر Twilio

**n8n Workflow:**

1. **Webhook Trigger**
   - Path: `/send-whatsapp`
   - Method: POST

2. **Twilio Node**
   - Operation: Send Message
   - From: `whatsapp:+14155238886` (رقم Twilio)
   - To: `whatsapp:{{ $json.phoneNumber }}`
   - Message: `{{ $json.content }}`

---

## 🧪 اختبار الإعداد

### اختبار 1: إرسال رسالة تجريبية من n8n إلى CRM

استخدم **Execute Workflow** في n8n أو cURL:

```bash
curl -X POST http://your-n8n-url/webhook/whatsapp-incoming \
  -H "Content-Type: application/json" \
  -d '{
    "from": "+201234567890",
    "body": "مرحبا! هذه رسالة تجريبية",
    "name": "أحمد محمد"
  }'
```

### اختبار 2: إرسال رسالة من CRM

1. سجل دخول إلى CRM
2. اذهب إلى Chat
3. اختر عميل
4. اكتب رسالة واضغط Send
5. تحقق من n8n أن الـ webhook استقبل الطلب

---

## 🔐 الأمان

### في الإنتاج:

1. **استخدم HTTPS** بدلاً من HTTP
2. **أضف Authentication** للـ webhooks:
```javascript
// في n8n Function Node
const secret = 'your-secret-key';
const receivedSecret = items[0].json.secret;

if (receivedSecret !== secret) {
  throw new Error('Unauthorized');
}
```

3. **استخدم Environment Variables** للـ URLs والـ secrets

---

## 🎨 مثال Workflow كامل (JSON)

يمكنك استيراد هذا في n8n:

```json
{
  "name": "WhatsApp CRM Integration",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "whatsapp-incoming",
        "responseMode": "onReceived"
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300]
    },
    {
      "parameters": {
        "url": "http://localhost:5000/api/webhooks/whatsapp/incoming",
        "method": "POST",
        "jsonParameters": true,
        "options": {},
        "bodyParametersJson": "={\n  \"phoneNumber\": \"{{ $json.from }}\",\n  \"content\": \"{{ $json.body }}\",\n  \"type\": \"text\"\n}"
      },
      "name": "Send to CRM",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{"node": "Send to CRM", "type": "main", "index": 0}]]
    }
  }
}
```

---

## ❓ الأسئلة الشائعة

### س: هل أحتاج لإرسال userId في كل webhook؟
**ج:** لا! النظام سيتعرف على المستخدم تلقائياً من رقم الهاتف.

### س: ماذا لو كان العميل جديد؟
**ج:** سيُضاف تلقائياً لأول مستخدم في النظام. في الإنتاج، يمكنك تخصيص هذا السلوك.

### س: كيف أربط عميل معين بمستخدم معين؟
**ج:** أرسل `userId` في الـ webhook payload:
```json
{
  "phoneNumber": "+201234567890",
  "content": "الرسالة",
  "userId": "user-id-here"
}
```

### س: هل يمكن إرسال صور؟
**ج:** نعم! أرسل:
```json
{
  "phoneNumber": "+201234567890",
  "content": "شاهد هذه الصورة",
  "type": "image",
  "imageUrl": "https://example.com/image.jpg"
}
```

---

## 🚀 الخطوات التالية

1. ✅ أنشئ workflow في n8n
2. ✅ اربطه بخدمة WhatsApp (Twilio, WhatsApp Business API, etc.)
3. ✅ احفظ رابط n8n webhook في CRM Settings
4. ✅ جرب إرسال واستقبال الرسائل
5. ✅ استمتع بالنظام الآلي! 🎉

---

## 📞 الدعم

إذا واجهت أي مشكلة:
1. تحقق من Console في المتصفح
2. تحقق من logs في n8n
3. تحقق من logs في Backend (terminal)
4. تأكد من أن جميع الـ URLs صحيحة

**استمتع بالتطوير! 🚀**
