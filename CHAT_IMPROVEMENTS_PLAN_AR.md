# 💬 خطة تحسين Chat System

## ✅ التحسينات المطلوبة:

### 1. 🔄 Order Integration (مش يعمل chat جديد)
**المشكلة الحالية:**
- لما يجي order من Shopify، بيعمل chat جديد حتى لو العميل عنده chat موجود

**الحل:**
- لما يجي order، يدور على الرقم في الـ customers الموجودين
- لو موجود، يضيف الـ order للـ customer الموجود
- لو مش موجود، يعمل customer جديد

**الملفات المطلوب تعديلها:**
- `backend/src/services/order.service.ts` - منطق إنشاء الـ orders
- `backend/src/controllers/webhook.controller.ts` - معالجة Shopify webhooks

---

### 2. 📊 Chat Sorting (آخر رسالة فوق)
**المشكلة الحالية:**
- الـ chats مش مترتبة حسب آخر رسالة

**الحل:**
- ترتيب الـ customers حسب `updatedAt` (آخر تحديث)
- Real-time update لما تيجي رسالة جديدة
- الـ chat اللي فيه آخر رسالة يكون أول واحد

**الملفات المطلوب تعديلها:**
- `backend/src/services/customer.service.ts` - إضافة sorting
- `frontend/src/pages/Customers.tsx` - عرض الـ customers مرتبين

---

### 3. 🔔 Unread Messages Indicator
**المشكلة الحالية:**
- مفيش طريقة تعرف إن فيه رسائل مقروءة ولا لا

**الحل:**
- إضافة `unreadCount` field للـ Customer model
- لما تيجي رسالة جديدة، يزيد الـ counter
- لما تفتح الـ chat، يصفر الـ counter
- عرض badge بعدد الرسائل غير المقروءة
- تغيير لون الـ chat للـ unread

**الملفات المطلوب تعديلها:**
- `backend/prisma/schema.prisma` - إضافة `unreadCount`
- `backend/src/services/message.service.ts` - تحديث الـ counter
- `frontend/src/pages/Customers.tsx` - عرض الـ badge
- `frontend/src/pages/Chat.tsx` - تصفير الـ counter

---

### 4. ✓✓ WhatsApp Status Indicators
**المشكلة الحالية:**
- مفيش علامات توضح حالة الرسالة

**الحل:**
- إضافة `status` field للـ Message model:
  - `sent` = علامة واحدة رمادي (✓)
  - `delivered` = علامتين رمادي (✓✓)
  - `read` = علامتين أزرق (✓✓)
- عرض العلامات في الـ chat

**الملفات المطلوب تعديلها:**
- `backend/prisma/schema.prisma` - إضافة `status` enum
- `backend/src/services/message.service.ts` - تحديث الـ status
- `frontend/src/pages/Chat.tsx` - عرض العلامات

---

### 5. 👤 Customer Profile Enhancement
**المشكلة الحالية:**
- مفيش صورة profile للعميل
- البيانات مش واضحة

**الحل:**
- إضافة `profileImage` field للـ Customer
- استخدام avatar placeholder لو مفيش صورة
- عرض بيانات العميل بشكل أفضل:
  - الاسم
  - رقم الهاتف
  - عدد الـ orders
  - آخر order
  - Total spent

**الملفات المطلوب تعديلها:**
- `backend/prisma/schema.prisma` - إضافة `profileImage`
- `frontend/src/pages/Customers.tsx` - عرض الصورة
- `frontend/src/pages/Chat.tsx` - عرض profile في الـ header

---

## 📝 خطة التنفيذ:

### المرحلة 1: Database Schema Updates
1. إضافة `unreadCount` للـ Customer
2. إضافة `status` enum للـ Message
3. إضافة `profileImage` للـ Customer
4. عمل migration

### المرحلة 2: Backend Updates
1. تحديث Order service (مش يعمل chat جديد)
2. تحديث Message service (unread counter + status)
3. تحديث Customer service (sorting)
4. تحديث Socket events (real-time updates)

