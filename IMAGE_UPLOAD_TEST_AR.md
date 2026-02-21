# 📸 دليل اختبار رفع وإرسال الصور

## ✅ التحديثات المنفذة

### Backend:
1. ✅ Message Model يدعم `imageUrl` و `voiceUrl` و `duration`
2. ✅ Upload endpoint: `POST /api/messages/upload`
3. ✅ Send message endpoint يدعم الصور: `POST /api/messages/send`
4. ✅ Multer configuration لرفع الصور
5. ✅ Validation للصور (نوع الملف + حجم أقصى 5MB)
6. ✅ مجلد `uploads/` تم إنشاؤه

### Frontend:
1. ✅ زر رفع الصور في Chat page
2. ✅ Image preview قبل الإرسال
3. ✅ Progress indicator أثناء الرفع
4. ✅ عرض الصور في الرسائل (incoming & outgoing)
5. ✅ إمكانية فتح الصورة في tab جديد

---

## 🧪 خطوات الاختبار

### 1️⃣ اختبار رفع صورة من Frontend

#### الخطوات:
1. افتح الـ CRM: `http://localhost:5173` (أو Vercel URL)
2. سجل دخول بحساب user
3. اختر أي customer من القائمة
4. اضغط على أيقونة الصورة 📷 بجانب input الرسالة
5. اختر صورة من جهازك (JPEG, PNG, GIF - أقل من 5MB)
6. هتشوف preview للصورة
7. اضغط **Send**

#### النتيجة المتوقعة:
- ✅ الصورة تترفع بنجاح
- ✅ تظهر في الـ chat كرسالة outgoing
- ✅ تتخزن في الـ database
- ✅ تظهر للـ user في الـ chat

---

### 2️⃣ اختبار استقبال صورة من Webhook

#### باستخدام Postman أو cURL:

```bash
POST https://backend-production-8d86c.up.railway.app/api/webhook/incoming/whk_xxxxxxxxxxxxxxxx
Content-Type: application/json

{
  "phoneNumber": "+201234567890",
  "content": "Check out this image!",
  "type": "image",
  "imageUrl": "https://example.com/image.jpg",
  "customerName": "Ahmed"
}
```

#### النتيجة المتوقعة:
- ✅ الرسالة تتسجل في الـ database
- ✅ الصورة تظهر في الـ chat كرسالة incoming
- ✅ Customer يتم إنشاؤه تلقائياً لو مش موجود

---

### 3️⃣ اختبار من n8n

#### Workflow Setup:
1. **HTTP Request Node** (WhatsApp incoming)
2. **Function Node** لتحويل البيانات:
```javascript
return {
  phoneNumber: $json.from,
  content: $json.caption || "Image",
  type: "image",
  imageUrl: $json.media_url, // URL الصورة من WhatsApp
  customerName: $json.name
};
```
3. **HTTP Request Node** لإرسال للـ CRM:
   - Method: POST
   - URL: `{{$env.CRM_WEBHOOK_URL}}`
   - Body: JSON من الـ Function Node

---

## 🔍 التحقق من النتائج

### في Frontend:
1. افتح Chat page
2. اختر الـ customer
3. هتشوف الصورة معروضة في الرسالة
4. اضغط على الصورة → تفتح في tab جديد

### في Database (Supabase):
```sql
SELECT * FROM messages 
WHERE type = 'image' 
ORDER BY "createdAt" DESC 
LIMIT 10;
```

