# 🔐 دليل Webhook الفريد لكل مستخدم

## ✨ الميزة الجديدة

الآن كل مستخدم عنده **Webhook URL فريد خاص بيه** - مختلف تماماً عن باقي المستخدمين!

### 🎯 المشكلة القديمة
- كل المستخدمين كانوا بيستخدموا نفس الـ URL مع userId في الـ payload
- صعب تتبع أي رسالة جاية من أي متجر
- احتمال الرسائل تتخلط بين المستخدمين

### ✅ الحل الجديد
- كل user عنده **Webhook Token** فريد (مثال: `whk_a1b2c3d4e5f6g7h8`)
- الـ URL بيكون: `https://backend.com/api/webhook/incoming/whk_xxxxxxxxxxxxxxxx`
- مستحيل الرسائل تتخلط لأن كل واحد عنده token مختلف!

---

## 📋 كيفية الاستخدام

### 1️⃣ الحصول على Webhook URL الخاص بك

#### من صفحة Settings:
1. افتح صفحة **Settings** في الـ CRM
2. هتلاقي قسم "WhatsApp Integration"
3. هتلاقي الـ URL الفريد بتاعك معروض
4. اضغط **Copy** عشان تنسخه

#### من API مباشرة:
```bash
GET /api/settings/webhook-token
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "webhookToken": "whk_a1b2c3d4e5f6g7h8",
  "webhookUrl": "https://backend-production-8d86c.up.railway.app/api/webhook/incoming/whk_a1b2c3d4e5f6g7h8",
  "instructions": "Use this URL to receive WhatsApp messages. Each user has a unique webhook URL."
}
```

---

### 2️⃣ استخدام الـ Webhook URL

#### في n8n:
1. أضف **HTTP Request Node**
2. Method: `POST`
3. URL: الصق الـ webhook URL بتاعك
4. Body:
```json
{
  "phoneNumber": "{{$json.from}}",
  "content": "{{$json.body}}",
  "customerName": "{{$json.name}}",
  "type": "text"
}
```

#### في أي Integration تانية:
```bash
POST https://backend-production-8d86c.up.railway.app/api/webhook/incoming/whk_xxxxxxxxxxxxxxxx
Content-Type: application/json

{
  "phoneNumber": "+201234567890",
  "content": "Hello from customer",
  "customerName": "Ahmed",
  "type": "text"
}
```

---

### 3️⃣ إعادة توليد Token (Regenerate)

لو حصل أي مشكلة أمنية أو عايز token جديد:

#### من صفحة Settings:
1. اضغط على زر **🔄 Regenerate Token**
2. هيظهرلك تحذير إن الـ URL القديم مش هيشتغل تاني
3. اضغط **OK** للتأكيد
4. انسخ الـ URL الجديد وحدّث كل الـ integrations بتاعتك

#### من API:
```bash
POST /api/settings/webhook-token/regenerate
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "message": "Webhook token regenerated successfully",
  "webhookToken": "whk_z9y8x7w6v5u4t3s2",
  "webhookUrl": "https://backend-production-8d86c.up.railway.app/api/webhook/incoming/whk_z9y8x7w6v5u4t3s2",
  "warning": "Old webhook URL will no longer work. Update your integrations."
}
```

⚠️ **تحذير:** الـ token القديم هيتلغي فوراً ومش هيشتغل تاني!

---

## 🔒 الأمان

### مميزات الأمان:
- ✅ كل token فريد ومش ممكن يتخمن
- ✅ الـ token بيتخزن في الـ database بشكل آمن
- ✅ مفيش طريقة تعرف token user تاني
- ✅ ممكن تعمل regenerate للـ token في أي وقت

### Best Practices:
- 🔐 متشاركش الـ webhook URL مع حد
- 🔄 لو شككت إن حد عرف الـ URL، اعمل regenerate فوراً
- 📝 احفظ الـ URL في مكان آمن (Password Manager)
- 🚫 متحطش الـ URL في أي مكان عام (GitHub, etc.)

---

## 🆕 دعم الرسائل الصوتية (Voice Messages)

تم إضافة دعم كامل للرسائل الصوتية في الـ Database Schema:

### حقول جديدة في Message Model:
```prisma
model Message {
  id          String   @id @default(uuid())
  content     String
  type        String   @default("text") // text, image, voice, button
  direction   String   // incoming, outgoing
  imageUrl    String?
  voiceUrl    String?  // 🆕 URL للرسالة الصوتية
  duration    Int?     // 🆕 مدة الرسالة بالثواني
  customerId  String
  createdAt   DateTime @default(now())
  
  customer    Customer @relation(fields: [customerId], references: [id])
}
```

