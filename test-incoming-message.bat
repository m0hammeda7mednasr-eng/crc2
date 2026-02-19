@echo off
echo ========================================
echo Testing Incoming WhatsApp Message
echo ========================================
echo.

REM Change these values to test different scenarios
set PHONE_NUMBER=+201234567890
set MESSAGE=مرحبا! هذه رسالة تجريبية من الواتساب
set CUSTOMER_NAME=أحمد محمد

echo Sending message from: %PHONE_NUMBER%
echo Message: %MESSAGE%
echo Customer Name: %CUSTOMER_NAME%
echo.

curl -X POST http://localhost:5000/api/webhooks/whatsapp/incoming ^
  -H "Content-Type: application/json" ^
  -d "{\"phoneNumber\":\"%PHONE_NUMBER%\",\"content\":\"%MESSAGE%\",\"type\":\"text\",\"customerName\":\"%CUSTOMER_NAME%\"}"

echo.
echo ========================================
echo Test Complete!
echo Check your CRM Chat page to see the message
echo ========================================
pause