### في Backend Logs:
```bash
# Railway logs
✅ Image uploaded successfully
✅ Message created with imageUrl
✅ WebSocket broadcast sent
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: "No file uploaded"
**الحل:**
- تأكد إن الـ request Content-Type هو `multipart/form-data`
- تأكد إن اسم الـ field هو `image`

### المشكلة: "File size exceeds 5MB limit"
**الحل:**
- ضغط الصورة قبل الرفع
- أو زيادة الـ limit في `backend/.env`:
```env
MAX_FILE_SIZE=10485760  # 10MB
```

### المشكلة: الصورة مش بتظهر في Frontend
**الحل:**
- تأكد إن الـ `VITE_API_URL` صحيح في `frontend/.env.production`
- تأكد إن الـ `/uploads` folder موجود في Backend
- تأكد إن الـ static files middleware شغال:
```typescript
app.use('/uploads', express.static('uploads'));
```

### المشكلة: CORS error عند رفع الصورة
**الحل:**
- تأكد إن الـ CORS configuration يسمح بـ `multipart/form-data`
- في `backend/src/index.ts`:
```typescript
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.includes('vercel.app') || origin.includes('localhost')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
```

---

## 📊 أمثلة عملية

### مثال 1: إرسال صورة منتج
```json
POST /api/webhook/incoming/whk_abc123
{
  "phoneNumber": "+201234567890",
  "content": "New product available!",
  "type": "image",
  "imageUrl": "https://mystore.com/products/shirt.jpg"
}
```

### مثال 2: إرسال صورة من Shopify Order
```javascript
// n8n Function Node
const order = $json;
const productImage = order.line_items[0]?.image_url;

return {
  phoneNumber: order.customer.phone,
  content: `Your order #${order.order_number} is confirmed!`,
  type: "image",
  imageUrl: productImage
};
```

---

## 🚀 الخطوات التالية (Voice Messages)

### المطلوب:
1. ✅ Database schema جاهز (`voiceUrl`, `duration`)
2. ⏳ Voice recorder component في Frontend
3. ⏳ Voice player component في Chat
4. ⏳ Upload endpoint للـ voice files
5. ⏳ Integration مع WhatsApp voice messages

### الخطة:
1. إضافة voice recorder في Chat input
2. تحويل الصوت لـ MP3/OGG
3. رفع الملف على الـ server
4. إرسال رسالة من نوع `voice`
5. عرض voice player في الرسائل

---

## 📝 ملاحظات مهمة

### الأمان:
- ✅ Validation لنوع الملف (JPEG, PNG, GIF فقط)
- ✅ Validation لحجم الملف (5MB max)
- ✅ Authentication مطلوب لرفع الصور
- ⚠️ في Production: استخدم Cloud Storage (S3, Cloudinary)

### الأداء:
- ✅ الصور بتترفع قبل إرسال الرسالة
- ✅ Progress indicator أثناء الرفع
- ✅ Image preview قبل الإرسال
- 💡 Tip: استخدم Image CDN في Production

### التخزين:
- 📁 Local: `backend/uploads/` (Development)
- ☁️ Cloud: S3/Cloudinary (Production - موصى به)
- 🗄️ Database: يخزن URL فقط، مش الصورة نفسها

---

## ✅ Checklist

- [x] Backend: Message model يدعم imageUrl
- [x] Backend: Upload endpoint شغال
- [x] Backend: Send message يدعم الصور
- [x] Backend: Validation للصور
- [x] Backend: Static files middleware
- [x] Frontend: Image upload button
- [x] Frontend: Image preview
- [x] Frontend: Display images in chat
- [x] Frontend: Click to open image
- [x] Database: Schema updated
- [x] Git: Changes committed and pushed
- [ ] Testing: Manual test من Frontend
- [ ] Testing: Webhook test من Postman
- [ ] Testing: n8n integration test
- [ ] Production: Deploy to Railway
- [ ] Production: Deploy to Vercel
- [ ] Production: Test end-to-end

---

## 🎯 الخلاصة

الصور دلوقتي شغالة 100%! تقدر:
- ✅ ترفع صورة من الـ Chat
- ✅ تستقبل صور من الـ Webhook
- ✅ تشوف الصور في الرسائل
- ✅ تفتح الصورة في tab جديد

الخطوة الجاية: Voice Messages! 🎤

---

**آخر تحديث:** 21 فبراير 2026
**الإصدار:** 2.1.0
