# ربط Shopify بالواتساب - الدليل الكامل

## نظرة عامة

هنربط Shopify بالواتساب عشان:
1. لما يجي Order جديد → يبعت رسالة واتساب للعميل
2. العميل يضغط "تأكيد" → Order يتعمله Fulfillment
3. العميل يضغط "إلغاء" → Order يتلغي
4. كل الرسائل تظهر في الـ CRM

## الطريقة: استخدام n8n + CRM

n8n هو automation tool هيشتغل كوسيط بين Shopify والواتساب والـ CRM.

---

## الخطوات

### 1. تثبيت n8n

```bash
# طريقة 1: باستخدام npx (الأسهل)
npx n8n

# طريقة 2: تثبيت عالمي
npm install -g n8n
n8n
```

بعد التشغيل، افتح: http://localhost:5678

---

### 2. إعداد الـ CRM

#### أ. تسجيل الدخول للـ CRM
1. افتح http://localhost:3000
2. سجل دخول بحسابك

#### ب. إعداد Shopify OAuth
1. روح على **Settings**
2. في قسم **Shopify Integration**:
   - اضغط **Configure Shopify Credentials**
   - أدخل:
     - **Shop Domain**: `your-store.myshopify.com`
     - **Client ID**: من Shopify App (API Key)
     - **Client Secret**: من Shopify App (API Secret Key)
   - اضغط **Save Credentials**
3. اضغط **Connect with Shopify**
4. هيفتح صفحة Shopify للموافقة
5. اضغط **Install app**

#### ج. نسخ Webhook URLs
في صفحة **Settings**:
1. **Incoming Webhook URL**: انسخه (هتستخدمه في n8n)
   - مثال: `http://localhost:5000/api/webhook/incoming/abc123-user-id`
2. **Outgoing Webhook URL**: هتحطه بعدين (من n8n)

---

### 3. إنشاء Shopify App

#### أ. إنشاء App جديد
1. روح على Shopify Admin
2. **Settings** → **Apps and sales channels** → **Develop apps**
3. اضغط **Create an app**
4. اسم الـ App: "WhatsApp CRM Integration"

#### ب. إعداد Permissions
1. اضغط **Configure Admin API scopes**
2. اختار:
   - `read_orders` - قراءة الأوردرات
   - `write_orders` - تعديل الأوردرات
   - `read_customers` - قراءة بيانات العملاء
   - `write_fulfillments` - إنشاء fulfillments
3. اضغط **Save**

#### ج. Install الـ App
1. اضغط **Install app**
2. انسخ:
   - **API key** (Client ID)
   - **API secret key** (Client Secret)
   - **Admin API access token**

---

### 4. إنشاء Workflow في n8n

#### Workflow 1: استقبال Orders من Shopify

```
Shopify Trigger → معالجة البيانات → إرسال للـ CRM → إرسال واتساب
```

##### الخطوات:

**1. Shopify Trigger Node**
- Node Type: **Shopify Trigger**
- Credential: أضف بيانات Shopify
  - Shop Subdomain: `your-store`
  - Access Token: من الخطوة السابقة
- Event: **Order Created**

**2. Function Node** (معالجة البيانات)
```javascript
// استخراج بيانات الأوردر
const order = $input.item.json;

// تنسيق رقم الهاتف (إزالة المسافات والرموز)
let phone = order.customer.phone || order.shipping_address?.phone || '';
phone = phone.replace(/[^0-9+]/g, '');

// تنسيق المنتجات
const items = order.line_items.map(item => 
  `• ${item.name} (${item.quantity}x) - ${item.price} ${order.currency}`
).join('\n');

return {
  orderId: order.id.toString(),
  orderNumber: order.order_number.toString(),
  customerName: `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() || 'عميل',
  customerPhone: phone,
  customerEmail: order.customer.email,
  totalPrice: order.total_price,
  currency: order.currency,
  items: items,
  shopifyOrderUrl: `https://your-store.myshopify.com/admin/orders/${order.id}`
};
```

**3. HTTP Request Node** (إرسال للـ CRM)
- Method: **POST**
- URL: `http://localhost:5000/api/webhook/shopify/orders`
- Authentication: None
- Body Content Type: **JSON**
- Body:
```json
{
  "orderId": "{{ $json.orderId }}",
  "orderNumber": "{{ $json.orderNumber }}",
  "customerName": "{{ $json.customerName }}",
  "customerPhone": "{{ $json.customerPhone }}",
  "total": "{{ $json.totalPrice }}",
  "status": "pending",
  "userId": "YOUR_USER_ID_FROM_CRM",
  "items": "{{ $json.items }}"
}
```

