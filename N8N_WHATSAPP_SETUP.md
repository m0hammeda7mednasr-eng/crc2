# 📱 دليل ربط WhatsApp مع CRM عبر n8n

## 🎯 المطلوب: 2 Workflows

---

## Workflow 1️⃣: استقبال رسائل من WhatsApp → CRM

### الخطوات:

1. **افتح n8n** واستورد الملف: `n8n-workflow-example.json`

2. **الـ Workflow يحتوي على:**
   - **Webhook Trigger**: يستقبل من WhatsApp
   - **HTTP Request**: يرسل للـ CRM Backend

3. **بعد الاستيراد:**
   - فعّل الـ workflow (Active)
   - انسخ رابط الـ webhook
   - مثال: `https://your-n8n.com/webhook/whatsapp-incoming`

4. **اربط الـ webhook بخدمة WhatsApp:**
   - إذا كنت تستخدم **Twilio**: ضع الرابط في Twilio Console
   - إذا كنت تستخدم **WhatsApp Business API**: ضع الرابط في إعدادات الـ webhook
   - إذا كنت تستخدم خدمة أخرى: اتبع تعليماتها

---

## Workflow 2️⃣: إرسال رسائل من CRM → WhatsApp

### الخطوات:

1. **افتح n8n** واستورد الملف: `n8n-workflow-send-to-whatsapp.json`

2. **الـ Workflow يحتوي على:**
   - **Webhook Trigger**: يستقبل من CRM
   - **HTTP Request**: يرسل للـ WhatsApp API

3. **عدّل الـ HTTP Request Node:**

   #### إذا كنت تستخدم Twilio:
   ```
   URL: https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json
   Method: POST
   Authentication: Basic Auth
   Username: YOUR_ACCOUNT_SID
   Password: YOUR_AUTH_TOKEN
   
   Body Parameters:
   - From: whatsapp:+14155238886 (رقم Twilio)
   - To: whatsapp:{{ $json.phoneNumber }}
   - Body: {{ $json.content }}
   ```

   #### إذا كنت تستخدم WhatsApp Business API:
   ```
   URL: https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages
   Method: POST
   Headers:
   - Authorization: Bearer YOUR_ACCESS_TOKEN
   - Content-Type: application/json
   
   Body (JSON):
   {
     "messaging_product": "whatsapp",
     "to": "{{ $json.phoneNumber }}",
     "type": "text",
     "text": {
       "body": "{{ $json.content }}"
     }
   }
   ```

   #### إذا كنت تستخدم خدمة أخرى:
   - اتبع documentation الخاص بها
   - غالباً ستحتاج:
     - URL الخاص بالخدمة
     - API Token أو Authentication
     - Body يحتوي على: `phoneNumber` و `content`

4. **بعد التعديل:**
   - احفظ الـ workflow
   - فعّله (Active)
   - انسخ رابط الـ webhook
   - مثال: `https://your-n8n.com/webhook/send-whatsapp`

5. **احفظ الرابط في CRM:**
   - سجل دخول للـ CRM
   - اذهب إلى **Settings**
   - ضع الرابط في خانة **n8n Webhook URL**
   - احفظ

---

## 🧪 اختبار الإعداد

### اختبار Workflow 1 (استقبال):

1. أرسل رسالة واتساب من رقمك
2. تحقق من n8n أن الـ workflow اشتغل
3. افتح CRM → Chat
4. يجب أن تظهر الرسالة

### اختبار Workflow 2 (إرسال):

1. افتح CRM → Chat
2. اختر عميل
3. اكتب رسالة واضغط Send
4. تحقق من n8n أن الـ workflow اشتغل
5. يجب أن تصل الرسالة على الواتساب

---

## 📋 ملخص الإعدادات

| الخطوة | الإجراء | الملف |
|--------|---------|-------|
| 1 | استورد workflow استقبال | `n8n-workflow-example.json` |
| 2 | اربط webhook بخدمة WhatsApp | - |
| 3 | استورد workflow إرسال | `n8n-workflow-send-to-whatsapp.json` |
| 4 | عدّل HTTP Request حسب خدمتك | - |
| 5 | احفظ webhook URL في CRM Settings | - |
| 6 | جرب الإرسال والاستقبال | - |

