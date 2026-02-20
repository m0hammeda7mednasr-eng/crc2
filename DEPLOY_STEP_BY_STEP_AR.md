# 🚀 Deploy خطوة بخطوة - مجاني 100%!

## المنصات المستخدمة

```
✅ Railway  - Backend  (مجاني)
✅ Vercel   - Frontend (مجاني)
✅ Supabase - Database (مجاني)
```

**كل حاجة مجانية واحترافية!** 🎉

---

## الإعداد المحلي أولاً

### 1. تأكد إن كل حاجة شغالة

```bash
# Backend
cd backend
npm install
npm run build

# Frontend
cd ../frontend
npm install
npm run build
```

**لازم يشتغل بدون errors!** ✅

---

### 2. Push على GitHub

```bash
# Initialize git (لو مش عامله)
git init
git add .
git commit -m "Initial commit"

# Create repo على GitHub
# ثم:
git remote add origin https://github.com/yourusername/your-repo.git
git branch -M main
git push -u origin main
```

---

## Part 1: Database (Supabase)

### الخطوات بالتفصيل:

#### 1. إنشاء حساب

1. روح https://supabase.com
2. اضغط **Start your project**
3. **Sign up with GitHub** (أسهل)
4. أكمل التسجيل

#### 2. إنشاء Project

1. اضغط **New project**
2. املأ البيانات:
   ```
   Name: whatsapp-crm
   Database Password: [اختار password قوي واحفظه!]
   Region: Southeast Asia (Singapore) - الأقرب للعرب
   ```
3. اضغط **Create new project**
4. **انتظر 2-3 دقائق** (بيجهز الـ database)

#### 3. الحصول على Connection String

1. من القائمة الجانبية: **Settings** (⚙️)
2. **Database**
3. **Connection string** → **URI**
4. انسخ الـ URL:
   ```
   postgresql://postgres.xxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
   ```
5. **مهم:** استبدل `[YOUR-PASSWORD]` بالـ password اللي اخترته!

#### 4. احفظ الـ URL