### إرسال رسالة صوتية:
```json
POST /api/webhook/incoming/whk_xxxxxxxxxxxxxxxx
Content-Type: application/json

{
  "phoneNumber": "+201234567890",
  "content": "Voice message",
  "type": "voice",
  "voiceUrl": "https://example.com/voice/message.mp3",
  "duration": 15
}
```

---

## 🔄 Backward Compatibility (التوافق مع الإصدارات القديمة)

النظام لسه بيدعم الطريقة القديمة للتوافق:

### الطريقة القديمة (لسه شغالة):
```bash
POST /api/webhook/incoming/:userId
```

### الطريقة الجديدة (موصى بها):
```bash
POST /api/webhook/incoming/:webhookToken
```

⚠️ **ملحوظة:** الطريقة القديمة هتفضل شغالة، بس الطريقة الجديدة أأمن وأفضل!

---

## 📊 مثال عملي كامل

### السيناريو:
عندك 3 متاجر Shopify مختلفة، كل واحد عايز يبعت رسائل WhatsApp لـ CRM منفصل.

### الحل:
1. **المتجر الأول:**
   - User: `user1@example.com`
   - Token: `whk_abc123def456ghi7`
   - URL: `https://backend.com/api/webhook/incoming/whk_abc123def456ghi7`

2. **المتجر الثاني:**
   - User: `user2@example.com`
   - Token: `whk_xyz789uvw012rst3`
   - URL: `https://backend.com/api/webhook/incoming/whk_xyz789uvw012rst3`

3. **المتجر الثالث:**
   - User: `user3@example.com`
   - Token: `whk_mno456pqr789stu0`
   - URL: `https://backend.com/api/webhook/incoming/whk_mno456pqr789stu0`

### النتيجة:
- ✅ كل متجر بيبعت رسائل على الـ URL الخاص بيه
- ✅ مستحيل الرسائل تتخلط
- ✅ كل user شايف رسائل عملائه بس
- ✅ أمان عالي جداً

---

## 🚀 الخطوات التالية

### للـ Backend (Railway):
1. ✅ الـ schema اتحدث بنجاح
2. ✅ الـ endpoints الجديدة شغالة
3. ⏳ هيتم الـ deploy تلقائياً من GitHub

### للـ Frontend (Vercel):
1. ✅ صفحة Settings اتحدثت
2. ✅ بتعرض الـ webhook token
3. ⏳ هيتم الـ deploy تلقائياً من GitHub

### للمستخدمين:
1. 🔄 سجل دخول للـ CRM
2. 📋 افتح Settings
3. 📝 انسخ الـ webhook URL الجديد
4. 🔗 حدّث الـ integrations بتاعتك (n8n, Zapier, etc.)

---

## ❓ الأسئلة الشائعة

### س: هل لازم أحدّث الـ integrations بتاعتي؟
**ج:** لأ، الطريقة القديمة لسه شغالة. بس الطريقة الجديدة أأمن وأفضل.

### س: إيه الفرق بين الطريقة القديمة والجديدة؟
**ج:** 
- **القديمة:** `POST /api/webhook/incoming/:userId` (userId واضح في الـ URL)
- **الجديدة:** `POST /api/webhook/incoming/:token` (token مشفر ومش ممكن يتخمن)

### س: لو عملت regenerate للـ token، إيه اللي هيحصل؟
**ج:** الـ URL القديم هيتلغي فوراً ومش هيشتغل. لازم تحدّث كل الـ integrations بالـ URL الجديد.

### س: ممكن أشوف tokens المستخدمين التانيين؟
**ج:** لأ، كل user بيشوف الـ token بتاعه بس. حتى الـ Admin مش ممكن يشوف tokens المستخدمين.

### س: الرسائل الصوتية هتشتغل إزاي؟
**ج:** لسه تحت التطوير. الـ database جاهز، بس الـ UI والـ upload functionality لسه بيتعملوا.

---

## 📞 الدعم الفني

لو عندك أي مشكلة أو استفسار:
- 📧 Email: support@example.com
- 💬 WhatsApp: +20 XXX XXX XXXX
- 🐛 GitHub Issues: https://github.com/m0hammeda7mednasr-eng/crc2/issues

---

**آخر تحديث:** 21 فبراير 2026
**الإصدار:** 2.0.0
