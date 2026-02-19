# 🔍 حل مشكلة: الأوردرات مش بتنزل

## الخطوات السريعة للفحص

### 1️⃣ تأكد إن Backend شغال

```bash
# شوف نافذة Backend
# لازم تشوف:
[Backend] Server running on http://localhost:5000
```

**لو مش شغال:**
```bash
cd backend
npm run dev
```

---

### 2️⃣ اختبر الـ Webhook يدوياً

```powershell
# شغل الاختبار
powershell -ExecutionPolicy Bypass -File test-order.ps1
```

**المفروض تشوف:**
```
✅ Backend is running
✅ User ID: cm3xyz...
✅ Webhook sent successfully!
✅ Total orders in database: 1
```

---

### 3️⃣ شوف Backend Logs

**افتح نافذة Backend وشوف:**

#### ✅ لو شغال صح:
```
[Webhook] POST /api/webhook/shopify/orders?userId=cm3xyz
[Webhook] Shopify order received
[Webhook] Order ID: 12345
[Webhook] Order Number: 1001
[Webhook] Customer: أحمد محمد (+201234567890)
[CustomerService] Customer created: cust_123
[OrderService] Order created: order_456
[Webhook] ✅ Order synced successfully
```

#### ❌ لو فيه مشكلة:
```
Error: No user found
Error: userId is required
Error: Failed to create order
```

---

### 4️⃣ شوف Database

```bash
cd backend
npx prisma studio
```

**افتح في المتصفح:** `http://localhost:5555`

**تحقق من:**
- **User table** - فيه users؟
- **Order table** - فيه orders؟
- **Customer table** - فيه customers؟

---

## المشاكل الشائعة

### ❌ مشكلة 1: "No user found"

**السبب:** مفيش users في الـ database

**الحل:**
```bash
cd backend
node create-admin.js
```

أو سجل دخول في الـ CRM:
```
http://localhost:3000
Email: admin@crm.com
Password: Admin@123456
```

---

### ❌ مشكلة 2: Webhook بيوصل بس Order مش بيتحفظ

**الحل:**

1. **شوف Backend logs** - فيه error؟

2. **تأكد من Database schema:**
```bash
cd backend
npx prisma migrate dev
```

3. **تأكد من userId صحيح:**
```bash
# في test-order.ps1
# هيجيب userId تلقائي
```

---

### ❌ مشكلة 3: Order بيتحفظ بس مش بيظهر في Frontend

**الحل:**

1. **تأكد إنك مسجل دخول:**
```
http://localhost:3000/login
admin@crm.com / Admin@123456
```

2. **افتح Orders page:**
```
http://localhost:3000/orders
```

3. **شوف Browser Console (F12):**
```javascript
// لازم تشوف:
GET /api/orders - 200 OK

// لو فيه error:
401 Unauthorized - سجل دخول تاني
403 Forbidden - مشكلة في الـ permissions
```

4. **Refresh الصفحة:**
```
Ctrl + F5 (Hard refresh)
```

---

### ❌ مشكلة 4: من Shopify مش بيوصل

**الحل:**

1. **تأكد من ngrok شغال:**
```bash
# شوف نافذة ngrok
Session Status: online
Forwarding: https://abc123.ngrok-free.app -> http://localhost:5000
```

2. **تأكد من URL في Shopify:**
```
Settings → Notifications → Webhooks
URL: https://abc123.ngrok-free.app/api/webhook/shopify/orders?userId=YOUR_USER_ID
```

3. **اختبر من Shopify:**
```
في صفحة الـ webhook
اضغط "Send test notification"
شوف Recent deliveries
لازم يكون: 200 OK
```

4. **شوف ngrok web interface:**
```
http://127.0.0.1:4040
شوف الـ requests
فيه POST من Shopify؟
```

---

## الفحص الكامل (Checklist)

### Backend
- [ ] Backend شغال على port 5000
- [ ] لا توجد errors في console
- [ ] Database متصل

### Database
- [ ] فيه user واحد على الأقل
- [ ] Migrations تمت بنجاح
- [ ] Tables موجودة (User, Order, Customer)

