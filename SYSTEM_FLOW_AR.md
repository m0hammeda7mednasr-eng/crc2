# كيف يشتغل النظام - شرح مبسط 🎯

## الفكرة الأساسية

```
Shopify Order → Webhook → CRM → يظهر في Orders
```

---

## التفاصيل الكاملة

### 1️⃣ التحضير (مرة واحدة فقط)

```
المستخدم
   ↓
يشغل start-all.bat
   ↓
┌─────────────────────────────────┐
│  Backend (Port 5000)            │
│  Frontend (Port 3000)           │
│  ngrok (HTTPS Tunnel)           │
└─────────────────────────────────┘
   ↓
كل حاجة شغالة! ✅
```

---

### 2️⃣ الحصول على اللينك

```
المستخدم
   ↓
يفتح Settings في CRM
   ↓
Frontend يطلب اللينك من Backend
   ↓
GET /api/webhook/shopify/url?userId=xxx
   ↓
Backend يكتشف ngrok URL تلقائي
   ↓
يرجع اللينك الكامل:
https://abc123.ngrok-free.app/api/webhook/shopify/orders?userId=xxx
   ↓
Frontend يعرض اللينك مع زرار Copy
   ↓
المستخدم يضغط Copy 📋
```

---

### 3️⃣ الإعداد في Shopify (مرة واحدة)

```
المستخدم
   ↓
يروح Shopify Admin
   ↓
Settings → Notifications → Webhooks
   ↓
Create webhook
   ↓
Event: Order creation
Format: JSON
URL: [يلصق اللينك]
   ↓
Save ✅
   ↓
Shopify جاهز للإرسال!
```

---

### 4️⃣ عند إنشاء Order (تلقائي)

```
عميل يعمل Order في Shopify
   ↓
Shopify يرسل Webhook
   ↓
POST https://abc123.ngrok-free.app/api/webhook/shopify/orders?userId=xxx
Body: {
  id: 12345,
  order_number: 1001,
  customer: {
    first_name: "أحمد",
    last_name: "محمد",
    phone: "+201234567890"
  },
  line_items: [...],
  total_price: "150.00"
}
   ↓
ngrok يستقبل ويحول للـ Backend
   ↓
Backend (webhook.controller.ts)
   ↓
handleShopifyOrder() يعالج البيانات:
  1. يستخرج بيانات العميل
  2. يستخرج بيانات الأوردر
  3. يستخرج userId من URL
   ↓
CustomerService.findOrCreateByPhone()
  - يدور على العميل
  - لو مش موجود، يعمل customer جديد
   ↓
OrderService.createOrder()
  - يحفظ الأوردر في Database
  - يربطه بالـ customer
   ↓
SocketManager.emit('newOrder')
  - يبعت notification للـ Frontend
   ↓
Frontend يستقبل الـ notification
   ↓
Orders page تتحدث تلقائي
   ↓
المستخدم يشوف الأوردر فوراً! 🎉
```

---

## مثال عملي

### السيناريو
عميل اسمه "أحمد محمد" عمل order بـ 150 جنيه

### الخطوات

```
1. Shopify Order Created
   Order #1001
   Customer: أحمد محمد
   Phone: +201234567890
   Total: 150.00 EGP
   Items: [
     { name: "Product A", quantity: 2, price: "75.00" }
   ]

2. Shopify Sends Webhook
   POST https://abc123.ngrok-free.app/api/webhook/shopify/orders?userId=cm3xyz
   
3. Backend Receives
   [Webhook] Shopify order received: 1001
   [Webhook] Customer: أحمد محمد (+201234567890)
   [Webhook] Total: 150.00
   
4. Backend Processes
   [CustomerService] Finding customer by phone: +201234567890
   [CustomerService] Customer not found, creating new...
   [CustomerService] Customer created: ID=123
   
   [OrderService] Creating order: #1001
   [OrderService] Order created: ID=456
   
   [SocketManager] Emitting newOrder event
   
5. Frontend Updates
   [WebSocket] Received newOrder event
   [Orders Page] Adding new order to list
   [Notification] New order from أحمد محمد
   
6. User Sees
   Orders Page:
   ┌─────────────────────────────────────┐
   │ Order #1001                         │
   │ أحمد محمد                           │
   │ +201234567890                       │
   │ 150.00 EGP                          │
   │ Status: Pending                     │
   │ [View Details]                      │
   └─────────────────────────────────────┘
```

---

## كيف يكتشف Backend الـ ngrok URL؟

### الطريقة

