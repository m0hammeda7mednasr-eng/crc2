# 🚀 ربط Shopify بالـ CRM - دليل شامل

## 📋 نظرة عامة

نظام متكامل لربط متجر Shopify بـ CRM الواتساب. عند إنشاء order في Shopify، يظهر تلقائياً في CRM مع كل التفاصيل.

### ✨ المميزات

- ✅ **تلقائي بالكامل** - لا حاجة لإعدادات معقدة
- ✅ **Real-time** - Orders تظهر فوراً
- ✅ **Multi-user** - كل مستخدم له webhook خاص
- ✅ **آمن** - JWT authentication و rate limiting
- ✅ **سهل الاستخدام** - فقط انسخ والصق!

---

## 🎯 البداية السريعة

### 3 خطوات فقط!

#### 1️⃣ شغل النظام
```bash
start-all.bat
```

#### 2️⃣ انسخ اللينك
- افتح `http://localhost:3000`
- سجل دخول: `admin@crm.com` / `Admin@123456`
- روح **Settings**
- اضغط **Copy** تحت "Shopify Webhook URL"

#### 3️⃣ حط اللينك في Shopify
- Shopify Admin → Settings → Notifications → Webhooks
- Create webhook
- Event: `Order creation`, Format: `JSON`
- URL: الصق اللينك
- Save ✅

**خلاص! 🎉**

---

## 📚 الملفات المرجعية

### للمبتدئين
- **`QUICK_START_AR.md`** - ابدأ هنا! (3 خطوات)
- **`CHECKLIST_AR.md`** - قائمة تحقق كاملة

### للفهم العميق
- **`SHOPIFY_SETUP_ARABIC.md`** - الدليل الكامل المفصل
- **`SYSTEM_FLOW_AR.md`** - كيف يشتغل النظام (مع رسوم توضيحية)

### للمشاكل التقنية
- **`FINAL_SETUP_SUMMARY.md`** - ملخص تقني (English)
- **`NGROK_SETUP.md`** - حل مشاكل ngrok

---

## 🛠️ المتطلبات

### البرامج المطلوبة
- Node.js (v16 أو أحدث)
- npm
- متجر Shopify

### التثبيت
```bash
# Backend
cd backend
npm install
npx prisma migrate dev

# Frontend
cd frontend
npm install
```

---

## 🔧 كيف يشتغل؟

```
Shopify Order
    ↓
Webhook → ngrok → Backend
    ↓
يستخرج بيانات العميل والأوردر
    ↓
يحفظ في Database
    ↓
يرسل WebSocket notification
    ↓
Frontend يتحدث فوراً
    ↓
المستخدم يشوف الأوردر! ✅
```

---

## 📱 الواجهات

### Settings Page
- عرض Webhook URL تلقائي
- زرار Copy للنسخ السريع
- كشف HTTPS (ngrok)
- إعدادات Shopify OAuth

### Orders Page
- عرض كل الـ Orders
- Real-time updates
- تفاصيل كاملة لكل order
- حالة الـ order (Pending, Confirmed, Cancelled)

### Customers Page
- عرض كل العملاء
- يتم إنشاؤهم تلقائياً من Orders
- معلومات الاتصال

---

## 🔐 الأمان

### المطبق حالياً
- ✅ JWT Authentication
- ✅ Rate Limiting
- ✅ Input Validation
- ✅ User-specific URLs

### موصى به للـ Production
- 🔒 Shopify HMAC Verification
- 🔒 HTTPS على Domain حقيقي
- 🔒 Environment Variables آمنة
- 🔒 Webhook Logs Monitoring

---

## 🌐 ngrok vs Production

### Development (localhost)
```
✅ استخدم ngrok
✅ URL: https://abc123.ngrok-free.app
⚠️ URL يتغير كل مرة
⚠️ محتاج تحديث في Shopify
```

### Production (domain حقيقي)
```
✅ لا حاجة لـ ngrok
✅ URL: https://your-domain.com
✅ URL ثابت
✅ إعداد مرة واحدة فقط
```

---

## 📊 البيانات

### Database Schema

#### Customer
```typescript
{
  id: string
  phoneNumber: string
  name: string
  userId: string
  createdAt: DateTime
}
```

#### Order
```typescript
{
  id: string
  orderId: string
  orderNumber: string
  total: number
  status: string
  customerName: string
  customerPhone: string
  userId: string
  customerId: string
  items: string (JSON)
  createdAt: DateTime
}
```

---

## 🧪 الاختبار

### Test 1: من Shopify
```bash
1. روح Shopify webhook settings
2. اضغط "Send test notification"
3. شوف Orders page في CRM
4. يجب أن يظهر order تجريبي
```

### Test 2: Order حقيقي
```bash
1. اعمل order في متجرك
2. شوف Orders page في CRM
3. يجب أن يظهر خلال ثواني
```

### Test 3: Real-time
```bash
1. افتح Orders page
2. اعمل order جديد
3. يجب أن يظهر بدون refresh
```

---

## 🐛 استكشاف الأخطاء

### Order مش بيظهر؟