**4. HTTP Request Node** (إرسال رسالة واتساب)
- Method: **POST**
- URL: `YOUR_N8N_WHATSAPP_WEBHOOK` (من Evolution API أو WhatsApp Business API)
- Body:
```json
{
  "number": "{{ $json.customerPhone }}",
  "text": "مرحباً {{ $json.customerName }}! 👋\n\nتم استلام طلبك رقم #{{ $json.orderNumber }} بنجاح ✅\n\n📦 تفاصيل الطلب:\n{{ $json.items }}\n\n💰 الإجمالي: {{ $json.totalPrice }} {{ $json.currency }}\n\nهل تريد تأكيد الطلب؟",
  "options": {
    "buttons": [
      {
        "buttonId": "confirm_{{ $json.orderId }}",
        "buttonText": { "displayText": "تأكيد ✅" }
      },
      {
        "buttonId": "cancel_{{ $json.orderId }}",
        "buttonText": { "displayText": "إلغاء ❌" }
      },
      {
        "buttonId": "support_{{ $json.orderId }}",
        "buttonText": { "displayText": "تواصل معنا 💬" }
      }
    ]
  }
}
```

---

#### Workflow 2: استقبال رسائل الواتساب

```
WhatsApp Webhook → معالجة الرد → إرسال للـ CRM
```

##### الخطوات:

**1. Webhook Node**
- Webhook URLs: **Webhook**
- HTTP Method: **POST**
- Path: `whatsapp-incoming`

**2. Function Node** (معالجة الرسالة)
```javascript
const data = $input.item.json;

// استخراج البيانات حسب نوع الرسالة
let phoneNumber = '';
let content = '';
let type = 'text';

// Evolution API format
if (data.key && data.key.remoteJid) {
  phoneNumber = data.key.remoteJid.replace('@s.whatsapp.net', '');
  
  if (data.message?.conversation) {
    content = data.message.conversation;
  } else if (data.message?.extendedTextMessage) {
    content = data.message.extendedTextMessage.text;
  } else if (data.message?.buttonsResponseMessage) {
    content = data.message.buttonsResponseMessage.selectedButtonId;
    type = 'button';
  }
}

// WhatsApp Business API format
if (data.from) {
  phoneNumber = data.from;
  content = data.body || data.text?.body || '';
}

return {
  phoneNumber: phoneNumber,
  content: content,
  type: type,
  timestamp: new Date().toISOString()
};
```

**3. HTTP Request Node** (إرسال للـ CRM)
- Method: **POST**
- URL: `YOUR_INCOMING_WEBHOOK_URL` (من Settings في الـ CRM)
  - مثال: `http://localhost:5000/api/webhook/incoming/abc123-user-id`
- Body:
```json
{
  "phoneNumber": "{{ $json.phoneNumber }}",
  "content": "{{ $json.content }}",
  "type": "{{ $json.type }}"
}
```

---

#### Workflow 3: معالجة ضغط الأزرار

```
Button Click → تحديد الإجراء → Shopify API → تحديث CRM
```

##### الخطوات:

**1. استقبال الرد من Workflow 2**

**2. Switch Node** (تحديد نوع الإجراء)
- Mode: **Rules**
- Rules:
  - Rule 1: `{{ $json.content }}` starts with `confirm_`
  - Rule 2: `{{ $json.content }}` starts with `cancel_`
  - Rule 3: `{{ $json.content }}` starts with `support_`

**3. Function Node** (استخراج Order ID)
```javascript
const buttonId = $json.content;
const orderId = buttonId.split('_')[1];

return {
  orderId: orderId,
  action: buttonId.split('_')[0],
  phoneNumber: $json.phoneNumber
};
```

**4a. HTTP Request Node** (تأكيد الأوردر - Output 0)
- Method: **POST**
- URL: `https://your-store.myshopify.com/admin/api/2024-01/orders/{{ $json.orderId }}/fulfillments.json`
- Authentication: **Header Auth**
  - Name: `X-Shopify-Access-Token`
  - Value: `YOUR_SHOPIFY_ACCESS_TOKEN`
- Body:
```json
{
  "fulfillment": {
    "notify_customer": true,
    "tracking_info": {
      "company": "CRM System"
    }
  }
}
```

