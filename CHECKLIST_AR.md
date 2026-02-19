# قائمة التحقق - Shopify Integration ✅

## قبل البدء

### المتطلبات
- [ ] Node.js مثبت (v16 أو أحدث)
- [ ] npm مثبت
- [ ] Backend dependencies مثبتة (`cd backend && npm install`)
- [ ] Frontend dependencies مثبتة (`cd frontend && npm install`)
- [ ] Database migrations تمت (`cd backend && npx prisma migrate dev`)
- [ ] متجر Shopify جاهز

---

## الإعداد الأولي

### 1. تشغيل النظام
- [ ] شغل `start-all.bat`
- [ ] تأكد من فتح 3 نوافذ:
  - [ ] Backend Server (Port 5000)
  - [ ] Frontend Server (Port 3000)
  - [ ] ngrok (HTTPS Tunnel)
- [ ] انتظر 30 ثانية حتى يبدأ كل شيء

### 2. التحقق من التشغيل
- [ ] افتح `http://localhost:3000`
- [ ] تأكد من ظهور صفحة Login
- [ ] سجل دخول بـ:
  - Email: `admin@crm.com`
  - Password: `Admin@123456`
- [ ] تأكد من ظهور Dashboard

### 3. التحقق من ngrok
- [ ] افتح نافذة ngrok
- [ ] تأكد من ظهور رسالة "Session Status: online"
- [ ] انسخ الـ HTTPS URL (مثال: `https://abc123.ngrok-free.app`)

---

## إعداد Webhook

### 4. الحصول على Webhook URL
- [ ] في CRM، اضغط على **Settings** من القائمة
- [ ] اسكرول لقسم **Shopify Integration**
- [ ] تحت **Shopify Webhook URL**:
  - [ ] تأكد من ظهور URL كامل
  - [ ] تأكد من وجود علامة ✅ خضراء (HTTPS detected)
  - [ ] لو ظهر تحذير ⚠️ أصفر، تأكد من تشغيل ngrok
- [ ] اضغط زرار **Copy** 📋
- [ ] تأكد من ظهور رسالة "Shopify Webhook URL copied to clipboard!"

### 5. إعداد Webhook في Shopify
- [ ] افتح Shopify Admin
- [ ] اذهب إلى **Settings** (أسفل اليسار)
- [ ] اضغط على **Notifications**
- [ ] اسكرول لأسفل إلى **Webhooks**
- [ ] اضغط **Create webhook**
- [ ] املأ البيانات:
  - [ ] Event: اختر **Order creation**
  - [ ] Format: اختر **JSON**
  - [ ] URL: الصق الـ URL المنسوخ
  - [ ] Webhook API version: اختر أحدث إصدار (2024-01 أو أحدث)
- [ ] اضغط **Save**
- [ ] تأكد من ظهور الـ webhook في القائمة

---

## الاختبار

### 6. اختبار Webhook من Shopify
- [ ] في صفحة الـ webhook في Shopify
- [ ] اضغط على الـ webhook اللي عملته
- [ ] اضغط **Send test notification**
- [ ] تأكد من ظهور رسالة نجاح
- [ ] روح CRM → **Orders** page
- [ ] تأكد من ظهور order تجريبي

### 7. اختبار Order حقيقي
- [ ] اعمل order تجريبي في متجرك
- [ ] روح CRM → **Orders** page
- [ ] تأكد من ظهور الـ order خلال ثواني
- [ ] تأكد من البيانات صحيحة:
  - [ ] Order Number
  - [ ] Customer Name
  - [ ] Customer Phone
  - [ ] Total Amount
  - [ ] Status: Pending

### 8. التحقق من Real-time Updates
- [ ] افتح Orders page في CRM
- [ ] اعمل order جديد في Shopify
- [ ] تأكد من ظهور الـ order فوراً بدون refresh
- [ ] تأكد من ظهور notification

---

## التحقق من البيانات

### 9. فحص Customer
- [ ] روح **Customers** page في CRM
- [ ] تأكد من ظهور العميل
- [ ] تأكد من البيانات:
  - [ ] Name
  - [ ] Phone Number
  - [ ] Created Date

### 10. فحص Order Details
- [ ] في Orders page، اضغط على order
- [ ] تأكد من ظهور التفاصيل:
  - [ ] Order Number
  - [ ] Customer Info
  - [ ] Items List
  - [ ] Total Amount
  - [ ] Status
  - [ ] Created Date

---

## استكشاف الأخطاء

### إذا لم يظهر Order

#### تحقق من Backend
- [ ] افتح نافذة Backend Server
- [ ] ابحث عن رسائل error
- [ ] تأكد من رؤية: `[Webhook] Shopify order received`
- [ ] لو مفيش رسائل، الـ webhook مش واصل

#### تحقق من Shopify
- [ ] روح Shopify webhook settings
- [ ] اضغط على الـ webhook
- [ ] شوف **Recent deliveries**
- [ ] تأكد من:
  - [ ] Status: Success (200)
  - [ ] لو Failed، شوف الـ error message

