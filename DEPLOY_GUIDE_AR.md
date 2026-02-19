# 🚀 Deploy المشروع - مجاني واحترافي!

## الخطة

```
Backend  → Railway    (مجاني)
Frontend → Vercel     (مجاني)
Database → Supabase   (مجاني)
```

**كل حاجة مجانية ومحترفية! 🎉**

---

## 1️⃣ إعداد Database (Supabase)

### الخطوات:

1. **روح https://supabase.com**
2. **Sign up** (مجاني)
3. **New Project**
   - Name: `whatsapp-crm`
   - Database Password: احفظه!
   - Region: اختار الأقرب ليك
4. **انتظر 2 دقيقة** (بيجهز الـ database)
5. **Settings → Database**
6. **انسخ Connection String:**
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```

---

## 2️⃣ إعداد Backend (Railway)

### الخطوات:

1. **روح https://railway.app**
2. **Sign up with GitHub** (مجاني)
3. **New Project → Deploy from GitHub repo**
4. **اختار المشروع بتاعك**
5. **Settings:**
   - Root Directory: `backend`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm run start`
6. **Variables (Environment Variables):**
   ```env
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
   JWT_SECRET=your-super-secret-key-change-this-123456
   JWT_EXPIRES_IN=7d
   PORT=5000
   NODE_ENV=production
   CLIENT_URL=https://your-app.vercel.app
   SHOPIFY_REDIRECT_URI=https://your-backend.railway.app/api/shopify/auth/callback
   SHOPIFY_SCOPES=read_orders,write_webhooks,read_customers
   FRONTEND_URL=https://your-app.vercel.app
   ```
7. **Deploy!**
8. **انسخ الـ URL:**
   ```
   https://your-backend.railway.app
   ```

---

## 3️⃣ إعداد Frontend (Vercel)

### الخطوات:

1. **روح https://vercel.com**
2. **Sign up with GitHub** (مجاني)
3. **New Project → Import Git Repository**
4. **اختار المشروع بتاعك**
5. **Settings:**
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. **Environment Variables:**
   ```env
   VITE_API_URL=https://your-backend.railway.app
   ```
7. **Deploy!**
8. **انسخ الـ URL:**
   ```
   https://your-app.vercel.app
   ```

---

## 4️⃣ تحديث الـ URLs

### في Railway (Backend):

**حدث Environment Variables:**
```env
CLIENT_URL=https://your-app.vercel.app
FRONTEND_URL=https://your-app.vercel.app
```

**Redeploy!**

---

## 5️⃣ Run Database Migrations

### في Railway:

1. **Settings → Variables**
2. **أضف:**
   ```env
   DATABASE_URL=postgresql://...
   ```
3. **في Terminal (محلي):**
   ```bash
   cd backend
   DATABASE_URL="postgresql://..." npx prisma migrate deploy
   ```

أو استخدم Railway CLI:
```bash
railway login
railway link
railway run npx prisma migrate deploy
```

---

## 6️⃣ إنشاء Admin User

### الطريقة 1: Railway CLI

```bash
railway run node create-admin.js
```

### الطريقة 2: من الكود

أضف endpoint مؤقت في `backend/src/index.ts`:

```typescript
// Temporary admin creation endpoint
app.post('/api/setup-admin', async (req, res) => {
  const { email, password } = req.body;
  
  // Check if admin exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.json({ message: 'Admin already exists' });
  }
  
  // Create admin
  const bcrypt = require('bcryptjs');
  const passwordHash = await bcrypt.hash(password, 10);
  
  const admin = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: 'admin',
    },
  });
  
  res.json({ message: 'Admin created', admin: { id: admin.id, email: admin.email } });
});
```

ثم:
```bash
curl -X POST https://your-backend.railway.app/api/setup-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@crm.com","password":"Admin@123456"}'
```

**احذف الـ endpoint بعد كده!**

---

## 7️⃣ اختبار

### 1. Backend
```bash
curl https://your-backend.railway.app
```

### 2. Frontend
```
https://your-app.vercel.app
```

### 3. Login
```
Email: admin@crm.com
Password: Admin@123456
```

### 4. Shopify Webhook
```
https://your-backend.railway.app/api/webhook/shopify/orders?userId=YOUR_USER_ID
```

---

## الملفات المطلوبة

سأنشئها الآن...

