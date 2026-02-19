@echo off
chcp 65001 >nul
echo.
echo ========================================
echo 🚀 رفع المشروع على GitHub
echo ========================================
echo.
echo Repository: https://github.com/m0hammeda7mednasr-eng/crc2
echo.
echo ⚠️  هتحتاج تسجل دخول GitHub
echo.
echo الطرق المتاحة:
echo   1. GitHub Desktop (الأسهل) ⭐
echo   2. Personal Access Token
echo   3. SSH Key
echo.
echo شوف الملف: PUSH_FINAL_AR.md للتفاصيل
echo.
echo ========================================
echo.
pause
echo.
echo جاري الرفع...
echo.
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✅ تم الرفع بنجاح!
    echo ========================================
    echo.
    echo شوف المشروع على:
    echo https://github.com/m0hammeda7mednasr-eng/crc2
    echo.
) else (
    echo.
    echo ========================================
    echo ❌ فشل الرفع
    echo ========================================
    echo.
    echo الحلول:
    echo   1. استخدم GitHub Desktop
    echo   2. استخدم Personal Access Token
    echo   3. شوف PUSH_FINAL_AR.md للتفاصيل
    echo.
)
pause
