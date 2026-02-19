# 📝 شرح Environment Variables

## إيه هي Environment Variables؟

هي إعدادات النظام - زي الإعدادات في موبايلك!

---

## الملف: `.env`

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="dev-jwt-secret-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV="development"

# CORS
CLIENT_URL="http://localhost:3000"

# Shopify
SHOPIFY_REDIRECT_URI="http://localhost:5000/api/shopify/auth/callback"
SHOPIFY_SCOPES="read_orders,write_webhooks,read_customers"
FRONTEND_URL="http://localhost:3000"
```

---

## شرح كل واحدة

### 1. DATABASE_URL

```env
DATABASE_URL="file:./dev.db"
```

**إيه ده؟**
- مكان الـ database
- فين البيانات متخزنة

**أمثلة:**
```env
# SQLite (Development)
DATABASE_URL="file:./dev.db"

# PostgreSQL (Production)
DATABASE_URL="postgresql://user:password@host:5432/database"

# Supabase
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
```

**ليه مهم؟**
- بدونه = مفيش database = مفيش بيانات! ❌

---

### 2. JWT_SECRET

```env
JWT_SECRET="dev-jwt-secret-key"
```

**إيه ده؟**
- المفتاح السري للـ JWT
- زي مفتاح الخزنة

**ليه مهم؟**
- يحمي بيانات المستخدمين 🔒
- يمنع التزوير
- لازم يكون سري جداً!

**للـ Production:**
```env
# ❌ ضعيف
JWT_SECRET="123"

# ✅ قوي
JWT_SECRET="Kj8#mP2$vL9@nQ4&wR7*xT5!yU3%zA6"
```

**كيف تولده:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 3. JWT_EXPIRES_IN

```env
JWT_EXPIRES_IN="7d"
```

**إيه ده؟**
- مدة صلاحية الـ Token
- بعدها User لازم يسجل دخول تاني

**الخيارات:**
```env
JWT_EXPIRES_IN="1h"   # ساعة (أكثر أماناً)
JWT_EXPIRES_IN="24h"  # يوم
JWT_EXPIRES_IN="7d"   # 7 أيام (موصى به)
JWT_EXPIRES_IN="30d"  # 30 يوم (أقل أماناً)
```

**ليه مهم؟**
- لو حد سرق Token، يبطل بعد المدة دي ✅

---

### 4. PORT

```env
PORT=5000
```

**إيه ده؟**
- رقم الـ port اللي Backend هيشتغل عليه

**أمثلة:**
```env
PORT=5000  # موصى به
PORT=3000  # ممكن
PORT=8080  # ممكن
```

**ليه مهم؟**
- عشان Frontend يعرف يكلم Backend على أنهي port

---

### 5. NODE_ENV

```env
NODE_ENV="development"
```

**إيه ده؟**
- البيئة اللي النظام شغال فيها

**الخيارات:**
```env
NODE_ENV="development"  # للتطوير
NODE_ENV="production"   # للإنتاج
NODE_ENV="test"         # للاختبار
```

**ليه مهم؟**
- يغير سلوك النظام حسب البيئة
- Development: logs كتيرة، errors واضحة
- Production: logs أقل، errors مخفية

---

### 6. CLIENT_URL

```env
CLIENT_URL="http://localhost:3000"
```

**إيه ده؟**
- عنوان الـ Frontend

**ليه مهم؟**
- للـ CORS (Cross-Origin Resource Sharing)
- عشان Backend يسمح للـ Frontend يكلمه

**أمثلة:**
```env
# Development
CLIENT_URL="http://localhost:3000"

# Production
CLIENT_URL="https://your-app.vercel.app"
```

---

### 7. SHOPIFY_REDIRECT_URI

```env
SHOPIFY_REDIRECT_URI="http://localhost:5000/api/shopify/auth/callback"
```

**إيه ده؟**
- الـ URL اللي Shopify هيرجع عليه بعد OAuth

**ليه مهم؟**
- للـ Shopify OAuth
- لازم يكون مطابق للي في Shopify App settings

**أمثلة:**
```env
# Development
SHOPIFY_REDIRECT_URI="http://localhost:5000/api/shopify/auth/callback"

