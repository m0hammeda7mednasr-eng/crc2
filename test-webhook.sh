#!/bin/bash

# اختبار webhook لاستقبال رسالة WhatsApp
# لا تحتاج لإرسال userId - النظام سيتعرف عليه تلقائياً!

echo "🧪 اختبار webhook - إرسال رسالة واردة..."
echo ""

curl -X POST http://localhost:5000/api/webhooks/whatsapp/incoming \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+201234567890",
    "content": "مرحبا! هذه رسالة تجريبية من n8n",
    "type": "text",
    "customerName": "أحمد محمد"
  }'

echo ""
echo ""
echo "✅ تم إرسال الطلب!"
echo "📱 افتح المتصفح على http://localhost:3000 وشاهد الرسالة تظهر فوراً!"
