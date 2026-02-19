# ⚙️ الإعدادات الدقيقة لـ n8n

## 🎯 HTTP Request Node - الإعدادات الصحيحة 100%

### Tab: Parameters

#### Method:
```
POST
```

#### URL:
```
http://localhost:5000/api/webhooks/whatsapp/incoming
```
**مهم:** لازم `localhost` مش `127.0.0.1`

#### Authentication:
```
None
```

---

### Send Query Parameters:
```
❌ OFF (مش مفعّل)
```

---

### Send Headers:
```
✅ ON (مفعّل)
```

#### Headers:
اضغط "Add Header" وحط:

| Name | Value |
|------|-------|
| Content-Type | application/json |

---

### Send Body:
```
✅ ON (مفعّل)
```

#### Body Content Type:
```
JSON
```

#### Specify Body:
```
Using Fields Below
```

---

### Body Parameters:

اضغط "Add Parameter" 4 مرات:

**Parameter 1:**
- Name: `phoneNumber`
- Value: `={{ $json.from }}`

**Parameter 2:**
- Name: `content`
- Value: `={{ $json.body }}`

**Parameter 3:**
- Name: `type`
- Value: `text`

**Parameter 4:**
- Name: `customerName`
- Value: `={{ $json.name }}`

---

### Options:

#### Timeout:
```
10000
```

---

## 🧪 اختبار الإعدادات

### في n8n:

1. **في Webhook Trigger node:**
   - اضغط "Listen for Test Event"
   - أرسل test request (شوف الأمثلة تحت)

2. **في HTTP Request node:**
   - اضغط "Execute Node"
   - يجب أن يظهر Success

---

## 📝 Test Request Examples

### مثال 1: من Command Line

```bash
curl -X POST http://your-n8n-webhook-url \
  -H "Content-Type: application/json" \
  -d '{"from":"+201234567890","body":"مرحبا","name":"أحمد"}'
```

### مثال 2: من PowerShell

```powershell
Invoke-RestMethod -Uri "http://your-n8n-webhook-url" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"from":"+201234567890","body":"مرحبا","name":"أحمد"}'
```

### مثال 3: من TestWebhook Page

1. افتح: http://localhost:3000/test-webhook
2. أدخل رقم الهاتف
3. اكتب الرسالة
4. اضغط Send

---

## ❌ الأخطاء الشائعة وحلولها

### خطأ 1: ECONNREFUSED

**السبب:** Backend مش شغال

**الحل:**
```bash
cd backend
npm run dev
```

### خطأ 2: 404 Not Found

**السبب:** الـ URL غلط

**تحقق من:**
- ✅ `http://localhost:5000` (مش 3000)
- ✅ `/api/webhooks/whatsapp/incoming` (مش webhook)

### خطأ 3: 400 Bad Request

**السبب:** البيانات المرسلة غلط

**تحقق من:**
- ✅ Body Content Type = JSON
- ✅ Parameters صحيحة
- ✅ Headers فيها Content-Type

### خطأ 4: Timeout

**السبب:** Backend بطيء أو معلق

**الحل:**
- زود الـ Timeout في Options
- أعد تشغيل Backend

---

## 🎬 فيديو الخطوات (نصي)

### الخطوة 1: افتح HTTP Request Node
```
اضغط على الـ node في n8n
```

### الخطوة 2: Parameters Tab
```
Method: POST
URL: http://localhost:5000/api/webhooks/whatsapp/incoming
Authentication: None
```

### الخطوة 3: Send Headers
```
✅ تفعيل Send Headers
اضغط Add Header
Name: Content-Type
Value: application/json
```

### الخطوة 4: Send Body
```
✅ تفعيل Send Body
Body Content Type: JSON
Specify Body: Using Fields Below
```

### الخطوة 5: Body Parameters
```
اضغط Add Parameter 4 مرات:

1. phoneNumber = {{ $json.from }}
2. content = {{ $json.body }}
3. type = text
4. customerName = {{ $json.name }}
```

### الخطوة 6: Save & Test
```
اضغط Save
اضغط Execute Node
شوف النتيجة في Output
```

---

## ✅ النتيجة المتوقعة

### في n8n Output:
```json
{
  "message": "Message received successfully",
  "data": {
    "id": "...",
    "customerId": "...",
    "content": "مرحبا",
    "type": "text",
    "direction": "incoming",
    "createdAt": "..."
  },
  "userId": "..."
}
```

### في CRM:
- ✅ يظهر العميل في قائمة Customers
- ✅ تظهر الرسالة في Chat
- ✅ Real-time update (بدون refresh)

---

## 🚀 بعد ما يشتغل

1. ✅ فعّل الـ workflow (Active)
2. ✅ اربطه بخدمة WhatsApp
3. ✅ احفظ n8n webhook URL في CRM Settings
4. ✅ جرب إرسال واستقبال رسائل حقيقية

---

## 📞 لو لسه مش شغال

### جرب الخطوات دي:

1. **تحقق من Backend:**
   ```bash
   curl http://localhost:5000/health
   ```
   يجب أن يرجع: `{"status":"ok",...}`

2. **جرب POST مباشر:**
   ```bash
   curl -X POST http://localhost:5000/api/webhooks/whatsapp/incoming \
     -H "Content-Type: application/json" \
     -d '{"phoneNumber":"+201234567890","content":"test","type":"text"}'
   ```
   يجب أن يرجع: `{"message":"Message received successfully",...}`

3. **تحقق من n8n logs:**
   - في n8n، اذهب إلى Executions
   - شوف آخر execution
   - اضغط عليه وشوف الـ error

4. **شارك الـ error:**
   - خذ screenshot من n8n Output
   - شارك الـ error message

---

## 💡 نصيحة أخيرة

إذا كل حاجة صح ولسه مش شغال:
1. أعد تشغيل n8n
2. أعد تشغيل Backend
3. جرب في متصفح آخر
4. تأكد من Firewall مش بيمنع الاتصال

**بالتوفيق! 🎉**