### المرحلة 3: Frontend Updates
1. تحديث Customers list (sorting + unread badge)
2. تحديث Chat page (status indicators + profile)
3. تحديث UI/UX (colors + animations)

### المرحلة 4: Testing
1. اختبار Order integration
2. اختبار Unread messages
3. اختبار Status indicators
4. اختبار Real-time updates

---

## 🎨 UI/UX Design:

### Customers List:
```
┌─────────────────────────────────────┐
│ 🔍 Search customers...              │
├─────────────────────────────────────┤
│ 👤 Ahmed Mohamed          [3] 🔴    │ ← Unread badge
│    Last: "شكراً على الطلب"          │
│    2 minutes ago                    │
├─────────────────────────────────────┤
│ 👤 Sara Ali                         │
│    Last: "تم استلام الطلب"          │
│    1 hour ago                       │
├─────────────────────────────────────┤
│ 👤 Mohamed Hassan                   │
│    Last: "Order #1234"              │
│    Yesterday                        │
└─────────────────────────────────────┘
```

### Chat Messages:
```
┌─────────────────────────────────────┐
│ 👤 Ahmed Mohamed                    │
│    +201234567890 • 3 orders         │
├─────────────────────────────────────┤
│                                     │
│  مرحباً، عاوز أطلب منتج    ⏰ 2:30 │ ← Incoming
│                                     │
│                   تمام، أي منتج؟ ⏰ 2:31 │ ← Outgoing
│                              ✓✓ 🔵 │ ← Read
│                                     │
│  المنتج رقم 123            ⏰ 2:32 │
│                                     │
│              تم إضافة الطلب #1234 ⏰ 2:33 │
│                              ✓✓ ⚪ │ ← Delivered
│                                     │
└─────────────────────────────────────┘
```

### Status Indicators:
- ⏰ = Sending (clock)
- ✓ = Sent (single check)
- ✓✓ ⚪ = Delivered (double check gray)
- ✓✓ 🔵 = Read (double check blue)

---

## 🔧 Technical Details:

### Database Schema Changes:

```prisma
model Customer {
  id            String    @id @default(cuid())
  name          String
  phone         String    @unique
  profileImage  String?   // NEW
  unreadCount   Int       @default(0) // NEW
  userId        String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt // Used for sorting
  
  messages      Message[]
  orders        Order[]
  user          User      @relation(fields: [userId], references: [id])
}

model Message {
  id          String      @id @default(cuid())
  customerId  String
  content     String
  type        String      @default("text")
  direction   String      // "incoming" or "outgoing"
  status      MessageStatus @default(sent) // NEW
  imageUrl    String?
  voiceUrl    String?
  duration    Int?
  createdAt   DateTime    @default(now())
  
  customer    Customer    @relation(fields: [customerId], references: [id])
}

enum MessageStatus {
  sending
  sent
  delivered
  read
  failed
}
```

### Socket Events:

```typescript
// New events
socket.emit('message:read', { customerId, messageIds });
socket.emit('message:delivered', { customerId, messageIds });
socket.emit('customer:updated', { customerId, unreadCount });
```

---

## 📊 Priority:

1. **High Priority:**
   - Order integration (مش يعمل chat جديد) ⭐⭐⭐
   - Chat sorting (آخر رسالة فوق) ⭐⭐⭐
   - Unread messages indicator ⭐⭐⭐

2. **Medium Priority:**
   - WhatsApp status indicators ⭐⭐
   - Customer profile enhancement ⭐⭐

3. **Nice to Have:**
   - Profile images
   - Advanced statistics

---

## 🚀 Next Steps:

1. موافقة على الخطة
2. بدء التنفيذ من المرحلة 1
3. Testing بعد كل مرحلة
4. Deployment تدريجي

---

**آخر تحديث:** 21 فبراير 2026 - 5:45 AM
**Status:** 📋 Planning Phase
