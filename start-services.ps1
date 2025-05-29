# PowerShell script to start Warehouse Management Services
Write-Host "🚀 Starting Warehouse Management System..." -ForegroundColor Green

# Set environment variables
$env:ASPNETCORE_ENVIRONMENT = "Development"

# Function to start a service
function Start-ServiceAsync {
    param(
        [string]$ServiceName,
        [string]$ServicePath,
        [int]$Port
    )
    
    Write-Host "📦 Starting $ServiceName on port $Port..." -ForegroundColor Yellow
    
    # Set environment for this service
    $env:ASPNETCORE_URLS = "http://localhost:$Port"
    
    # Start service in new PowerShell window
    $scriptBlock = {
        param($path, $port, $name)
        $env:ASPNETCORE_ENVIRONMENT = "Development"
        $env:ASPNETCORE_URLS = "http://localhost:$port"
        Set-Location $path
        Write-Host "Starting $name..." -ForegroundColor Green
        dotnet run
    }
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "& {$($scriptBlock.ToString())} '$ServicePath' $Port '$ServiceName'"
    
    Write-Host "  ✅ $ServiceName starting on http://localhost:$Port" -ForegroundColor Green
    Start-Sleep -Seconds 2
}

# Start services one by one
Write-Host "`n📋 Starting services..." -ForegroundColor Blue

Start-ServiceAsync -ServiceName "Product Service" -ServicePath "C:\Project\Warehouse_management\services\product-service" -Port 5001
Start-ServiceAsync -ServiceName "Inventory Service" -ServicePath "C:\Project\Warehouse_management\services\inventory-service" -Port 5002
Start-ServiceAsync -ServiceName "Order Service" -ServicePath "C:\Project\Warehouse_management\services\order-service" -Port 5003
Start-ServiceAsync -ServiceName "Customer Service" -ServicePath "C:\Project\Warehouse_management\services\customer-service" -Port 5004
Start-ServiceAsync -ServiceName "Payment Service" -ServicePath "C:\Project\Warehouse_management\services\payment-service" -Port 5005
Start-ServiceAsync -ServiceName "Notification Service" -ServicePath "C:\Project\Warehouse_management\services\notification-service" -Port 5006
Start-ServiceAsync -ServiceName "Reporting Service" -ServicePath "C:\Project\Warehouse_management\services\reporting-service" -Port 5007
Start-ServiceAsync -ServiceName "Alert Service" -ServicePath "C:\Project\Warehouse_management\services\alert-service" -Port 5008

Write-Host "`n🎉 All services are starting!" -ForegroundColor Green
Write-Host "`n📊 Service URLs:" -ForegroundColor Blue
Write-Host "  Product Service: http://localhost:5001/swagger" -ForegroundColor White
Write-Host "  Inventory Service: http://localhost:5002/swagger" -ForegroundColor White
Write-Host "  Order Service: http://localhost:5003/swagger" -ForegroundColor White
Write-Host "  Customer Service: http://localhost:5004/swagger" -ForegroundColor White
Write-Host "  Payment Service: http://localhost:5005/swagger" -ForegroundColor White
Write-Host "  Notification Service: http://localhost:5006/swagger" -ForegroundColor White
Write-Host "  Reporting Service: http://localhost:5007/swagger" -ForegroundColor White
Write-Host "  Alert Service: http://localhost:5008/swagger" -ForegroundColor White

Write-Host "`n🌐 Infrastructure:" -ForegroundColor Cyan
Write-Host "  RabbitMQ Management: http://localhost:15672 (admin/password)" -ForegroundColor White
Write-Host "  Redis: localhost:6379" -ForegroundColor White

Write-Host "`n⏳ Wait a few seconds for all services to start, then check the URLs above!" -ForegroundColor Yellow
Write-Host "Press any key to stop all services..." -ForegroundColor Red
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Stop all dotnet processes
Write-Host "`n🛑 Stopping all services..." -ForegroundColor Red
Get-Process -Name "dotnet" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "powershell" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*Service*" } | Stop-Process -Force
Write-Host "All services stopped." -ForegroundColor Green