---

## 🔑 معلومات مهمة

### البيانات اللي بيرسلها CRM لـ n8n:
```json
{
  "phoneNumber": "+201234567890",
  "content": "نص الرسالة",
  "type": "text",
  "imageUrl": "رابط الصورة (اختياري)"
}
```

### البيانات اللي بيرسلها n8n للـ CRM:
```json
{
  "phoneNumber": "+201234567890",  // أو "from"
  "content": "نص الرسالة",         // أو "body"
  "type": "text",
  "customerName": "اسم العميل"     // أو "name"
}
```

---

## 🎨 أمثلة عملية

### مثال 1: Twilio

**Workflow 2 - HTTP Request Node:**
```
URL: https://api.twilio.com/2010-04-01/Accounts/ACxxxxx/Messages.json
Method: POST
Authentication: Basic Auth
  Username: ACxxxxx (Account SID)
  Password: your_auth_token

Body Parameters:
  From: whatsapp:+14155238886
  To: whatsapp:{{ $json.phoneNumber }}
  Body: {{ $json.content }}
```

### مثال 2: WhatsApp Business API (Meta)

**Workflow 2 - HTTP Request Node:**
```
URL: https://graph.facebook.com/v18.0/123456789/messages
Method: POST
Headers:
  Authorization: Bearer EAAxxxxx
  Content-Type: application/json

Body (JSON):
{
  "messaging_product": "whatsapp",
  "to": "{{ $json.phoneNumber }}",
  "type": "text",
  "text": {
    "body": "{{ $json.content }}"
  }
}
```

### مثال 3: خدمة مخصصة

**Workflow 2 - HTTP Request Node:**
```
URL: https://your-whatsapp-service.com/api/send
Method: POST
Headers:
  Authorization: Bearer your_api_key
  Content-Type: application/json

Body (JSON):
{
  "to": "{{ $json.phoneNumber }}",
  "message": "{{ $json.content }}"
}
```

---

## ❓ الأسئلة الشائعة

### س: أنا مش عارف أستخدم أي خدمة واتساب؟
**ج:** أشهر الخيارات:
- **Twilio** (سهل وسريع، لكن مدفوع)
- **WhatsApp Business API** (رسمي من Meta، يحتاج موافقة)
- **WAHA** (مجاني، self-hosted)
- **Baileys** (مجاني، لكن غير رسمي)

### س: الـ webhook URL بتاع n8n فين؟
**ج:** بعد ما تفعّل الـ workflow في n8n:
1. اضغط على الـ Webhook node
2. هتلاقي "Test URL" و "Production URL"
3. استخدم Production URL

### س: ازاي أعرف إن الـ workflow شغال؟
**ج:** في n8n:
1. اذهب إلى "Executions"
2. هتشوف كل مرة الـ workflow اشتغل
3. لو فيه error، هيظهر باللون الأحمر

### س: الرسائل مش بتوصل للواتساب؟
**ج:** تحقق من:
1. الـ workflow مفعّل (Active) ✅
2. الـ webhook URL محفوظ في CRM Settings ✅
3. الـ HTTP Request node معدّل صح حسب خدمتك ✅
4. الـ API Token أو Authentication صحيح ✅
5. رقم الهاتف بالصيغة الصحيحة (مع كود الدولة) ✅

---

## 🚀 الخطوات التالية

1. ✅ حدد خدمة WhatsApp اللي هتستخدمها
2. ✅ استورد الـ workflows في n8n
3. ✅ عدّل HTTP Request حسب خدمتك
4. ✅ احفظ webhook URL في CRM
5. ✅ جرب الإرسال والاستقبال
6. ✅ استمتع! 🎉

---

## 📞 محتاج مساعدة؟

إذا واجهت مشكلة:
1. تحقق من Console في المتصفح (F12)
2. تحقق من Executions في n8n
3. تحقق من Backend logs (terminal)
4. تأكد من كل الـ URLs صحيحة

**بالتوفيق! 🚀**
