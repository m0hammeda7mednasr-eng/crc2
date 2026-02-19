@echo off
echo ========================================
echo Starting ngrok for Shopify Webhook
echo ========================================
echo.
echo Backend is running on port 5000
echo Starting ngrok tunnel...
echo.

REM Check if ngrok is installed
where ngrok >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: ngrok is not installed!
    echo.
    echo Please install ngrok:
    echo 1. Download from: https://ngrok.com/download
    echo 2. Extract ngrok.exe
    echo 3. Add to PATH or run from ngrok folder
    echo.
    echo OR use npx:
    echo npx ngrok http 5000
    echo.
    pause
    exit /b 1
)

echo Starting ngrok...
ngrok http 5000

pause
