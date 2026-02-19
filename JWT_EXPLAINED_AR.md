# 🔐 JWT - ليه مهم؟

## إيه هو JWT؟

**JWT = JSON Web Token**

هو زي "البطاقة الشخصية" للمستخدم في النظام.

---

## المشكلة بدون JWT

### سيناريو: 3 users في النظام

```
User 1: Ahmed  (متجر أحمد)
User 2: Sara   (متجر سارة)
User 3: Mohamed (متجر محمد)
```

### بدون JWT:

```
❌ Ahmed يقدر يشوف orders سارة!
❌ Sara تقدر تشوف customers محمد!
❌ Mohamed يقدر يمسح messages أحمد!
❌ أي حد يقدر يوصل لأي بيانات!
```

**كارثة أمنية!** 💥

---

## الحل: JWT

### مع JWT:

```
✅ Ahmed يشوف orders بتاعته بس
✅ Sara تشوف customers بتاعتها بس
✅ Mohamed يشوف messages بتاعته بس
✅ كل واحد في عالمه!
```

**آمن ومحمي!** 🔒

---

## كيف يشتغل؟

### 1️⃣ Login

```
User: ahmed@store.com
Password: ****

Backend يتأكد من البيانات ✅
Backend يعمل JWT Token:
```

```json
{
  "userId": "user_123",
  "email": "ahmed@store.com",
  "role": "user"
}
```

**يشفره ويبعته للـ Frontend:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyXzEyMyIsImVtYWlsIjoiYWhtZWRAc3RvcmUuY29tIn0.abc123xyz
```

---

### 2️⃣ كل Request

```
Frontend يبعت الـ Token مع كل request:

GET /api/orders
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 3️⃣ Backend يتحقق

```typescript
// Backend يفك الـ Token
const decoded = jwt.verify(token, JWT_SECRET);
// { userId: "user_123", email: "ahmed@store.com" }

// يجيب orders الـ user ده بس!
const orders = await prisma.order.findMany({
  where: { userId: decoded.userId }  // ✅ بتاعته بس!
});
```

---

## مثال عملي

### User 1: Ahmed

```
Login → Token: abc123
GET /api/orders
Backend: يجيب orders Ahmed بس ✅
```

### User 2: Sara

```
Login → Token: xyz789
GET /api/orders
Backend: يجيب orders Sara بس ✅
```

### لو Sara حاولت تشوف orders Ahmed:

```
Sara Token: xyz789
GET /api/orders

Backend يفك Token:
  userId: sara_456  ← مش ahmed!

يجيب orders Sara بس ✅
مش هتقدر تشوف orders Ahmed ❌
```

---

## JWT_SECRET - ليه مهم؟

### هو المفتاح السري!

```env
JWT_SECRET="super-secret-key-123456"
```

**زي مفتاح الخزنة:**
- لو حد عرفه = يقدر يعمل tokens مزيفة! ❌
- لازم يكون سري جداً! 🔒
- لازم يكون معقد! 🔐

---

### مثال سيء:

```env
JWT_SECRET="123"  ❌ سهل جداً!
JWT_SECRET="password"  ❌ متوقع!
JWT_SECRET="secret"  ❌ ضعيف!
```

### مثال كويس:

```env
JWT_SECRET="Kj8#mP2$vL9@nQ4&wR7*xT5!yU3%zA6"  ✅ قوي!
JWT_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"  ✅ عشوائي!
```

---

## في المشروع بتاعنا

### 1. Login (auth.controller.ts)

```typescript
// User يسجل دخول
const user = await prisma.user.findUnique({ where: { email } });

// نتأكد من الـ password
const isValid = await bcrypt.compare(password, user.passwordHash);

// نعمل JWT Token
const token = jwt.sign(
  { userId: user.id, email: user.email, role: user.role },
  JWT_SECRET,  // ← المفتاح السري!
  { expiresIn: '7d' }  // صالح لمدة 7 أيام
);

// نرجعه للـ Frontend
return { user, token };
```

---

### 2. كل Request (auth.middleware.ts)

