# تثبيت وتشغيل ngrok - خطوة بخطوة

## المشكلة
Shopify يطلب **https** مش http، عشان كده محتاجين ngrok.

---

## الحل السريع (3 طرق)

### الطريقة 1: باستخدام npx (الأسهل - بدون تثبيت)

```bash
npx ngrok http 5000
```

✅ مش محتاج تثبيت حاجة!

---

### الطريقة 2: تثبيت ngrok

#### Windows:

**أ. باستخدام Chocolatey:**
```bash
choco install ngrok
```

**ب. تحميل يدوي:**
1. روح https://ngrok.com/download
2. حمل ngrok for Windows
3. Extract الملف
4. حط `ngrok.exe` في مجلد المشروع
5. شغله:
```bash
ngrok http 5000
```

---

### الطريقة 3: باستخدام npm (عالمي)

```bash
npm install -g ngrok
ngrok http 5000
```

---

## بعد ما تشغل ngrok

هتشوف حاجة زي كده:

```
ngrok

Session Status                online
Account                       Free (Limited)
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123-xyz.ngrok-free.app -> http://localhost:5000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**انسخ الـ URL:**
```
https://abc123-xyz.ngrok-free.app
```

---

## استخدام الـ URL

### 1. في Shopify Webhook:

```
https://abc123-xyz.ngrok-free.app/api/webhook/shopify/orders?userId=YOUR_USER_ID
```

### 2. في Shopify OAuth (لو محتاج):

حدث `backend/.env`:
```env
SHOPIFY_REDIRECT_URI="https://abc123-xyz.ngrok-free.app/api/shopify/auth/callback"
FRONTEND_URL="http://localhost:3000"
```

أعد تشغيل الـ backend:
```bash
cd backend
npm run dev
```

---

## ملاحظات مهمة

### ⚠️ الـ URL بيتغير كل مرة
- كل مرة تشغل ngrok، بيديك URL جديد
- لازم تحدث الـ webhook في Shopify

### ✅ للـ Production
استخدم domain حقيقي:
```
https://your-domain.com/api/webhook/shopify/orders?userId=YOUR_USER_ID
```

### 🔒 ngrok Free Account
- بيشتغل تمام
- بس الـ URL بيتغير
- لو عايز URL ثابت، اعمل حساب مدفوع

---

## الخطوات الكاملة

### 1. شغل الـ Backend
```bash
cd backend
npm run dev
```

### 2. شغل ngrok (Terminal جديد)
```bash
npx ngrok http 5000
```

### 3. انسخ الـ URL
```
https://abc123-xyz.ngrok-free.app
```

### 4. اعمل الـ Webhook URL
```
https://abc123-xyz.ngrok-free.app/api/webhook/shopify/orders?userId=YOUR_USER_ID
```

**اجمع الـ User ID من Settings في الـ CRM**

### 5. روح Shopify
- Settings → Notifications → Webhooks
- Create webhook
- Event: Order creation
- Format: JSON
- URL: الصق الـ URL
- Save ✅

### 6. اختبر!
- اعمل order في Shopify
- شوف Orders page في الـ CRM

---

## اختصار سريع

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: ngrok
npx ngrok http 5000

# انسخ الـ URL وحط userId في الآخر
# استخدمه في Shopify webhook
```

---

## Web Interface

ngrok بيديك web interface على:
```
http://127.0.0.1:4040
```

تقدر تشوف:
- كل الـ requests اللي جايه
- الـ response
- الـ headers
- مفيد جداً للـ debugging! 🔍

---

## مثال كامل

```bash
# 1. شغل backend
cd backend
npm run dev

# 2. شغل ngrok
npx ngrok http 5000

# Output:
# Forwarding: https://abc123-xyz.ngrok-free.app -> http://localhost:5000

# 3. اعمل webhook URL
# https://abc123-xyz.ngrok-free.app/api/webhook/shopify/orders?userId=cm3abc123

# 4. حطه في Shopify webhook settings

# 5. اعمل test order

# 6. شوف Orders في الـ CRM - هيظهر! ✅
```

---

## للمساعدة

لو ngrok مش شغال:
1. تأكد إن الـ backend شغال على port 5000
2. جرب `npx ngrok http 5000` بدل `ngrok http 5000`
3. تأكد إن مفيش firewall بيمنع ngrok
4. شوف logs في ngrok console

---

تمام! دلوقتي عندك https URL جاهز للاستخدام! 🚀
