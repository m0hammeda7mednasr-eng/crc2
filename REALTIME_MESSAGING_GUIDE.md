# 🚀 دليل الرسائل الفورية - WhatsApp-Shopify CRM

## ✅ ما تم إنجازه

تم تفعيل نظام الرسائل الفورية بالكامل! الآن يمكنك:

### 1. إرسال واستقبال الرسائل فوراً
- عند إرسال رسالة من الواجهة → تظهر فوراً في المحادثة
- عند استقبال رسالة من webhook → تظهر فوراً بدون تحديث الصفحة

### 2. تحديثات فورية للطلبات
- عند تغيير حالة الطلب → يتحدث Dashboard فوراً
- عند إضافة طلب جديد → يظهر في قائمة الطلبات فوراً

### 3. عملاء جدد
- عند إضافة عميل جديد → يظهر في قائمة العملاء فوراً

---

## 🔗 كيفية الاستخدام

### الخطوة 1: تسجيل الدخول
1. افتح المتصفح على: http://localhost:3000
2. سجل حساب جديد أو سجل دخول
3. WebSocket سيتصل تلقائياً

### الخطوة 2: اختبار الرسائل

#### أ) إرسال رسالة من الواجهة:
1. اذهب إلى صفحة Chat
2. اختر عميل (أو أنشئ واحد جديد)
3. اكتب رسالة واضغط Send
4. ستظهر الرسالة فوراً في المحادثة

#### ب) استقبال رسالة من webhook:
استخدم أداة مثل Postman أو cURL لإرسال webhook:

```bash
curl -X POST http://localhost:5000/api/webhooks/whatsapp/incoming \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+201234567890",
    "content": "مرحبا! هذه رسالة تجريبية",
    "type": "text",
    "userId": "YOUR_USER_ID_HERE"
  }'
```

**ملاحظة**: استبدل `YOUR_USER_ID_HERE` بـ User ID الخاص بك (يمكنك الحصول عليه من localStorage في المتصفح)

---

## 📡 Webhook Endpoints

### 1. استقبال رسائل WhatsApp
```
POST http://localhost:5000/api/webhooks/whatsapp/incoming
```

**Payload:**
```json
{
  "phoneNumber": "+201234567890",
  "content": "نص الرسالة",
  "type": "text",
  "userId": "user-id",
  "customerName": "اسم العميل (اختياري)",
  "imageUrl": "رابط الصورة (اختياري)"
}
```

### 2. استجابة الأزرار
```
POST http://localhost:5000/api/webhooks/whatsapp/button
```

**Payload:**
```json
{
  "orderId": "order-id",
  "action": "Confirm",
  "phoneNumber": "+201234567890",
  "userId": "user-id"
}
```

**Actions المتاحة:**
- `Confirm` - تأكيد الطلب
- `Cancel` - إلغاء الطلب
- `Support` - طلب الدعم

### 3. مزامنة طلبات Shopify
```
POST http://localhost:5000/api/webhooks/shopify/orders
```

**Payload:**
```json
{
  "orderId": "shopify-order-123",
  "orderNumber": "#1001",
  "total": 150.50,
  "status": "pending",
  "customerPhone": "+201234567890",
  "customerName": "أحمد محمد",
  "userId": "user-id"
}
```

---

## 🔍 كيفية الحصول على User ID

### من المتصفح:
1. افتح Developer Tools (F12)
2. اذهب إلى Console
3. اكتب: `localStorage.getItem('user')`
4. انسخ قيمة `id` من الـ JSON

### أو من Application Tab:
1. افتح Developer Tools (F12)
2. اذهب إلى Application → Local Storage
3. ابحث عن `user`
4. انسخ قيمة `id`

---

## 🎯 WebSocket Events

الـ Frontend يستمع لهذه الأحداث:

### 1. `message:new`
يُطلق عند استقبال رسالة جديدة
```javascript
socketService.on('message:new', (data) => {
  console.log('رسالة جديدة:', data.message);
});
```

### 2. `customer:new`
يُطلق عند إضافة عميل جديد
```javascript
socketService.on('customer:new', (data) => {
  console.log('عميل جديد:', data.customer);
});
```

### 3. `order:update`
يُطلق عند تحديث طلب
```javascript
socketService.on('order:update', (data) => {
  console.log('تحديث طلب:', data.order);
});
```

### 4. `stats:update`
يُطلق عند تحديث إحصائيات Dashboard
```javascript
socketService.on('stats:update', (data) => {
  console.log('إحصائيات جديدة:', data);
});
```

---

## 🧪 اختبار سريع

### اختبار 1: رسالة واردة
```bash
# استبدل USER_ID بـ ID الخاص بك
curl -X POST http://localhost:5000/api/webhooks/whatsapp/incoming \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+201111111111",
    "content": "السلام عليكم",
    "type": "text",
    "userId": "USER_ID"
  }'
```

### اختبار 2: طلب جديد من Shopify
```bash
curl -X POST http://localhost:5000/api/webhooks/shopify/orders \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "shop-001",
    "orderNumber": "#1001",
    "total": 299.99,
    "status": "pending",
    "customerPhone": "+201111111111",
    "customerName": "محمد أحمد",
    "userId": "USER_ID"
  }'
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: الرسائل لا تظهر فوراً
**الحل:**
1. تأكد من أن WebSocket متصل (افتح Console وابحث عن "WebSocket connected")
2. تأكد من أن `userId` صحيح في الـ webhook
3. تحقق من أن المستخدم مسجل دخول

### المشكلة: خطأ "Unauthorized"
**الحل:**
- تأكد من أن `userId` في الـ webhook يطابق User ID المسجل دخول

### المشكلة: WebSocket لا يتصل
**الحل:**
1. تأكد من أن Backend يعمل على port 5000
2. تأكد من أن Frontend يعمل على port 3000
3. تحقق من Console للأخطاء

---

## 📊 حالة المشروع

### ✅ مكتمل:
- ✅ Authentication (تسجيل دخول/تسجيل)
- ✅ Database Schema
- ✅ Message Service
- ✅ Customer Service
- ✅ Order Service
- ✅ Dashboard Service
- ✅ WebSocket Integration
- ✅ Webhook Endpoints
- ✅ Frontend Chat UI
- ✅ Real-time Updates

### ⚠️ قيد التطوير:
- ⚠️ Property-based Tests (بعض الاختبارات)
- ⚠️ Image Upload (يعمل محلياً فقط)
- ⚠️ Settings Management (جزئياً)

---

## 🎉 الخلاصة

المشروع جاهز للاستخدام! يمكنك الآن:
1. ✅ إرسال واستقبال رسائل فورية
2. ✅ إدارة العملاء
3. ✅ تتبع الطلبات
4. ✅ مشاهدة الإحصائيات
5. ✅ استقبال webhooks من n8n و Shopify

**استمتع بالتطوير! 🚀**