```typescript
// نستخرج الـ Token من الـ Header
const token = req.headers.authorization?.split(' ')[1];

// نفكه ونتحقق منه
const decoded = jwt.verify(token, JWT_SECRET);

// نحط الـ userId في الـ request
req.userId = decoded.userId;

// نكمل للـ Controller ✅
```

---

### 3. جلب البيانات (order.controller.ts)

```typescript
// نجيب الـ userId من الـ request
const userId = req.userId;  // من الـ middleware

// نجيب orders الـ user ده بس!
const orders = await prisma.order.findMany({
  where: { userId }  // ✅ بتاعته بس!
});
```

---

## بدون JWT - ماذا سيحدث؟

### السيناريو الكارثي:

```
1. Ahmed يفتح النظام
2. يروح على: /api/orders
3. Backend يجيب كل الـ orders! ❌
   - orders Ahmed ✅
   - orders Sara ❌ (مش المفروض!)
   - orders Mohamed ❌ (مش المفروض!)

4. Ahmed يشوف بيانات كل الناس! 💥
```

---

### مع JWT:

```
1. Ahmed يسجل دخول
2. يجيب Token: abc123
3. يروح على: /api/orders
4. يبعت Token مع الـ request
5. Backend يفك Token:
   userId: ahmed_123
6. يجيب orders Ahmed بس! ✅
```

---

## JWT_EXPIRES_IN - ليه؟

```env
JWT_EXPIRES_IN="7d"  # 7 أيام
```

**الأمان:**
- لو حد سرق الـ Token
- بعد 7 أيام يبطل يشتغل ✅
- User لازم يسجل دخول تاني

**البدائل:**
```env
JWT_EXPIRES_IN="1h"   # ساعة واحدة (أكثر أماناً)
JWT_EXPIRES_IN="24h"  # يوم واحد
JWT_EXPIRES_IN="7d"   # 7 أيام (مريح)
JWT_EXPIRES_IN="30d"  # 30 يوم (أقل أماناً)
```

---

## في Production

### لازم تغير JWT_SECRET!

```env
# ❌ Development (ضعيف)
JWT_SECRET="dev-jwt-secret-key-change-in-production"

# ✅ Production (قوي)
JWT_SECRET="Kj8#mP2$vL9@nQ4&wR7*xT5!yU3%zA6^bN1&cM4@dP7"
```

### كيف تولد JWT_SECRET قوي:

```bash
# الطريقة 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# الطريقة 2: Online
# https://randomkeygen.com/

# الطريقة 3: PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## الخلاصة

### JWT مهم عشان:

1. **الأمان** 🔒
   - كل user يشوف بياناته بس
   - مفيش حد يقدر يوصل لبيانات غيره

2. **التحقق** ✅
   - Backend يتأكد من هوية الـ user
   - مفيش requests مجهولة

3. **الفصل** 🎯
   - كل user في عالمه
   - Orders منفصلة
   - Customers منفصلين
   - Messages منفصلة

4. **الاحترافية** 💼
   - Standard في كل الأنظمة
   - آمن ومجرب
   - سهل الاستخدام

---

## بدون JWT:

```
❌ أي حد يقدر يشوف أي بيانات
❌ مفيش أمان
❌ مفيش خصوصية
❌ كارثة!
```

## مع JWT:

```
✅ كل user يشوف بياناته بس
✅ آمن ومحمي
✅ خصوصية كاملة
✅ احترافي!
```

---

## في المشروع بتاعنا

### كل الـ APIs محمية بـ JWT:

```
✅ /api/orders      - Orders الـ user بس
✅ /api/customers   - Customers الـ user بس
✅ /api/messages    - Messages الـ user بس
✅ /api/settings    - Settings الـ user بس
✅ /api/dashboard   - Dashboard الـ user بس
```

### الـ Webhooks مش محمية:

```
⚠️ /api/webhook/shopify/orders  - عشان Shopify يقدر يبعت
⚠️ /api/webhook/incoming         - عشان n8n يقدر يبعت
```

**بس محمية بطرق تانية:**
- Shop domain
- Rate limiting
- Validation

---

**JWT مش optional - هو أساسي للأمان! 🔐**

