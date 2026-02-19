@echo off
echo ========================================
echo Starting WhatsApp CRM System
echo ========================================
echo.

echo [1/3] Starting Backend...
start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Frontend...
start "Frontend Server" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak >nul

echo [3/3] Starting ngrok (for Shopify HTTPS)...
start "ngrok" cmd /k "npx ngrok http 5000"

echo.
echo ========================================
echo All services started!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo ngrok:    Check the ngrok window for HTTPS URL
echo.
echo NEXT STEPS:
echo 1. Wait for ngrok to start (check its window)
echo 2. Copy the HTTPS URL from ngrok (e.g., https://abc123.ngrok-free.app)
echo 3. Open http://localhost:3000 and go to Settings
echo 4. The Shopify webhook URL will show automatically
echo 5. Copy it and paste in Shopify webhook settings
echo.
echo Press any key to exit this window...
pause >nul