#### تحقق من:
1. **Backend شغال؟** - شوف نافذة Backend Server
2. **ngrok شغال؟** - شوف نافذة ngrok
3. **URL صحيح؟** - انسخه من Settings تاني
4. **Shopify logs** - شوف Recent deliveries

#### الحلول:
```bash
# أعد تشغيل كل شيء
start-all.bat

# انسخ URL جديد من Settings
# حدثه في Shopify webhook settings

# اختبر بـ "Send test notification"
```

---

## 📁 هيكل المشروع

```
wahtsapp-main/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── webhook.controller.ts  ← يستقبل Shopify webhooks
│   │   ├── services/
│   │   │   ├── customer.service.ts    ← إدارة العملاء
│   │   │   └── order.service.ts       ← إدارة الأوردرات
│   │   └── routes/
│   │       └── webhook.routes.ts      ← Webhook endpoints
│   └── prisma/
│       └── schema.prisma              ← Database schema
│
├── frontend/
│   └── src/
│       └── pages/
│           ├── Settings.tsx           ← عرض Webhook URL
│           ├── Orders.tsx             ← عرض الأوردرات
│           └── Customers.tsx          ← عرض العملاء
│
├── start-all.bat                      ← تشغيل كل شيء
├── QUICK_START_AR.md                  ← البداية السريعة
├── CHECKLIST_AR.md                    ← قائمة التحقق
├── SHOPIFY_SETUP_ARABIC.md            ← الدليل الكامل
└── SYSTEM_FLOW_AR.md                  ← شرح النظام
```

---

## 🔄 Workflow الكامل

### 1. الإعداد الأولي (مرة واحدة)
```bash
# تثبيت Dependencies
cd backend && npm install
cd ../frontend && npm install

# إعداد Database
cd backend && npx prisma migrate dev

# إنشاء Admin User
node create-admin.js
```

### 2. التشغيل اليومي
```bash
# شغل كل شيء
start-all.bat

# انتظر 30 ثانية
# افتح http://localhost:3000
# سجل دخول
# روح Settings
# انسخ Webhook URL
# حدثه في Shopify (لو ngrok URL تغير)
```

### 3. الاستخدام
```
عميل يعمل Order
    ↓
يظهر في CRM تلقائياً
    ↓
تتابع الأوردر من Orders page
    ↓
تتواصل مع العميل من Customers page
```

---

## 🎓 الميزات المتقدمة

### Shopify OAuth (اختياري)
- ربط متجرك بـ OAuth
- قراءة بيانات إضافية من Shopify API
- تحديث Orders من Shopify
- راجع `SHOPIFY_OAUTH_SETUP.md`

### WhatsApp Integration
- إرسال رسائل للعملاء تلقائياً
- استخدام n8n workflows
- راجع `n8n-workflows/` و `N8N_QUICK_START.md`

### Multi-user Support
- كل مستخدم له webhook خاص
- Orders منفصلة لكل مستخدم
- Admin Dashboard لإدارة المستخدمين

---

## 📞 الدعم

### الموارد
- **الملفات المرجعية** - في المجلد الرئيسي
- **Backend Logs** - نافذة Backend Server
- **ngrok Logs** - نافذة ngrok
- **Shopify Logs** - Webhook Recent deliveries

### خطوات المساعدة
1. راجع `CHECKLIST_AR.md`
2. شوف الـ logs
3. اختبر كل جزء على حدة
4. راجع `SYSTEM_FLOW_AR.md` لفهم كيف يشتغل

---

## 🚀 الخطوات التالية

### بعد الإعداد الناجح:
1. ✅ اختبر مع orders حقيقية
2. ✅ راقب الـ logs للتأكد
3. ✅ اربط WhatsApp (اختياري)
4. ✅ اعمل customization حسب احتياجك
5. ✅ انشر على Production

### للـ Production:
1. احصل على domain
2. انشر Backend و Frontend
3. حدث Environment Variables
4. حدث Shopify webhook URL
5. اختبر!

---

## 📝 الملاحظات

### ⚠️ مهم
- ngrok URL يتغير كل مرة (للـ development)
- لازم تحديث URL في Shopify بعد كل إعادة تشغيل
- للـ Production، استخدم domain حقيقي

### ✅ نصائح
- احتفظ بنافذة ngrok مفتوحة
- راقب Backend logs للـ debugging
- استخدم Shopify test notifications للاختبار
- اعمل backup للـ database بانتظام

---

## 🎉 الخلاصة

### ما تم إنجازه:
- ✅ Backend يستقبل Shopify webhooks
- ✅ Frontend يعرض Webhook URL تلقائي
- ✅ Auto-detection لـ ngrok
- ✅ Real-time updates
- ✅ Multi-user support
- ✅ توثيق شامل بالعربي

### النتيجة:
**نظام متكامل يربط Shopify بـ CRM تلقائياً!**

```
Order في Shopify → يظهر في CRM فوراً! ✅
```

---

## 📄 الترخيص

هذا المشروع للاستخدام الداخلي.

---

## 👨‍💻 المطور

تم التطوير بواسطة فريق CRM

---

**ابدأ الآن! 🚀**

```bash
start-all.bat
```

