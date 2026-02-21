# 📱 خطة دعم الوسائط المتعددة (صور + صوت)

## 🎯 المطلوب:

### 1. Webhook URL مختلف لكل Store ✅
**الوضع الحالي:** موجود بالفعل!
```
https://backend-production-8d86c.up.railway.app/api/webhook/incoming/{userId}
```

كل user له URL خاص بيه، فالرسائل مش هتتخلط! ✅

---

### 2. استقبال وإرسال الصور 🖼️

**الوضع الحالي:**
- ✅ Backend يقدر يستقبل صور
- ✅ Frontend فيه Upload Image button
- ✅ Database بيحفظ `imageUrl`

**المطلوب:**
- ✅ تحسين معالجة الصور
- ✅ دعم أنواع صور أكتر
- ✅ Thumbnail generation (اختياري)

---

### 3. استقبال وإرسال Voice Messages 🎤

**الوضع الحالي:**
- ❌ مش موجود

**المطلوب:**
- ✅ إضافة دعم Voice Messages
- ✅ Upload voice files
- ✅ Play voice في الـ Chat
- ✅ حفظ voice في Database

---

## 📋 خطة التنفيذ:

### المرحلة 1: تحسين دعم الصور (30 دقيقة)
1. ✅ تحديث Message Model لدعم أنواع media مختلفة
2. ✅ تحسين Image Upload في Frontend
3. ✅ عرض الصور في Chat بشكل أفضل

### المرحلة 2: إضافة دعم Voice (45 دقيقة)
1. ✅ إضافة Voice Recording في Frontend
2. ✅ Upload Voice Files للـ Backend
3. ✅ حفظ Voice في Database
4. ✅ Play Voice في Chat

### المرحلة 3: اختبار شامل (15 دقيقة)
1. ✅ اختبار إرسال صور
2. ✅ اختبار إرسال voice
3. ✅ اختبار استقبال من WhatsApp

---

## 🔧 التعديلات المطلوبة:

### 1. Database Schema:
```prisma
model Message {
  id          String   @id @default(uuid())
  customerId  String
  content     String
  type        String   // text, image, voice, video
  direction   String   // incoming, outgoing
  imageUrl    String?  // للصور
  voiceUrl    String?  // للصوت (جديد)
  duration    Int?     // مدة الصوت بالثواني (جديد)
  createdAt   DateTime @default(now())
  customer    Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
}
```

### 2. Backend API:
```typescript
// Upload Voice
POST /api/messages/upload-voice
Body: FormData with voice file

// Send Message with Media
POST /api/messages/send
Body: {
  customerId: string,
  content: string,
  type: 'text' | 'image' | 'voice',
  mediaUrl?: string
}
```

### 3. Frontend Components:
```typescript
// Voice Recorder Component
<VoiceRecorder onRecordComplete={(audioBlob) => uploadVoice(audioBlob)} />

// Voice Player Component
<VoicePlayer voiceUrl={message.voiceUrl} duration={message.duration} />

// Image Viewer Component
<ImageViewer imageUrl={message.imageUrl} />
```

---

## 🎯 الخطوة التالية:

**عايز نبدأ بإيه؟**

1. **تحسين دعم الصور** (سريع - 30 دقيقة)
2. **إضافة Voice Messages** (متوسط - 45 دقيقة)
3. **الاتنين مع بعض** (ساعة ونص)

---

## 📊 ملاحظات مهمة:

### Webhook URLs (موجود بالفعل):
```
User 1: https://backend.../api/webhook/incoming/user-id-1
User 2: https://backend.../api/webhook/incoming/user-id-2
User 3: https://backend.../api/webhook/incoming/user-id-3
```

كل user له URL خاص، فالرسائل **مش هتتخلط أبداً**! ✅

### Media Storage:
- **الصور:** هنحفظها في `/uploads/images/`
- **الصوت:** هنحفظها في `/uploads/voice/`
- **أو نستخدم Cloud Storage** (Cloudinary, AWS S3) للـ production

---

## 🚀 جاهز نبدأ؟

قولي عايز نبدأ بإيه وأنا هبدأ أكتب الكود! 💪