### Frontend
- [ ] Frontend شغال على port 3000
- [ ] مسجل دخول
- [ ] Orders page بتفتح
- [ ] لا توجد errors في Browser Console

### Webhook
- [ ] ngrok شغال (للـ Shopify)
- [ ] URL صحيح في Shopify
- [ ] Test notification بيرجع 200 OK

---

## اختبار شامل

### Test 1: Local Test (بدون Shopify)
```powershell
powershell -ExecutionPolicy Bypass -File test-order.ps1
```

**النتيجة المتوقعة:**
- ✅ Webhook sent successfully
- ✅ Order في database
- ✅ Order يظهر في Orders page

---

### Test 2: Shopify Test Notification
```
1. روح Shopify webhook settings
2. اضغط "Send test notification"
3. شوف Recent deliveries - لازم 200 OK
4. شوف Orders page - لازم يظهر order
```

---

### Test 3: Real Order
```
1. اعمل order حقيقي في Shopify
2. شوف Backend logs
3. شوف Orders page
4. لازم يظهر خلال ثواني
```

---

## الأوامر المفيدة

### شوف Backend Logs
```bash
# في نافذة Backend
# الـ logs بتظهر تلقائي
```

### شوف Database
```bash
cd backend
npx prisma studio
# يفتح على http://localhost:5555
```

### شوف Orders في Database
```bash
cd backend
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.order.findMany().then(orders => { console.log(orders); prisma.$disconnect(); });"
```

### شوف Users في Database
```bash
cd backend
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.user.findMany().then(users => { console.log(users); prisma.$disconnect(); });"
```

### امسح كل Orders (للاختبار)
```bash
cd backend
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.order.deleteMany().then(() => { console.log('All orders deleted'); prisma.$disconnect(); });"
```

---

## السيناريوهات المختلفة

### سيناريو 1: أول مرة تشغل النظام

```bash
# 1. تثبيت
cd backend && npm install
cd ../frontend && npm install

# 2. Database
cd backend
npx prisma migrate dev
node create-admin.js

# 3. تشغيل
start-all.bat

# 4. اختبار
powershell -ExecutionPolicy Bypass -File test-order.ps1
```

---

### سيناريو 2: النظام كان شغال وفجأة توقف

```bash
# 1. أعد تشغيل كل شيء
# أغلق كل النوافذ
# شغل تاني
start-all.bat

# 2. اختبر
powershell -ExecutionPolicy Bypass -File test-order.ps1

# 3. لو مش شغال، شوف Database
cd backend
npx prisma studio
```

---

### سيناريو 3: Shopify webhooks مش بتوصل

```bash
# 1. تأكد من ngrok
# شوف نافذة ngrok
# انسخ الـ URL

# 2. حدث في Shopify
# Settings → Notifications → Webhooks
# Edit webhook
# حط الـ URL الجديد
# Save

# 3. اختبر
# Send test notification
# شوف Recent deliveries
```

---

## الخلاصة

### الخطوات الأساسية:

1. **شغل النظام:**
```bash
start-all.bat
```

2. **اختبر محلياً:**
```powershell
powershell -ExecutionPolicy Bypass -File test-order.ps1
```

3. **شوف النتيجة:**
```
http://localhost:3000/orders
```

4. **لو مفيش orders:**
- شوف Backend logs
- شوف Database (prisma studio)
- شوف Browser Console (F12)

---

## للمساعدة السريعة

### الأمر السحري (يفحص كل شيء):

```powershell
# سيتم إنشاء هذا الأمر
powershell -ExecutionPolicy Bypass -File test-order.ps1
```

**هيفحص:**
- ✅ Backend شغال؟
- ✅ User موجود؟
- ✅ Webhook بيشتغل؟
- ✅ Order اتحفظ؟

---

**لو عملت كل ده والمشكلة لسه موجودة، ابعتلي:**
1. Backend logs (آخر 20 سطر)
2. Browser Console errors (F12)
3. Shopify webhook delivery logs

وهساعدك! 🚀

