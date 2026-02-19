# n8n Quick Start Guide - ربط Shopify بالواتساب

## الإعداد السريع (5 دقائق)

### 1. شغل n8n

```bash
npx n8n
```

افتح: http://localhost:5678

---

### 2. احصل على بياناتك من الـ CRM

1. افتح http://localhost:3000
2. سجل دخول
3. روح على **Settings**
4. انسخ:
   - ✅ **Incoming Webhook URL** (للرسائل الواردة)
   - ✅ **Shopify Orders Webhook URL** (للأوردرات)
   - ✅ **Your User ID** (للـ payload)

---

### 3. أنشئ Workflow في n8n

#### Workflow 1: Shopify → CRM → WhatsApp

**الخطوات:**

1. **Shopify Trigger**
   - Add Node → Trigger → Shopify
   - Credentials: أضف بيانات Shopify
   - Event: Order Created

2. **Function** (تنسيق البيانات)
```javascript
const order = $input.item.json;
let phone = (order.customer.phone || '').replace(/[^0-9+]/g, '');

return {
  orderId: order.id.toString(),
  orderNumber: order.order_number.toString(),
  customerName: `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim(),
  customerPhone: phone,
  totalPrice: order.total_price,
  currency: order.currency,
  items: order.line_items.map(i => 
    `• ${i.name} (${i.quantity}x) - ${i.price} ${order.currency}`
  ).join('\n')
};
```

3. **HTTP Request** (إرسال للـ CRM)
   - Method: POST
   - URL: `http://localhost:5000/api/webhook/shopify/orders`
   - Body:
```json
{
  "orderId": "{{ $json.orderId }}",
  "orderNumber": "{{ $json.orderNumber }}",
  "customerName": "{{ $json.customerName }}",
  "customerPhone": "{{ $json.customerPhone }}",
  "total": {{ $json.totalPrice }},
  "status": "pending",
  "userId": "YOUR_USER_ID_HERE",
  "items": "{{ $json.items }}"
}
```

4. **HTTP Request** (إرسال واتساب)
   - Method: POST
   - URL: `YOUR_WHATSAPP_API_URL`
   - Body:
```json
{
  "number": "{{ $json.customerPhone }}",
  "text": "مرحباً {{ $json.customerName }}! 👋\n\nتم استلام طلبك #{{ $json.orderNumber }} ✅\n\n{{ $json.items }}\n\n💰 الإجمالي: {{ $json.totalPrice }} {{ $json.currency }}"
}
```

---

#### Workflow 2: WhatsApp → CRM

**الخطوات:**

1. **Webhook**
   - Path: `whatsapp-incoming`
   - Method: POST

2. **Function** (استخراج البيانات)
```javascript
const data = $input.item.json;
let phone = '';
let content = '';

// Evolution API
if (data.key?.remoteJid) {
  phone = data.key.remoteJid.replace('@s.whatsapp.net', '');
  content = data.message?.conversation || 
            data.message?.extendedTextMessage?.text || '';
}

// WhatsApp Business API
if (data.from) {
  phone = data.from;
  content = data.body || data.text?.body || '';
}

return { phoneNumber: phone, content: content, type: 'text' };
```

3. **HTTP Request** (إرسال للـ CRM)
   - Method: POST
   - URL: `YOUR_INCOMING_WEBHOOK_URL` (من Settings)
   - Body:
```json
{
  "phoneNumber": "{{ $json.phoneNumber }}",
  "content": "{{ $json.content }}",
  "type": "{{ $json.type }}"
}
```

---

### 4. اختبر الربط

#### اختبار الأوردرات:
1. أنشئ order تجريبي في Shopify
2. تأكد إن الأوردر ظهر في CRM (صفحة Orders)
3. تأكد إن الرسالة وصلت على الواتساب

#### اختبار الرسائل:
1. ابعت رسالة من الواتساب
2. تأكد إنها ظهرت في CRM (صفحة Chat)
3. رد من الـ CRM
4. تأكد إن الرد وصل على الواتساب

---

## البيانات المطلوبة

### من الـ CRM (Settings page):
```
✅ Incoming Webhook URL: http://localhost:5000/api/webhook/incoming/abc123
✅ Shopify Webhook URL: http://localhost:5000/api/webhook/shopify/orders
✅ User ID: abc123-user-id
✅ n8n Outgoing URL: (هتحطه بعد إنشاء webhook في n8n)
```

### من Shopify:
```
✅ Shop Domain: your-store.myshopify.com
✅ Access Token: shpat_xxxxx
✅ Client ID: (من Shopify App)
✅ Client Secret: (من Shopify App)
```

### من WhatsApp:
```
✅ API URL: (Evolution API أو WhatsApp Business API)
✅ API Token/Key
✅ Instance Name (للـ Evolution API)
```

---

## الملفات المهمة

- `SHOPIFY_WHATSAPP_INTEGRATION_AR.md` - الدليل الكامل بالعربي
- `WEBHOOK_URLS_GUIDE.md` - دليل الـ webhooks
- `SHOPIFY_OAUTH_SETUP.md` - إعداد Shopify OAuth

---

## المشاكل الشائعة

### الأوردر مش بيظهر في الـ CRM
✅ تأكد إن userId صحيح في الـ payload
✅ تأكد إن الـ webhook URL صحيح
✅ شوف logs في n8n

### الرسالة مش بتوصل على الواتساب
✅ تأكد إن WhatsApp API شغال
✅ تأكد إن رقم الهاتف صحيح
✅ تأكد إن الـ API token صحيح

### الرسائل مش بتظهر في الـ CRM
✅ تأكد إن Incoming Webhook URL صحيح
✅ تأكد إن الـ payload format صحيح
✅ شوف logs في الـ backend

---

## Production Setup

### استخدام ngrok:

```bash
# Terminal 1: CRM Backend
ngrok http 5000

# Terminal 2: n8n
ngrok http 5678
```

بعدين:
1. حدث الـ URLs في n8n workflows
2. حدث الـ Shopify OAuth redirect URL
3. حدث الـ WhatsApp webhook URL

---

## الدعم

لو عندك مشكلة:
1. شوف logs في n8n (Executions tab)
2. شوف logs في الـ CRM backend
3. تأكد إن كل الـ URLs صحيحة
4. جرب test execution في n8n

---

تم! 🎉

الآن عندك نظام كامل لربط Shopify بالواتساب.
