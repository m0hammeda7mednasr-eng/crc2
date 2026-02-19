@echo off
echo ========================================
echo Testing Shopify Webhook
echo ========================================
echo.

REM Get userId from token (you need to replace this with your actual userId)
set USER_ID=YOUR_USER_ID_HERE

echo Sending test Shopify order webhook...
echo.

curl -X POST http://localhost:5000/api/webhook/shopify/orders?userId=%USER_ID% ^
  -H "Content-Type: application/json" ^
  -d "{\"id\":12345,\"order_number\":1001,\"customer\":{\"first_name\":\"Ahmed\",\"last_name\":\"Mohamed\",\"phone\":\"+201234567890\"},\"line_items\":[{\"name\":\"Test Product\",\"quantity\":2,\"price\":\"75.00\"}],\"total_price\":\"150.00\",\"current_total_price\":\"150.00\"}"

echo.
echo ========================================
echo Test completed!
echo Check:
echo 1. Backend logs for any errors
echo 2. Orders page in CRM
echo ========================================
pause