```env
DATABASE_URL="postgresql://postgres.xxx:YOUR_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

**✅ Database جاهز!**

---

## Part 2: Backend (Railway)

### الخطوات بالتفصيل:

#### 1. إنشاء حساب

1. روح https://railway.app
2. اضغط **Login**
3. **Login with GitHub** (أسهل)
4. أكمل التسجيل

#### 2. إنشاء Project

1. اضغط **New Project**
2. اختار **Deploy from GitHub repo**
3. **Configure GitHub App** (لو أول مرة)
4. اختار الـ repo بتاعك
5. اضغط **Deploy Now**

#### 3. إعداد Build Settings

1. اضغط على الـ service اللي اتعمل
2. **Settings** → **Build**
3. **Root Directory:** `backend`
4. **Build Command:**
   ```bash
   npm install && npx prisma generate && npm run build
   ```
5. **Start Command:**
   ```bash
   npm run start
   ```
6. **Watch Paths:** `backend/**`

#### 4. إضافة Environment Variables

1. **Variables** tab
2. اضغط **+ New Variable**
3. أضف كل واحدة:

```env
DATABASE_URL=postgresql://postgres.xxx:YOUR_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres

JWT_SECRET=super-secret-key-change-this-to-random-string-123456789

JWT_EXPIRES_IN=7d

PORT=5000

NODE_ENV=production

CLIENT_URL=https://your-app.vercel.app

SHOPIFY_REDIRECT_URI=https://your-backend.railway.app/api/shopify/auth/callback

SHOPIFY_SCOPES=read_orders,write_webhooks,read_customers

FRONTEND_URL=https://your-app.vercel.app

RATE_LIMIT_WINDOW_MS=900000

RATE_LIMIT_MAX_REQUESTS=100

MAX_FILE_SIZE=5242880

UPLOAD_DIR=./uploads
```

**ملاحظة:** هنحدث `CLIENT_URL` و `FRONTEND_URL` بعد ما نعمل الـ Frontend!

#### 5. Deploy!

1. اضغط **Deploy**
2. انتظر 2-3 دقائق
3. لما يخلص، اضغط **Settings** → **Networking**
4. **Generate Domain**
5. انسخ الـ URL:
   ```
   https://your-backend.railway.app
   ```

#### 6. Run Migrations

**الطريقة 1: Railway CLI (موصى بها)**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Run migrations
railway run npx prisma migrate deploy
```

**الطريقة 2: من جهازك**

```bash
cd backend
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

**✅ Backend جاهز!**

---

## Part 3: Frontend (Vercel)

### الخطوات بالتفصيل:

#### 1. إنشاء حساب

1. روح https://vercel.com
2. اضغط **Sign Up**
3. **Continue with GitHub** (أسهل)
4. أكمل التسجيل

#### 2. إنشاء Project

1. اضغط **Add New...** → **Project**
2. **Import Git Repository**
3. اختار الـ repo بتاعك
4. اضغط **Import**

#### 3. إعداد Build Settings

1. **Framework Preset:** Vite
2. **Root Directory:** `frontend`
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Install Command:** `npm install`

#### 4. إضافة Environment Variables

1. **Environment Variables** section
2. أضف:
   ```env
   VITE_API_URL=https://your-backend.railway.app
   ```
   (استخدم الـ URL من Railway!)

#### 5. Deploy!

1. اضغط **Deploy**
2. انتظر 2-3 دقائق
3. لما يخلص، انسخ الـ URL:
   ```
   https://your-app.vercel.app
   ```

**✅ Frontend جاهز!**

---

## Part 4: تحديث الـ URLs

### في Railway (Backend):

1. روح للـ project في Railway
2. **Variables**
3. حدث:
   ```env
   CLIENT_URL=https://your-app.vercel.app
   FRONTEND_URL=https://your-app.vercel.app
   ```
4. **Redeploy** (تلقائي)

---

## Part 5: إنشاء Admin User

### الطريقة الأسهل:

#### 1. أضف endpoint مؤقت

في `backend/src/index.ts`، أضف قبل `app.listen`:

```typescript
// Temporary setup endpoint - DELETE AFTER USE!
app.post('/api/setup-admin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Check if admin exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.json({ message: 'Admin already exists', email });
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
    
    res.json({ 
      message: 'Admin created successfully!', 
      admin: { id: admin.id, email: admin.email, role: admin.role }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
```

#### 2. Push التعديل

```bash
git add .
git commit -m "Add setup endpoint"
git push
```

#### 3. انتظر الـ deploy (1-2 دقيقة)

#### 4. أنشئ الـ admin

```bash
curl -X POST https://your-backend.railway.app/api/setup-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@crm.com","password":"Admin@123456"}'
```

**المفروض تشوف:**
```json
{
  "message": "Admin created successfully!",
  "admin": {
    "id": "...",
    "email": "admin@crm.com",
    "role": "admin"
  }
}
```

#### 5. احذف الـ endpoint!

امسح الكود اللي ضفته، ثم:

```bash
git add .
git commit -m "Remove setup endpoint"
git push
```

**✅ Admin User جاهز!**

---

## Part 6: الاختبار

### 1. اختبر Backend

```bash
curl https://your-backend.railway.app
```

**المفروض تشوف:**
```json
{"message":"WhatsApp CRM API"}
```

### 2. اختبر Frontend

افتح: `https://your-app.vercel.app`

**المفروض تشوف:** صفحة Login

### 3. سجل دخول

```
Email: admin@crm.com
Password: Admin@123456
```

**المفروض تدخل على Dashboard!** ✅

### 4. اختبر Settings

1. روح **Settings**
2. شوف **Shopify Webhook URL**
3. المفروض تشوف:
   ```
   https://your-backend.railway.app/api/webhook/shopify/orders?userId=xxx
   ```

**✅ كل حاجة شغالة!**

---

## Part 7: إعداد Shopify

### 1. انسخ Webhook URL

من Settings في الـ CRM:
```
https://your-backend.railway.app/api/webhook/shopify/orders?userId=xxx
```

### 2. حطه في Shopify

1. Shopify Admin
2. **Settings** → **Notifications**
3. **Webhooks** → **Create webhook**
4. **Event:** Order creation
5. **Format:** JSON
6. **URL:** [الصق اللينك]
7. **Save**

### 3. اختبر

1. **Send test notification**
2. شوف **Recent deliveries** - لازم 200 OK
3. روح CRM → **Orders**
4. المفروض تشوف الـ order! ✅

---

## الخلاصة

### ✅ ما تم إنجازه:

```
✅ Database على Supabase (مجاني)
✅ Backend على Railway (مجاني)
✅ Frontend على Vercel (مجاني)
✅ Admin User تم إنشاؤه
✅ Shopify Webhook شغال
✅ كل حاجة HTTPS
✅ URLs ثابتة للأبد!
```

### 🎯 الـ URLs النهائية:

```
Frontend: https://your-app.vercel.app
Backend:  https://your-backend.railway.app
Webhook:  https://your-backend.railway.app/api/webhook/shopify/orders?userId=xxx
```

---

## الصيانة

### تحديث الكود

```bash
# عدل الكود
git add .
git commit -m "Update feature"
git push

# Railway و Vercel هيعملوا deploy تلقائي! ✅
```

### شوف Logs

**Railway:**
1. روح للـ project
2. **Deployments**
3. اضغط على آخر deployment
4. **View Logs**

**Vercel:**
1. روح للـ project
2. **Deployments**
3. اضغط على آخر deployment
4. **Function Logs**

---

## المشاكل الشائعة

### ❌ Backend مش شغال
