# 🔧 حل مشاكل n8n مع Backend

## ❌ المشكلة: "The service refused the connection"

### السبب المحتمل 1: n8n مش على نفس الجهاز

#### التشخيص:
- n8n شغال على cloud (n8n.io)
- n8n شغال على server مختلف
- n8n في Docker container

#### الحل: استخدم ngrok

1. **حمّل ngrok:**
   - اذهب إلى: https://ngrok.com/download
   - سجل حساب مجاني
   - حمّل ngrok

2. **شغّل ngrok:**
   ```bash
   ngrok http 5000
   ```
   أو استخدم الملف: `setup-ngrok.bat`

3. **انسخ الـ URL:**
   ```
   Forwarding: https://abc123.ngrok.io -> http://localhost:5000
   ```

4. **استخدم في n8n:**
   ```
   https://abc123.ngrok.io/api/webhooks/whatsapp/incoming
   ```

---

### السبب المحتمل 2: n8n في Docker

#### التشخيص:
```bash
docker ps | grep n8n
```
إذا ظهر n8n، يبقى شغال في Docker

#### الحل: استخدم host.docker.internal

في n8n HTTP Request:
```
http://host.docker.internal:5000/api/webhooks/whatsapp/incoming
```

**ملاحظة:** على Linux، قد تحتاج:
```
http://172.17.0.1:5000/api/webhooks/whatsapp/incoming
```

---

### السبب المحتمل 3: Backend مش شغال

#### التشخيص:
```bash
curl http://localhost:5000/health
```

إذا ظهر error، Backend مش شغال

#### الحل:
```bash
cd backend
npm run dev
```

---

### السبب المحتمل 4: الـ URL غلط

#### تحقق من الـ URL في n8n:

✅ **صحيح:**
```
http://localhost:5000/api/webhooks/whatsapp/incoming
```

❌ **غلط:**
```
http://localhost:3000/api/webhooks/whatsapp/incoming  (port غلط)
http://localhost:5000/webhooks/whatsapp/incoming      (مفيش /api)
http://localhost:5000/api/webhook/whatsapp/incoming   (webhook مش webhooks)
```

---

## 🧪 اختبار الاتصال

### من Command Line:

```bash
# Test Backend
curl -X POST http://localhost:5000/api/webhooks/whatsapp/incoming \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+201234567890","content":"test","type":"text"}'
```

### من PowerShell:

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/webhooks/whatsapp/incoming" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"phoneNumber":"+201234567890","content":"test","type":"text"}'
```

### النتيجة المتوقعة:
```json
{
  "message": "Message received successfully",
  "data": { ... }
}
```

---

## 🔍 تشخيص المشكلة

### الخطوة 1: تحقق من Backend

```bash
# هل Backend شغال؟
curl http://localhost:5000/health

# النتيجة المتوقعة:
{"status":"ok","timestamp":"..."}
```

### الخطوة 2: تحقق من الـ endpoint

```bash
# جرب POST request
curl -X POST http://localhost:5000/api/webhooks/whatsapp/incoming \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+201234567890","content":"test","type":"text"}'

# النتيجة المتوقعة:
{"message":"Message received successfully", ...}
```

### الخطوة 3: تحقق من n8n

في n8n:
1. افتح HTTP Request node
2. اضغط "Execute Node"
3. شوف الـ error في Output tab

---

## 🎯 الحلول حسب البيئة

### n8n على نفس الجهاز (localhost):
```
URL: http://localhost:5000/api/webhooks/whatsapp/incoming
```

### n8n في Docker (Windows/Mac):
```
URL: http://host.docker.internal:5000/api/webhooks/whatsapp/incoming
```

### n8n في Docker (Linux):
```
URL: http://172.17.0.1:5000/api/webhooks/whatsapp/incoming
```

### n8n على Cloud (n8n.io):
```
# استخدم ngrok
URL: https://your-ngrok-url.ngrok.io/api/webhooks/whatsapp/incoming
```

### n8n على Server مختلف:
```
# استخدم IP address
URL: http://192.168.1.100:5000/api/webhooks/whatsapp/incoming
```

---

## 🚀 الحل السريع: استخدم ngrok

### الخطوات:

1. **حمّل ngrok:**
   ```
   https://ngrok.com/download
   ```

2. **شغّل Backend:**
   ```bash
   cd backend
   npm run dev
   ```

3. **شغّل ngrok:**
   ```bash
   ngrok http 5000
   ```

4. **انسخ الـ URL:**
   ```
   https://abc123.ngrok.io
   ```

5. **استخدم في n8n:**
   ```
   https://abc123.ngrok.io/api/webhooks/whatsapp/incoming
   ```

6. **جرب!**

---

## 📋 Checklist

قبل ما تجرب في n8n، تأكد من:

- [ ] Backend شغال على port 5000
- [ ] الـ endpoint بيرد على POST requests
- [ ] الـ URL صحيح في n8n
- [ ] n8n يقدر يوصل للـ backend (نفس الشبكة أو استخدم ngrok)
- [ ] الـ Headers صحيحة (Content-Type: application/json)
- [ ] الـ Body صحيح (JSON format)

---

## 💡 نصائح

1. **استخدم ngrok للتطوير:** أسهل وأسرع
2. **تحقق من Firewall:** قد يمنع الاتصال
3. **استخدم HTTPS في الإنتاج:** أكثر أماناً
4. **احفظ ngrok URL:** لو هتستخدمه كتير

---

## 📞 لو لسه مش شغال

1. شارك screenshot من n8n error
2. شارك الـ URL اللي بتستخدمه
3. قول n8n شغال فين (localhost, Docker, Cloud)
4. جرب الـ curl command وشارك النتيجة

**بالتوفيق! 🎉**
