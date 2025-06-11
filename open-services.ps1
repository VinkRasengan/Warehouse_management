# Open Warehouse Management System Services in Browser
# This script opens the main service URLs in your default browser

Write-Host "Opening Warehouse Management System Services..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Function to check if a URL is accessible
function Test-UrlAccessible {
    param([string]$Url, [int]$TimeoutSeconds = 10)
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec $TimeoutSeconds -UseBasicParsing -ErrorAction Stop
        return $response.StatusCode -eq 200
    }
    catch {
        return $false
    }
}

# Function to open URL with status check
function Open-ServiceUrl {
    param([string]$Url, [string]$ServiceName)
    
    Write-Host "Checking $ServiceName..." -ForegroundColor Yellow
    
    if (Test-UrlAccessible -Url $Url) {
        Write-Host "✅ $ServiceName is running" -ForegroundColor Green
        Start-Process $Url
        Write-Host "🌐 Opened $ServiceName in browser" -ForegroundColor Cyan
        return $true
    } else {
        Write-Host "❌ $ServiceName is not accessible" -ForegroundColor Red
        Write-Host "   Make sure services are running with: .\deploy-local-simple.ps1" -ForegroundColor Gray
        return $false
    }
}

# Main services
Write-Host "`nOpening main services..." -ForegroundColor Blue

$apiGatewayOpen = Open-ServiceUrl "http://localhost:5000" "API Gateway"
Start-Sleep -Seconds 2

$frontendOpen = Open-ServiceUrl "http://localhost:3000" "Frontend"

# Additional service URLs (optional)
Write-Host "`nAdditional service URLs:" -ForegroundColor Blue
Write-Host "  User Service Swagger: http://localhost:5100/swagger" -ForegroundColor White
Write-Host "  Product Service Swagger: http://localhost:5101/swagger" -ForegroundColor White
Write-Host "  Inventory Service Swagger: http://localhost:5102/swagger" -ForegroundColor White
Write-Host "  Order Service Swagger: http://localhost:5103/swagger" -ForegroundColor White
Write-Host "  Customer Service Swagger: http://localhost:5104/swagger" -ForegroundColor White
Write-Host "  Payment Service Swagger: http://localhost:5107/swagger" -ForegroundColor White
Write-Host "  Notification Service Swagger: http://localhost:5108/swagger" -ForegroundColor White

# Summary
Write-Host "`nSummary:" -ForegroundColor Magenta
if ($apiGatewayOpen) {
    Write-Host "✅ API Gateway opened successfully" -ForegroundColor Green
} else {
    Write-Host "❌ API Gateway failed to open" -ForegroundColor Red
}

if ($frontendOpen) {
    Write-Host "✅ Frontend opened successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend failed to open" -ForegroundColor Red
}

if (-not $apiGatewayOpen -and -not $frontendOpen) {
    Write-Host "`n⚠️  No services are running!" -ForegroundColor Yellow
    Write-Host "   Run deployment script first: .\deploy-local-simple.ps1" -ForegroundColor Yellow
} elseif ($apiGatewayOpen -and $frontendOpen) {
    Write-Host "`n🎉 All main services opened successfully!" -ForegroundColor Green
}

Write-Host "`nDone!" -ForegroundColor Green