**4b. HTTP Request Node** (إلغاء الأوردر - Output 1)
- Method: **POST**
- URL: `https://your-store.myshopify.com/admin/api/2024-01/orders/{{ $json.orderId }}/cancel.json`
- Authentication: **Header Auth**
  - Name: `X-Shopify-Access-Token`
  - Value: `YOUR_SHOPIFY_ACCESS_TOKEN`
- Body:
```json
{
  "reason": "customer",
  "email": true
}
```

**5. HTTP Request Node** (تحديث الـ CRM)
- Method: **PUT**
- URL: `http://localhost:5000/api/orders/{{ $json.orderId }}/status`
- Body:
```json
{
  "status": "{{ $json.action === 'confirm' ? 'confirmed' : 'cancelled' }}"
}
```

**6. HTTP Request Node** (إرسال رسالة تأكيد)
- Method: **POST**
- URL: `YOUR_N8N_WHATSAPP_WEBHOOK`
- Body:
```json
{
  "number": "{{ $json.phoneNumber }}",
  "text": "{{ $json.action === 'confirm' ? 'تم تأكيد طلبك بنجاح! ✅\nسيتم شحنه قريباً 📦' : 'تم إلغاء طلبك ❌\nنتمنى خدمتك مرة أخرى' }}"
}
```

---

### 5. إعداد n8n Webhook في الـ CRM

1. روح على **Settings** في الـ CRM
2. في قسم **WhatsApp Integration**:
3. في حقل **n8n Outgoing Webhook URL**، حط:
   ```
   http://localhost:5678/webhook/send-whatsapp
   ```
4. اضغط **Save WhatsApp Settings**

---

### 6. استخدام ngrok للـ Production

```bash
# تثبيت ngrok
npm install -g ngrok

# تشغيل ngrok للـ CRM
ngrok http 5000

# تشغيل ngrok لـ n8n (في terminal تاني)
ngrok http 5678
```

بعدين:
1. انسخ الـ URL من ngrok للـ CRM
2. حدث الـ webhook URLs في n8n
3. حدث الـ redirect URL في Shopify OAuth settings

---

## البيانات المطلوبة

### من Shopify:
- ✅ Shop Domain: `your-store.myshopify.com`
- ✅ Client ID (API Key)
- ✅ Client Secret (API Secret Key)
- ✅ Admin API Access Token

### من WhatsApp:
- ✅ Evolution API URL أو WhatsApp Business API
- ✅ API Key/Token
- ✅ Instance Name (للـ Evolution API)

### من الـ CRM:
- ✅ User ID (من الـ token)
- ✅ Incoming Webhook URL
- ✅ Backend URL

---

## ملف .env للـ n8n

أضف البيانات دي في environment variables:

```env
# Shopify
SHOPIFY_SHOP=your-store
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxx

# WhatsApp (Evolution API)
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=your-api-key
EVOLUTION_INSTANCE=your-instance-name

# CRM
CRM_BACKEND_URL=http://localhost:5000
CRM_USER_ID=your-user-id-from-token
CRM_INCOMING_WEBHOOK=http://localhost:5000/api/webhook/incoming/your-user-id

# ngrok (للـ production)
NGROK_CRM_URL=https://xxxxx.ngrok.io
NGROK_N8N_URL=https://yyyyy.ngrok.io
```

---

## الاختبار

### 1. اختبار استقبال الأوردر:

```bash
# أنشئ order تجريبي في Shopify
# تأكد إن:
# ✅ الأوردر ظهر في الـ CRM (صفحة Orders)
# ✅ الرسالة وصلت على الواتساب
# ✅ الرسالة فيها أزرار (تأكيد/إلغاء)
```

### 2. اختبار التأكيد:

```bash
# اضغط زر "تأكيد ✅" في الواتساب
# تأكد إن:
# ✅ الأوردر اتعمله fulfillment في Shopify
# ✅ الـ status اتحدث في الـ CRM
# ✅ وصلت رسالة تأكيد على الواتساب
```

### 3. اختبار الإلغاء:

```bash
# اضغط زر "إلغاء ❌" في الواتساب
# تأكد إن:
# ✅ الأوردر اتلغى في Shopify
# ✅ الـ status اتحدث في الـ CRM
# ✅ وصلت رسالة إلغاء على الواتساب
```

### 4. اختبار الرسائل العادية:

```bash
# ابعت رسالة عادية من الواتساب
# تأكد إن:
# ✅ الرسالة ظهرت في صفحة Chat في الـ CRM
# ✅ تقدر ترد من الـ CRM
# ✅ الرد يوصل على الواتساب
```

