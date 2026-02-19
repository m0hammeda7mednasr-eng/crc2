# 🚀 رفع النظام على Production

## الفرق بين Development و Production

### Development (localhost)
```
❌ محتاج ngrok عشان HTTPS
❌ URL بيتغير كل مرة
❌ مش آمن للاستخدام الحقيقي
```

### Production (سيرفر حقيقي)
```
✅ HTTPS تلقائي
✅ URL ثابت
✅ آمن ومستقر
✅ مفيش ngrok خالص!
```

---

## خطوات النشر

### 1️⃣ اختار مكان الاستضافة

#### الخيارات الموصى بها:

**أ. DigitalOcean (الأسهل)**
- Droplet (VPS)
- $5-10 شهرياً
- Ubuntu 22.04
- سهل جداً

**ب. AWS (الأقوى)**
- EC2 Instance
- Free tier متاح
- أكثر مرونة

**ج. Heroku (الأبسط)**
- مجاني للبداية
- سهل جداً
- محدود شوية

**د. VPS عربي**
- Hostinger
- Namecheap
- أي VPS عربي

---

### 2️⃣ احصل على Domain

#### خيارات:

**أ. Domain مدفوع (موصى به)**
```
- Namecheap: $10/سنة
- GoDaddy: $12/سنة
- Domain.com: $10/سنة
```

**ب. Subdomain مجاني**
```
- من الاستضافة نفسها
- مثال: yourapp.provider.com
```

**مثال Domain:**
```
crm.yourdomain.com
```

---

### 3️⃣ إعداد السيرفر

#### على Ubuntu/Linux:

```bash
# 1. تحديث النظام
sudo apt update
sudo apt upgrade -y

# 2. تثبيت Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. تثبيت PostgreSQL (أو استخدم SQLite)
sudo apt install -y postgresql postgresql-contrib

# 4. تثبيت Nginx (للـ reverse proxy)
sudo apt install -y nginx

# 5. تثبيت Certbot (للـ SSL/HTTPS)
sudo apt install -y certbot python3-certbot-nginx

# 6. تثبيت PM2 (لإدارة Node.js)
sudo npm install -g pm2
```

---

### 4️⃣ رفع الكود

#### الطريقة 1: Git (موصى بها)

```bash
# على السيرفر
cd /var/www
sudo git clone https://github.com/yourusername/your-repo.git
cd your-repo

# Backend
cd backend
npm install
npx prisma migrate deploy
npm run build

# Frontend
cd ../frontend
npm install
npm run build
```

#### الطريقة 2: FTP/SFTP

```
استخدم FileZilla أو WinSCP
ارفع المجلد كامل
```

---

### 5️⃣ إعداد Environment Variables

#### Backend `.env` (Production)

```env
# Database (استخدم PostgreSQL للـ production)
DATABASE_URL="postgresql://user:password@localhost:5432/crm_db"

# أو SQLite (للبداية)
DATABASE_URL="file:./production.db"

# JWT
JWT_SECRET="your-super-secret-key-change-this-123456"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV=production

# CORS - حط الـ domain بتاعك
CLIENT_URL="https://crm.yourdomain.com"

# Shopify OAuth
SHOPIFY_REDIRECT_URI="https://api.yourdomain.com/api/shopify/auth/callback"
SHOPIFY_SCOPES="read_orders,write_webhooks,read_customers"

# Frontend URL
FRONTEND_URL="https://crm.yourdomain.com"
```

#### Frontend `.env` (Production)

```env
VITE_API_URL="https://api.yourdomain.com"
```

---

### 6️⃣ إعداد Nginx

#### ملف `/etc/nginx/sites-available/crm`

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name crm.yourdomain.com;

    root /var/www/your-repo/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### تفعيل الإعداد:

```bash
sudo ln -s /etc/nginx/sites-available/crm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### 7️⃣ إعداد SSL/HTTPS (مجاني!)

```bash
# للـ Backend API
sudo certbot --nginx -d api.yourdomain.com

# للـ Frontend
sudo certbot --nginx -d crm.yourdomain.com
```

**Certbot هيعمل كل حاجة تلقائي!** ✅

---

### 8️⃣ تشغيل Backend بـ PM2

```bash
cd /var/www/your-repo/backend

# تشغيل
pm2 start npm --name "crm-backend" -- run start

# حفظ الإعداد
pm2 save

