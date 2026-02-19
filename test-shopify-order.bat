@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Testing Shopify Order Webhook
echo ========================================
echo.

REM Check if backend is running
echo [1/3] Checking if backend is running...
curl -s http://localhost:5000 >nul 2>&1
if errorlevel 1 (
    echo ERROR: Backend is not running!
    echo Please start backend first: cd backend ^&^& npm run dev
    pause
    exit /b 1
)
echo ✅ Backend is running
echo.

REM Get first user ID from database
echo [2/3] Getting user ID...
cd backend
for /f "delims=" %%i in ('node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.user.findFirst().then(u => { console.log(u.id); prisma.$disconnect(); });"') do set USER_ID=%%i
cd ..

if "%USER_ID%"=="" (
    echo ERROR: No user found in database!
    echo Please create a user first or login to the CRM
    pause
    exit /b 1
)
echo ✅ User ID: %USER_ID%
echo.

REM Send test webhook
echo [3/3] Sending test Shopify order...
curl -X POST "http://localhost:5000/api/webhook/shopify/orders?userId=%USER_ID%" ^
  -H "Content-Type: application/json" ^
  -d "{\"id\":12345,\"order_number\":1001,\"name\":\"#1001\",\"customer\":{\"first_name\":\"Ahmed\",\"last_name\":\"Mohamed\",\"phone\":\"+201234567890\"},\"shipping_address\":{\"phone\":\"+201234567890\"},\"line_items\":[{\"name\":\"Test Product\",\"quantity\":2,\"price\":\"75.00\"}],\"total_price\":\"150.00\",\"current_total_price\":\"150.00\"}"

echo.
echo.
echo ========================================
echo ✅ Test webhook sent!
echo ========================================
echo.
echo Now check:
echo 1. Backend console - should show "Order synced successfully"
echo 2. Open http://localhost:3000/orders
echo 3. You should see Order #1001
echo.
echo If order doesn't appear:
echo - Check backend logs for errors
echo - Make sure you're logged in to the CRM
echo - Check database: cd backend ^&^& npx prisma studio
echo.
pause
