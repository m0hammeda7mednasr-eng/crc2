# 👑 Admin Dashboard Setup

## ✅ تم التنفيذ

تم إضافة نظام Admin Dashboard الأساسي للـ CRM!

---

## 🔐 بيانات تسجيل الدخول للـ Admin

```
Email: admin@crm.com
Password: Admin@123456
```

**ملاحظة:** غيّر هذه البيانات في الإنتاج!

---

## 🎯 المميزات المتاحة

### 1. Admin Dashboard
- عرض إحصائيات النظام
- إجمالي المستخدمين
- إجمالي العملاء
- إجمالي الطلبات
- إجمالي الرسائل

### 2. User Management
- عرض جميع المستخدمين
- البحث عن المستخدمين
- عرض تفاصيل كل مستخدم
- حذف المستخدمين (ما عدا الـ Admin)

### 3. Role-Based Access Control (RBAC)
- دور Admin: وصول كامل للـ Admin Dashboard
- دور User: وصول عادي للـ CRM فقط

---

## 📂 الملفات المضافة

### Backend:
- `backend/prisma/schema.prisma` - أضيف `role` للـ User model
- `backend/src/middleware/admin.middleware.ts` - التحقق من صلاحيات Admin
- `backend/src/controllers/admin.controller.ts` - Admin endpoints
- `backend/src/routes/admin.routes.ts` - Admin routes
- `backend/create-admin.js` - Script لإنشاء Admin user

### Frontend:
- `frontend/src/pages/AdminDashboard.tsx` - صفحة Admin الرئيسية
- `frontend/src/pages/AdminUsers.tsx` - صفحة إدارة المستخدمين

---

## 🚀 كيفية الاستخدام

### 1. إنشاء Admin User (تم بالفعل)

```bash
cd backend
node create-admin.js
```

### 2. تسجيل الدخول كـ Admin

1. افتح: http://localhost:3000/login
2. أدخل:
   - Email: `admin@crm.com`
   - Password: `Admin@123456`
3. اضغط Login

### 3. الوصول للـ Admin Dashboard

بعد تسجيل الدخول، ستجد في القائمة الجانبية:
- 👑 **Admin Panel** (فقط للـ Admin)

اضغط عليه للدخول إلى Admin Dashboard!

---

## 🔒 الحماية

### Backend Protection:
```typescript
// كل admin routes محمية بـ:
router.use(authenticate);  // تحقق من تسجيل الدخول
router.use(verifyAdmin);   // تحقق من دور Admin
```

### Frontend Protection:
```typescript
// AdminRoute component يتحقق من:
- المستخدم مسجل دخول
- المستخدم له دور admin
- إذا لا، يتم التحويل للـ dashboard العادي
```

---

## 📊 API Endpoints

### Admin Endpoints:

```
GET  /api/admin/stats        - إحصائيات النظام
GET  /api/admin/users        - جميع المستخدمين
GET  /api/admin/users/:id    - تفاصيل مستخدم
DELETE /api/admin/users/:id  - حذف مستخدم
```

**ملاحظة:** كل الـ endpoints تحتاج:
- Authorization header مع JWT token
- User role = admin

---

## 🎨 الواجهة

### Admin Dashboard:
- 4 بطاقات إحصائيات ملونة
- Quick Actions للوصول السريع
- تصميم modern مع gradients

### User Management:
- جدول بجميع المستخدمين
- بحث بالـ email
- عرض عدد العملاء والطلبات لكل مستخدم
- أزرار View و Delete

---

## 🔄 التحديثات على النظام الحالي

### 1. Database Schema:
```prisma
model User {
  role String @default("user") // user, admin
  // ... باقي الحقول
}
```

### 2. JWT Token:
```typescript
// الآن يحتوي على role
{ userId, email, role }
```

### 3. Auth Response:
```typescript
{
  user: {
    id, email, role, ...
  },
  token
}
```

---

## 🧪 الاختبار

### 1. اختبار Admin Login:
```bash
# في المتصفح
1. افتح http://localhost:3000/login
2. سجل دخول بـ admin@crm.com / Admin@123456
3. يجب أن تشاهد "Admin Panel" في القائمة
```

### 2. اختبار User Login:
```bash
# سجل حساب عادي
1. افتح http://localhost:3000/register
2. سجل حساب جديد
3. لن تشاهد "Admin Panel" في القائمة
```

### 3. اختبار Admin API:
```bash
# بعد تسجيل دخول Admin، احصل على token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/admin/stats
```

---

## 📝 ملاحظات مهمة

### 1. الأمان:
- ✅ كل admin endpoints محمية
- ✅ JWT يحتوي على role
- ✅ Frontend يتحقق من role
- ⚠️ غيّر ADMIN_PASSWORD في الإنتاج!

### 2. البيانات:
- حذف user يحذف كل بياناته (customers, orders, messages)
- لا يمكن حذف admin users
- Admin user لا يظهر في قائمة المستخدمين القابلين للحذف

### 3. التوسع المستقبلي:
- يمكن إضافة subscription management
- يمكن إضافة analytics متقدمة
- يمكن إضافة multi-platform integration
- يمكن إضافة audit logs

---

## 🎉 الخطوات التالية

الآن يمكنك:
1. ✅ تسجيل دخول كـ Admin
2. ✅ عرض إحصائيات النظام
3. ✅ إدارة المستخدمين
4. ✅ حذف المستخدمين

**للتوسع:**
- أضف subscription plans
- أضف payment integration
- أضف advanced analytics
- أضف audit logging

---

## 🆘 المساعدة

### المشكلة: لا أرى "Admin Panel"
**الحل:**
1. تأكد من تسجيل الدخول بـ admin@crm.com
2. امسح localStorage وسجل دخول مرة أخرى
3. تحقق من Console للأخطاء

### المشكلة: 403 Forbidden عند الوصول لـ admin endpoints
**الحل:**
1. تأكد من أن token صحيح
2. تأكد من أن user له role = admin
3. تحقق من Backend logs

### المشكلة: Admin user غير موجود
**الحل:**
```bash
cd backend
node create-admin.js
```

---

**استمتع بالـ Admin Dashboard! 👑**