---

## المشاكل الشائعة

### 1. الرسالة مش بتوصل على الواتساب
**الحل:**
- تأكد إن Evolution API شغال
- تأكد إن الـ instance متصل
- تأكد إن رقم الهاتف صحيح وفيه كود الدولة
- شوف logs في n8n

### 2. الأوردر مش بيظهر في الـ CRM
**الحل:**
- تأكد إن الـ webhook URL صحيح
- تأكد إن الـ userId صحيح في الـ payload
- شوف logs في الـ backend
- تأكد إن الـ CRM backend شغال

### 3. Fulfillment مش بيشتغل
**الحل:**
- تأكد إن Shopify Access Token عنده permissions:
  - `write_orders`
  - `write_fulfillments`
- تأكد إن الأوردر مدفوع (paid)
- تأكد إن Order ID صحيح

### 4. الأزرار مش بتشتغل
**الحل:**
- تأكد إن Evolution API يدعم buttons
- تأكد إن الـ button response بيوصل لـ n8n
- تأكد إن الـ Switch Node configured صح

### 5. OAuth مش بيشتغل
**الحل:**
- تأكد إن الـ Redirect URL في Shopify App صحيح:
  - Development: `http://localhost:5000/api/shopify/auth/callback`
  - Production: `https://your-domain.com/api/shopify/auth/callback`
- تأكد إن Client ID و Client Secret صحيحين
- امسح الـ credentials وحاول تاني

---

## Flow الكامل

```
1. عميل يعمل Order في Shopify
   ↓
2. Shopify Trigger في n8n يستقبل الأوردر
   ↓
3. n8n يبعت الأوردر للـ CRM
   ↓
4. CRM يحفظ الأوردر في الـ database
   ↓
5. n8n يبعت رسالة واتساب للعميل (فيها أزرار)
   ↓
6. العميل يضغط "تأكيد" أو "إلغاء"
   ↓
7. الرد يروح لـ n8n
   ↓
8. n8n يحدث الأوردر في Shopify (fulfillment أو cancel)
   ↓
9. n8n يحدث الـ status في الـ CRM
   ↓
10. n8n يبعت رسالة تأكيد للعميل
```

---

## الملفات المهمة

في الـ CRM:
- `backend/src/controllers/webhook.controller.ts` - معالجة webhooks
- `backend/src/controllers/shopify.controller.ts` - Shopify OAuth
- `backend/src/routes/webhook.routes.ts` - webhook routes
- `frontend/src/pages/Settings.tsx` - صفحة الإعدادات
- `WEBHOOK_URLS_GUIDE.md` - دليل الـ webhooks
- `SHOPIFY_OAUTH_SETUP.md` - دليل Shopify OAuth

---

## الخطوات التالية

1. ✅ تثبيت n8n
2. ✅ إعداد Shopify App
3. ✅ ربط Shopify بالـ CRM (OAuth)
4. ✅ إنشاء Workflows في n8n
5. ✅ اختبار الربط
6. ✅ نشر على Production باستخدام ngrok
7. ✅ إعداد Evolution API للواتساب
8. ✅ اختبار كامل للـ flow

---

## نصائح مهمة

1. **احفظ الـ workflows**: اعمل export للـ workflows من n8n بانتظام
2. **استخدم Environment Variables**: لا تحط tokens في الكود
3. **اختبر على Shopify Test Store**: قبل ما تشتغل على الـ live store
4. **راقب الـ Logs**: شوف logs في n8n والـ CRM عشان تعرف المشاكل
5. **استخدم ngrok للتطوير**: أسهل من إعداد domain حقيقي

---

## الدعم

لو عندك أي مشكلة:
1. شوف الـ logs في n8n (Executions tab)
2. شوف الـ logs في الـ CRM backend
3. تأكد إن كل الـ URLs صحيحة
4. تأكد إن كل الـ tokens صحيحة
5. جرب الـ workflows خطوة بخطوة

---

## Resources

- [n8n Documentation](https://docs.n8n.io/)
- [Shopify API Documentation](https://shopify.dev/docs/api)
- [Evolution API Documentation](https://doc.evolution-api.com/)
- [ngrok Documentation](https://ngrok.com/docs)

---

تم بحمد الله! 🎉

الآن عندك نظام كامل لربط Shopify بالواتساب مع CRM متكامل.
