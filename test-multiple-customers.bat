@echo off
echo ========================================
echo Testing Multiple Customers
echo ========================================
echo.

echo Sending message from Customer 1...
curl -X POST http://localhost:5000/api/webhooks/whatsapp/incoming ^
  -H "Content-Type: application/json" ^
  -d "{\"phoneNumber\":\"+201111111111\",\"content\":\"مرحبا! أنا العميل الأول\",\"type\":\"text\",\"customerName\":\"محمد أحمد\"}"

echo.
echo.

timeout /t 2 /nobreak >nul

echo Sending message from Customer 2...
curl -X POST http://localhost:5000/api/webhooks/whatsapp/incoming ^
  -H "Content-Type: application/json" ^
  -d "{\"phoneNumber\":\"+202222222222\",\"content\":\"السلام عليكم! أنا العميل الثاني\",\"type\":\"text\",\"customerName\":\"سارة علي\"}"

echo.
echo.

timeout /t 2 /nobreak >nul

echo Sending message from Customer 3...
curl -X POST http://localhost:5000/api/webhooks/whatsapp/incoming ^
  -H "Content-Type: application/json" ^
  -d "{\"phoneNumber\":\"+203333333333\",\"content\":\"مساء الخير! أنا العميل الثالث\",\"type\":\"text\",\"customerName\":\"خالد حسن\"}"

echo.
echo.

timeout /t 2 /nobreak >nul

echo Sending another message from Customer 1...
curl -X POST http://localhost:5000/api/webhooks/whatsapp/incoming ^
  -H "Content-Type: application/json" ^
  -d "{\"phoneNumber\":\"+201111111111\",\"content\":\"عندي سؤال عن المنتج\",\"type\":\"text\"}"

echo.
echo.

echo ========================================
echo Test Complete!
echo Check your CRM - you should see 3 customers
echo Each customer should have their messages
echo ========================================
pause
