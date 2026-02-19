@echo off
chcp 65001 >nul
echo.
echo ========================================
echo 🔐 رفع المشروع باستخدام Token
echo ========================================
echo.
echo Repository: https://github.com/m0hammeda7mednasr-eng/crc2
echo.
echo ⚠️  محتاج Personal Access Token
echo.
echo كيف تحصل على Token:
echo   1. افتح: https://github.com/settings/tokens
echo   2. اضغط "Generate new token (classic)"
echo   3. اختر "repo" permissions
echo   4. انسخ الـ Token
echo.
echo ========================================
echo.
set /p TOKEN="الصق الـ Token هنا: "
echo.
echo جاري الرفع...
echo.

git remote set-url origin https://%TOKEN%@github.com/m0hammeda7mednasr-eng/crc2.git
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✅ تم الرفع بنجاح!
    echo ========================================
    echo.
    echo شوف المشروع على:
    echo https://github.com/m0hammeda7mednasr-eng/crc2
    echo.
    
    REM Clean up - remove token from URL for security
    git remote set-url origin https://github.com/m0hammeda7mednasr-eng/crc2.git
    echo ✅ تم تنظيف الـ Token من الـ Config
) else (
    echo.
    echo ========================================
    echo ❌ فشل الرفع
    echo ========================================
    echo.
    echo تأكد من:
    echo   1. الـ Token صحيح
    echo   2. الـ Token له صلاحيات "repo"
    echo   3. أنت مسجل دخول بحساب: m0hammeda7mednasr-eng
    echo.
    echo أو استخدم GitHub Desktop (أسهل):
    echo https://desktop.github.com/
    echo.
)
pause