#### تحقق من ngrok
- [ ] افتح نافذة ngrok
- [ ] تأكد من: `Session Status: online`
- [ ] افتح `http://127.0.0.1:4040` (ngrok web interface)
- [ ] شوف الـ requests
- [ ] تأكد من وصول POST request من Shopify

#### تحقق من URL
- [ ] تأكد إن الـ URL في Shopify يبدأ بـ `https://`
- [ ] تأكد من وجود `?userId=` في النهاية
- [ ] تأكد من مطابقة الـ ngrok URL الحالي

---

## الصيانة اليومية

### عند بدء العمل
- [ ] شغل `start-all.bat`
- [ ] انتظر حتى يبدأ كل شيء
- [ ] افتح Settings في CRM
- [ ] انسخ الـ webhook URL الجديد
- [ ] حدث الـ URL في Shopify webhook settings
- [ ] اختبر بـ "Send test notification"

### عند إيقاف العمل
- [ ] أغلق نافذة ngrok (Ctrl+C)
- [ ] أغلق نافذة Backend (Ctrl+C)
- [ ] أغلق نافذة Frontend (Ctrl+C)
- [ ] أو ببساطة أغلق كل النوافذ

---

## للـ Production

### عند النشر على Domain حقيقي
- [ ] احصل على domain (مثال: `crm.yourdomain.com`)
- [ ] انشر Backend على الـ domain
- [ ] حدث `FRONTEND_URL` في `.env`
- [ ] الـ webhook URL سيكون:
  ```
  https://crm.yourdomain.com/api/webhook/shopify/orders?userId=xxx
  ```
- [ ] لن تحتاج ngrok بعد الآن! ✅
- [ ] الـ URL سيكون ثابت
- [ ] حدث الـ webhook في Shopify مرة واحدة فقط

---

## الميزات الإضافية (اختياري)

### Shopify OAuth
- [ ] روح Settings → Shopify Integration
- [ ] اضغط **Configure Shopify Credentials**
- [ ] أدخل:
  - [ ] Shop Domain
  - [ ] Client ID (API Key)
  - [ ] Client Secret (API Secret Key)
- [ ] اضغط **Save Credentials**
- [ ] اضغط **Connect with Shopify**
- [ ] أكمل عملية OAuth في Shopify
- [ ] تأكد من ظهور "Connected" ✅

### WhatsApp Integration
- [ ] استخدم n8n workflows في مجلد `n8n-workflows/`
- [ ] أو ادمج WhatsApp Business API مباشرة
- [ ] راجع `N8N_QUICK_START.md` للتفاصيل

---

## الملفات المرجعية

### للقراءة السريعة
- [ ] `QUICK_START_AR.md` - البداية السريعة (3 خطوات)
- [ ] `CHECKLIST_AR.md` - هذا الملف

### للشرح التفصيلي
- [ ] `SHOPIFY_SETUP_ARABIC.md` - الدليل الكامل
- [ ] `SYSTEM_FLOW_AR.md` - كيف يشتغل النظام
- [ ] `FINAL_SETUP_SUMMARY.md` - ملخص تقني

### للمشاكل
- [ ] `NGROK_SETUP.md` - مشاكل ngrok
- [ ] Backend logs - في نافذة Backend Server
- [ ] Shopify webhook logs - في Shopify Admin

---

## الحالة النهائية

### ✅ يجب أن يكون لديك:
- [x] Backend يعمل على port 5000
- [x] Frontend يعمل على port 3000
- [x] ngrok يعمل ويعطي HTTPS URL
- [x] Webhook URL معروض في Settings
- [x] Webhook مُعد في Shopify
- [x] Orders تظهر في CRM عند الإنشاء
- [x] Real-time updates تعمل
- [x] Customers يتم إنشاؤهم تلقائياً

### 🎯 النتيجة المتوقعة:
```
عميل يعمل Order في Shopify
    ↓
يظهر فوراً في CRM Orders page
    ↓
بدون أي تدخل يدوي! ✅
```

---

## الدعم

### إذا واجهت مشكلة:

1. **راجع هذه القائمة** - تأكد من إكمال كل الخطوات
2. **شوف الـ logs** - Backend, ngrok, Shopify
3. **اختبر كل جزء** - Backend, Frontend, ngrok, Webhook
4. **راجع الملفات المرجعية** - الدليل الكامل والشرح التفصيلي

---

## ملاحظات مهمة

⚠️ **ngrok URL يتغير** - كل مرة تشغل ngrok، انسخ URL جديد وحدثه في Shopify

✅ **للـ Production** - استخدم domain حقيقي، لن تحتاج ngrok

🔒 **الأمان** - كل مستخدم له userId خاص، Orders تذهب للمستخدم الصحيح

⚡ **Real-time** - Orders تظهر فوراً بدون refresh

---

**كل شيء جاهز! ابدأ الآن! 🚀**