```javascript
// في webhook.controller.ts

static async getShopifyWebhookUrl(req: Request, res: Response) {
  // ngrok يضيف headers خاصة
  const forwardedHost = req.get('x-forwarded-host');
  // مثال: "abc123.ngrok-free.app"
  
  const forwardedProto = req.get('x-forwarded-proto');
  // مثال: "https"
  
  // لو موجودين، استخدمهم
  const actualHost = forwardedHost || req.get('host');
  const actualProtocol = forwardedProto || req.protocol;
  
  // اعمل الـ URL الكامل
  const baseUrl = `${actualProtocol}://${actualHost}`;
  // النتيجة: "https://abc123.ngrok-free.app"
  
  const webhookUrl = `${baseUrl}/api/webhook/shopify/orders?userId=${userId}`;
  // النتيجة: "https://abc123.ngrok-free.app/api/webhook/shopify/orders?userId=cm3xyz"
  
  return webhookUrl;
}
```

### مثال Headers

**عند الوصول من localhost:**
```
host: localhost:5000
protocol: http
x-forwarded-host: undefined
x-forwarded-proto: undefined

Result: http://localhost:5000/api/webhook/shopify/orders?userId=xxx
```

**عند الوصول من ngrok:**
```
host: localhost:5000
protocol: http
x-forwarded-host: abc123.ngrok-free.app
x-forwarded-proto: https

Result: https://abc123.ngrok-free.app/api/webhook/shopify/orders?userId=xxx
```

---

## البيانات في Database

### Customer Table
```sql
CREATE TABLE Customer (
  id          TEXT PRIMARY KEY,
  phoneNumber TEXT NOT NULL,
  name        TEXT,
  userId      TEXT NOT NULL,
  createdAt   DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Order Table
```sql
CREATE TABLE Order (
  id            TEXT PRIMARY KEY,
  orderId       TEXT NOT NULL,
  orderNumber   TEXT NOT NULL,
  total         REAL NOT NULL,
  status        TEXT NOT NULL,
  customerName  TEXT NOT NULL,
  customerPhone TEXT NOT NULL,
  userId        TEXT NOT NULL,
  customerId    TEXT NOT NULL,
  items         TEXT,
  createdAt     DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (customerId) REFERENCES Customer(id),
  FOREIGN KEY (userId) REFERENCES User(id)
);
```

### مثال بيانات

**Customer:**
```json
{
  "id": "cust_123",
  "phoneNumber": "+201234567890",
  "name": "أحمد محمد",
  "userId": "cm3xyz",
  "createdAt": "2024-02-18T10:30:00Z"
}
```

**Order:**
```json
{
  "id": "order_456",
  "orderId": "12345",
  "orderNumber": "1001",
  "total": 150.00,
  "status": "pending",
  "customerName": "أحمد محمد",
  "customerPhone": "+201234567890",
  "userId": "cm3xyz",
  "customerId": "cust_123",
  "items": "[{\"name\":\"Product A\",\"quantity\":2,\"price\":\"75.00\"}]",
  "createdAt": "2024-02-18T10:30:00Z"
}
```

---

## Real-time Updates (WebSocket)

### كيف يشتغل

```
Backend
   ↓
OrderService.createOrder()
   ↓
socketManager.emit('newOrder', orderData)
   ↓
WebSocket Server يبعت للـ Frontend
   ↓
Frontend WebSocket Client يستقبل
   ↓
useEffect(() => {
  socket.on('newOrder', (order) => {
    setOrders(prev => [order, ...prev]);
    showNotification('New order received!');
  });
}, []);
   ↓
Orders Page تتحدث فوراً! ⚡
```

---

## الأمان

### ✅ ما تم تطبيقه

1. **User-specific URLs**
   - كل مستخدم عنده userId خاص
   - Orders تروح للمستخدم الصحيح

2. **JWT Authentication**
   - Settings page محمية
   - لازم تسجيل دخول

3. **Rate Limiting**
   - حد أقصى للـ requests
   - يمنع الـ abuse

4. **Input Validation**
   - كل البيانات بتتفحص
   - يمنع الـ injection attacks

---

## الخلاصة

### النظام يشتغل كده:

```
1. User → start-all.bat
2. User → Settings → Copy URL
3. User → Shopify → Paste URL
4. Customer → Order in Shopify
5. Shopify → Webhook → Backend
6. Backend → Process → Database
7. Backend → WebSocket → Frontend
8. Frontend → Update → User sees order! ✅
```

### كل حاجة تلقائي:
- ✅ ngrok detection
- ✅ userId extraction
- ✅ URL generation
- ✅ Customer creation
- ✅ Order saving
- ✅ Real-time updates

---

**النظام جاهز ويشتغل! 🚀**

