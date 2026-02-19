# 🔧 دليل إعداد n8n خطوة بخطوة

## ⚠️ المشكلة الشائعة:
الـ URL بيكون `http://localhost:3000` والمفروض يكون `http://localhost:5000`

---

## ✅ الحل الصحيح:

### الخطوة 1: HTTP Request Node - Parameters Tab

#### URL:
```
http://localhost:5000/api/webhooks/whatsapp/incoming
```
**مهم جداً: Port 5000 (Backend) مش 3000 (Frontend)**

#### Method:
```
POST
```

#### Authentication:
```
None
```

---

### الخطوة 2: Send Headers

#### تفعيل Send Headers:
```
✅ ON (مفعّل)
```

#### Headers:
| Name | Value |
|------|-------|
| Content-Type | application/json |

---

### الخطوة 3: Send Body

#### تفعيل Send Body:
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

### الخطوة 4: Body Parameters

#### إضافة Parameters:

**Parameter 1:**
- Name: `phoneNumber`
- Value: `={{ $json.from || $json.phoneNumber }}`

**Parameter 2:**
- Name: `content`
- Value: `={{ $json.body || $json.content }}`

**Parameter 3:**
- Name: `type`
- Value: `text`

**Parameter 4:**
- Name: `customerName`
- Value: `={{ $json.name || $json.customerName }}`

---

## 📋 أو استخدم JSON مباشرة:

إذا اخترت "Specify Body" → "Using JSON":

```json
{
  "phoneNumber": "={{ $json.from || $json.phoneNumber }}",
  "content": "={{ $json.body || $json.content }}",
  "type": "text",
  "customerName": "={{ $json.name || $json.customerName }}"
}
```

---

## 🧪 اختبار الإعداد:

### الطريقة 1: Test في n8n

1. في الـ Webhook Trigger node، اضغط "Listen for Test Event"
2. أرسل request للـ webhook URL
3. يجب أن يظهر البيانات في الـ node
4. اضغط "Execute Node" في الـ HTTP Request node
5. يجب أن يظهر "Success" في الـ Output

### الطريقة 2: Test من Command Line

```bash
# Test الـ webhook trigger
curl -X POST https://your-n8n.com/webhook/whatsapp-incoming \
  -H "Content-Type: application/json" \
  -d '{"from":"+201234567890","body":"مرحبا","name":"أحمد"}'
```

---

## ❌ الأخطاء الشائعة:

### خطأ 1: ECONNREFUSED
```
Error: connect ECONNREFUSED 127.0.0.1:3000
```
**الحل:** غيّر port من 3000 إلى 5000

### خطأ 2: 404 Not Found
```
Error code: 404
```
**الحل:** تأكد من الـ URL صحيح:
```
http://localhost:5000/api/webhooks/whatsapp/incoming
```

### خطأ 3: 400 Bad Request
```
Error: phoneNumber and content are required
```
**الحل:** تأكد من الـ Body Parameters صحيحة

### خطأ 4: Invalid JSON
```
Error: Unexpected token in JSON
```
**الحل:** تأكد من صيغة الـ JSON صحيحة (استخدم Parameters بدلاً من JSON)

---

## 🎯 الإعدادات الكاملة (نسخ ولصق):

### في n8n HTTP Request Node:

```
URL: http://localhost:5000/api/webhooks/whatsapp/incoming
Method: POST
Authentication: None

Send Headers: ✅
  - Content-Type: application/json

Send Body: ✅
Body Content Type: JSON
Specify Body: Using Fields Below

Body Parameters:
  1. phoneNumber = {{ $json.from || $json.phoneNumber }}
  2. content = {{ $json.body || $json.content }}
  3. type = text
  4. customerName = {{ $json.name || $json.customerName }}

Options:
  Timeout: 10000
```

---

## 📦 استيراد Workflow جاهز:

1. في n8n، اضغط "Import from File"
2. اختر الملف: `n8n-workflow-example.json`
3. الـ workflow سيُستورد بالإعدادات الصحيحة
4. فعّل الـ workflow (Active)
5. جرب!

---

## ✅ التحقق من النجاح:

### في n8n Output:
```json
{
  "message": "Message received successfully",
  "data": {
    "id": "...",
    "customerId": "...",
    "content": "مرحبا",
    "type": "text",
    "direction": "incoming"
  }
}
```

### في CRM:
1. افتح Chat page
2. يجب أن يظهر العميل الجديد
3. يجب أن تظهر الرسالة

---

## 🚀 الخطوات التالية:

1. ✅ تأكد من الإعدادات صحيحة
2. ✅ جرب Execute Workflow
3. ✅ تحقق من CRM
4. ✅ اربط بخدمة WhatsApp حقيقية

**بالتوفيق! 🎉**
