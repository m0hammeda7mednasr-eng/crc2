# Test Shopify Order Webhook
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Shopify Order Webhook" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend is running
Write-Host "[1/4] Checking if backend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000" -Method GET -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Backend is not running!" -ForegroundColor Red
    Write-Host "Please start backend first: cd backend && npm run dev" -ForegroundColor Yellow
    pause
    exit 1
}
Write-Host ""

# Get user ID from database
Write-Host "[2/4] Getting user ID from database..." -ForegroundColor Yellow
Push-Location backend
$userId = node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.user.findFirst().then(u => { if(u) console.log(u.id); prisma.`$disconnect(); }).catch(() => prisma.`$disconnect());"
Pop-Location

if ([string]::IsNullOrEmpty($userId)) {
    Write-Host "❌ ERROR: No user found in database!" -ForegroundColor Red
    Write-Host "Please create a user first or login to the CRM" -ForegroundColor Yellow
    pause
    exit 1
}
Write-Host "✅ User ID: $userId" -ForegroundColor Green
Write-Host ""

# Prepare test order data
$testOrder = @{
    id = 12345
    order_number = 1001
    name = "#1001"
    customer = @{
        first_name = "أحمد"
        last_name = "محمد"
        phone = "+201234567890"
    }
    shipping_address = @{
        phone = "+201234567890"
    }
    billing_address = @{
        phone = "+201234567890"
    }
    line_items = @(
        @{
            name = "Test Product"
            quantity = 2
            price = "75.00"
        }
    )
    total_price = "150.00"
    current_total_price = "150.00"
} | ConvertTo-Json -Depth 10

# Send webhook
Write-Host "[3/4] Sending test Shopify order..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/webhook/shopify/orders?userId=$userId" `
        -Method POST `
        -ContentType "application/json" `
        -Body $testOrder
    
    Write-Host "✅ Webhook sent successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor White
} catch {
    Write-Host "❌ ERROR: Failed to send webhook!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Yellow
    }
    pause
    exit 1
}
Write-Host ""

# Check database
Write-Host "[4/4] Checking database..." -ForegroundColor Yellow
Push-Location backend
$orderCount = node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.order.count().then(c => { console.log(c); prisma.`$disconnect(); }).catch(() => prisma.`$disconnect());"
Pop-Location
Write-Host "✅ Total orders in database: $orderCount" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Test completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now check:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:3000/orders" -ForegroundColor White
Write-Host "2. You should see Order #1001" -ForegroundColor White
Write-Host "3. Customer: أحمد محمد" -ForegroundColor White
Write-Host "4. Total: $150.00" -ForegroundColor White
Write-Host ""
Write-Host "If order doesn't appear:" -ForegroundColor Yellow
Write-Host "- Check backend console for errors" -ForegroundColor White
Write-Host "- Make sure you're logged in to the CRM" -ForegroundColor White
Write-Host "- Run: cd backend && npx prisma studio (to view database)" -ForegroundColor White
Write-Host ""
pause
