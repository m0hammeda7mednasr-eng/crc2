# n8n Workflows - جاهزة للاستيراد

## الملفات

1. **1-shopify-to-crm.json** - استقبال Orders من Shopify
2. **2-whatsapp-to-crm.json** - استقبال رسائل WhatsApp
3. **3-button-handler.json** - معالجة ضغط الأزرار

---

## كيفية الاستيراد

### 1. افتح n8n
```bash
npx n8n
# أو
n8n
```

### 2. استورد الـ Workflows

1. في n8n، اضغط على **Workflows** في القائمة الجانبية
2. اضغط **Import from File**
3. اختار الملف (مثلاً `1-shopify-to-crm.json`)
4. اضغط **Import**
5. كرر العملية للملفات الثلاثة

---

## الإعدادات المطلوبة

### Environment Variables في n8n

اضغط **Settings** → **Environment Variables** وأضف:

```env
# Shopify
SHOPIFY_SHOP=your-store
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxx

# WhatsApp API
WHATSAPP_API_URL=http://your-whatsapp-api.com/send
WHATSAPP_API_KEY=your-api-key

# CRM
CRM_USER_ID=your-user-id-from-crm
CRM_BACKEND_URL=http://localhost:5000
```

### Credentials المطلوبة

#### 1. Shopify Account
- Type: **Shopify**
- Shop Subdomain: `your-store`
- Access Token: من Shopify Admin

#### 2. WhatsApp API Key
- Type: **Header Auth**
- Name: `apikey` (أو حسب الـ API)
- Value: `your-api-key`

#### 3. Shopify Access Token (للـ fulfillment/cancel)
- Type: **Header Auth**
- Name: `X-Shopify-Access-Token`
- Value: `shpat_xxxxxxxxxxxxx`

---

## تعديل الـ Workflows

### في Workflow 1 (Shopify to CRM):

**Node: Send to CRM**
- غير `YOUR_USER_ID_HERE` بالـ User ID بتاعك من CRM Settings

### في Workflow 2 (WhatsApp to CRM):

**Node: Send to CRM**
- تأكد إن الـ URL فيه User ID الصحيح
- أو استخدم Environment Variable: `{{ $env.CRM_USER_ID }}`

### في Workflow 3 (Button Handler):

**Nodes: Fulfill Order & Cancel Order**
- تأكد إن Shopify credentials صحيحة
- تأكد إن الـ shop domain صحيح

---

## اختبار الـ Workflows

### Test Workflow 1:
1. افتح الـ workflow
2. اضغط **Execute Workflow**
3. أنشئ order تجريبي في Shopify
4. تأكد إن الأوردر ظهر في CRM

### Test Workflow 2:
1. افتح الـ workflow
2. اضغط **Execute Workflow**
3. انسخ الـ Webhook URL
4. استخدمه في WhatsApp API
5. ابعت رسالة تجريبية

### Test Workflow 3:
1. افتح الـ workflow
2. اضغط **Execute Workflow**
3. اضغط زر في رسالة واتساب
4. تأكد إن الإجراء تم في Shopify والـ CRM

---

## الـ Webhook URLs

بعد تشغيل الـ workflows، هتحصل على URLs:

### Workflow 2 (WhatsApp):
```
http://localhost:5678/webhook/whatsapp-incoming
```
استخدمه في WhatsApp API webhook settings

### Workflow 3 (Button Handler):
```
http://localhost:5678/webhook/button-response
```
استخدمه لمعالجة ضغط الأزرار

---

## Production Setup

### استخدام ngrok:

```bash
# Terminal 1: n8n
n8n

# Terminal 2: ngrok
ngrok http 5678
```

بعدين:
1. انسخ الـ ngrok URL
2. حدث الـ webhook URLs في WhatsApp API
3. حدث الـ CRM URLs في الـ workflows

---

## الدعم

لو عندك مشكلة:
1. شوف **Executions** tab في n8n
2. شوف الـ error details
3. تأكد إن كل الـ credentials صحيحة
4. تأكد إن الـ URLs صحيحة

---

## ملاحظات مهمة

1. ✅ الـ workflows دي جاهزة للاستخدام مباشرة
2. ✅ بس محتاجة تعديل الـ credentials والـ URLs
3. ✅ اتأكد إن الـ CRM backend شغال
4. ✅ اتأكد إن WhatsApp API شغال
5. ✅ جرب كل workflow لوحده الأول

---

يلا بينا! 🚀