# Production
SHOPIFY_REDIRECT_URI="https://api.yourdomain.com/api/shopify/auth/callback"
```

---

### 8. SHOPIFY_SCOPES

```env
SHOPIFY_SCOPES="read_orders,write_webhooks,read_customers"
```

**إيه ده؟**
- الصلاحيات اللي النظام محتاجها من Shopify

**الصلاحيات:**
- `read_orders` - قراءة Orders
- `write_webhooks` - إنشاء Webhooks
- `read_customers` - قراءة Customers

**ليه مهم؟**
- عشان Shopify يعرف إيه اللي النظام محتاجه

---

### 9. FRONTEND_URL

```env
FRONTEND_URL="http://localhost:3000"
```

**إيه ده؟**
- عنوان الـ Frontend (للـ redirects)

**ليه مهم؟**
- بعد OAuth، Backend يرجع User للـ Frontend

**أمثلة:**
```env
# Development
FRONTEND_URL="http://localhost:3000"

# Production
FRONTEND_URL="https://your-app.vercel.app"
```

---

## Development vs Production

### Development (.env)

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="dev-jwt-secret-key"
PORT=5000
NODE_ENV="development"
CLIENT_URL="http://localhost:3000"
SHOPIFY_REDIRECT_URI="http://localhost:5000/api/shopify/auth/callback"
FRONTEND_URL="http://localhost:3000"
```

**مميزات:**
- ✅ سهل
- ✅ سريع
- ✅ للاختبار

**عيوب:**
- ❌ مش آمن
- ❌ مش للإنتاج

---

### Production (.env.production)

```env
DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
JWT_SECRET="Kj8#mP2$vL9@nQ4&wR7*xT5!yU3%zA6"
PORT=5000
NODE_ENV="production"
CLIENT_URL="https://your-app.vercel.app"
SHOPIFY_REDIRECT_URI="https://api.yourdomain.com/api/shopify/auth/callback"
FRONTEND_URL="https://your-app.vercel.app"
```

**مميزات:**
- ✅ آمن
- ✅ قوي
- ✅ للعملاء الحقيقيين

**مهم:**
- ✅ JWT_SECRET قوي
- ✅ HTTPS في كل الـ URLs
- ✅ PostgreSQL بدل SQLite

---

## الأخطاء الشائعة

### ❌ خطأ 1: JWT_SECRET ضعيف

```env
JWT_SECRET="123"  ❌
```

**الحل:**
```env
JWT_SECRET="Kj8#mP2$vL9@nQ4&wR7*xT5!yU3%zA6"  ✅
```

---

### ❌ خطأ 2: URLs غلط

```env
# Development
CLIENT_URL="https://your-app.vercel.app"  ❌ مش localhost!
```

**الحل:**
```env
CLIENT_URL="http://localhost:3000"  ✅
```

---

### ❌ خطأ 3: مفيش .env

```
Error: DATABASE_URL is not defined
```

**الحل:**
```bash
# انسخ من المثال
cp .env.example .env
# عدل القيم
```

---

## كيف تستخدمها؟

### في الكود:

```typescript
// Backend
const jwtSecret = process.env.JWT_SECRET;
const port = process.env.PORT || 5000;
const databaseUrl = process.env.DATABASE_URL;
```

### في Frontend:

```typescript
// لازم تبدأ بـ VITE_
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## الأمان

### ✅ افعل:

- احفظ `.env` في `.gitignore`
- استخدم JWT_SECRET قوي
- غير الـ secrets في Production
- استخدم HTTPS في Production

### ❌ لا تفعل:

- ترفع `.env` على GitHub
- تشارك JWT_SECRET
- تستخدم secrets ضعيفة
- تستخدم HTTP في Production

---

## الخلاصة

### Environment Variables مهمة عشان:

1. **الإعدادات** ⚙️
   - تتحكم في سلوك النظام

2. **الأمان** 🔒
   - تحمي البيانات الحساسة

3. **المرونة** 🔄
   - تغير الإعدادات بدون تعديل الكود

4. **البيئات المختلفة** 🌍
   - Development vs Production

---

**لازم تفهمها وتضبطها صح! 🎯**