# تشغيل تلقائي عند إعادة التشغيل
pm2 startup
```

---

### 9️⃣ إعداد Shopify Webhook

#### الـ URL الجديد (بدون ngrok!)

```
https://api.yourdomain.com/api/webhook/shopify/orders?userId=YOUR_USER_ID
```

#### في Shopify:

```
Settings → Notifications → Webhooks
Edit webhook
URL: https://api.yourdomain.com/api/webhook/shopify/orders?userId=xxx
Save ✅
```

**مش هيتغير تاني! ثابت للأبد!** 🎉

---

### 🔟 اختبار

#### 1. تأكد من Backend

```bash
curl https://api.yourdomain.com
```

#### 2. تأكد من Frontend

```
https://crm.yourdomain.com
```

#### 3. اختبر Shopify Webhook

```
Shopify → Webhooks → Send test notification
```

#### 4. شوف Logs

```bash
pm2 logs crm-backend
```

---

## الإعداد السريع (DigitalOcean)

### خطوة بخطوة:

#### 1. إنشاء Droplet

```
1. سجل في DigitalOcean
2. Create → Droplets
3. Ubuntu 22.04
4. Basic Plan - $6/month
5. Create Droplet
```

#### 2. اتصل بالسيرفر

```bash
ssh root@your-server-ip
```

#### 3. شغل السكريبت التلقائي

```bash
# حمل السكريبت
curl -o setup.sh https://raw.githubusercontent.com/yourusername/your-repo/main/setup.sh

# شغله
chmod +x setup.sh
./setup.sh
```

---

## سكريبت التثبيت التلقائي

### `setup.sh`

```bash
#!/bin/bash

echo "🚀 Installing CRM System..."

# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install Nginx
apt install -y nginx

# Install Certbot
apt install -y certbot python3-certbot-nginx

# Install PM2
npm install -g pm2

# Clone repo (غير الرابط)
cd /var/www
git clone https://github.com/yourusername/your-repo.git
cd your-repo

# Backend setup
cd backend
npm install
npx prisma migrate deploy
npm run build

# Frontend setup
cd ../frontend
npm install
npm run build

# Start backend
cd ../backend
pm2 start npm --name "crm-backend" -- run start
pm2 save
pm2 startup

echo "✅ Installation complete!"
echo "Next steps:"
echo "1. Configure Nginx"
echo "2. Setup SSL with Certbot"
echo "3. Update .env files"
```

---

## الصيانة

### تحديث الكود

```bash
cd /var/www/your-repo
git pull
cd backend
npm install
npm run build
pm2 restart crm-backend
```

### شوف Logs

```bash
pm2 logs crm-backend
```

### إعادة تشغيل

```bash
pm2 restart crm-backend
```

### إيقاف

```bash
pm2 stop crm-backend
```

---

## Backup

### Database Backup

```bash
# SQLite
cp backend/prisma/production.db backup-$(date +%Y%m%d).db

# PostgreSQL
pg_dump crm_db > backup-$(date +%Y%m%d).sql
```

### Backup تلقائي (يومي)

```bash
# Crontab
crontab -e

# أضف:
0 2 * * * /var/www/your-repo/backup.sh
```

---

## المقارنة

### Development (localhost + ngrok)

```
✅ سهل للتطوير
✅ مجاني
❌ URL بيتغير
❌ مش آمن
❌ بطيء شوية
```

### Production (سيرفر حقيقي)

```
✅ URL ثابت
✅ HTTPS مجاني
✅ سريع
✅ آمن
✅ احترافي
💰 $5-10 شهرياً
```

---

## التكلفة المتوقعة

### الحد الأدنى (للبداية)

```
- VPS: $5/شهر (DigitalOcean)
- Domain: $10/سنة (Namecheap)
- SSL: مجاني (Let's Encrypt)

الإجمالي: ~$6/شهر
```

### موصى به

```
- VPS: $10/شهر (أقوى)
- Domain: $10/سنة
- Backup: $1/شهر
- SSL: مجاني

الإجمالي: ~$11/شهر
```

---

## الخلاصة

### Development (الآن)

```
http://localhost:5000 (Backend)
http://localhost:3000 (Frontend)
https://abc123.ngrok-free.app (للـ Shopify)
```

### Production (بعد النشر)

```
https://api.yourdomain.com (Backend)
https://crm.yourdomain.com (Frontend)
https://api.yourdomain.com/api/webhook/shopify/orders?userId=xxx (للـ Shopify)
```

**مفيش ngrok! كل حاجة ثابتة!** ✅

---

## الخطوات التالية

### 1. جهز للنشر

```bash
# اختبر محلياً
npm run build (Backend)
npm run build (Frontend)
```

### 2. اختار استضافة

```
- DigitalOcean (موصى به)
- AWS
- Heroku
- VPS عربي
```

### 3. احصل على Domain

```
- Namecheap
- GoDaddy
- أي مزود
```

### 4. انشر!

```bash
# استخدم السكريبت التلقائي
./setup.sh
```

---

## للمساعدة

لو محتاج مساعدة في النشر:
1. اختار الاستضافة
2. ابعتلي التفاصيل
3. هساعدك خطوة بخطوة!

---

**جاهز للنشر! 🚀**

