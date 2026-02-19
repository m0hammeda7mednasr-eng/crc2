@echo off
echo ========================================
echo Pushing to GitHub
echo ========================================
echo.

echo [1/5] Checking Git status...
git status
echo.

echo [2/5] Adding all files...
git add .
echo.

echo [3/5] Creating commit...
git commit -m "Complete WhatsApp CRM System with Shopify Integration" 2>nul
if errorlevel 1 (
    echo No changes to commit, using existing commit
)
echo.

echo [4/5] Setting branch to main...
git branch -M main
echo.

echo [5/5] Pushing to GitHub...
echo.
echo IMPORTANT: You may need to enter your GitHub credentials
echo.
git push -u origin main
echo.

if errorlevel 1 (
    echo.
    echo ========================================
    echo Push FAILED!
    echo ========================================
    echo.
    echo Possible solutions:
    echo 1. Use GitHub Desktop (easiest): https://desktop.github.com/
    echo 2. Use Personal Access Token
    echo 3. Check GITHUB_PUSH_GUIDE.md for detailed instructions
    echo.
    pause
) else (
    echo.
    echo ========================================
    echo SUCCESS! Project pushed to GitHub!
    echo ========================================
    echo.
    echo View your project at:
    echo https://github.com/m0hammeda7mednasr-eng/crm
    echo.
    pause
)
