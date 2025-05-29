# PowerShell script to run all Warehouse Management Services
Write-Host "🚀 Starting All Warehouse Management Services..." -ForegroundColor Green

# Function to start a service in a new terminal
function Start-ServiceInNewTerminal {
    param(
        [string]$ServiceName,
        [string]$ServicePath,
        [int]$Port
    )
    
    Write-Host "📦 Starting $ServiceName on port $Port..." -ForegroundColor Yellow
    
    # Create command to run in new terminal
    $command = "cd '$ServicePath'; dotnet run --urls 'http://localhost:$Port'"
    
    # Start new PowerShell window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $command
    
    Write-Host "  ✅ $ServiceName terminal opened for port $Port" -ForegroundColor Green
    Start-Sleep -Seconds 1
}

# Start all services
Write-Host "`n📋 Starting all services in separate terminals..." -ForegroundColor Blue

Start-ServiceInNewTerminal -ServiceName "Product Service" -ServicePath "C:\Project\Warehouse_management\services\product-service" -Port 5001
Start-ServiceInNewTerminal -ServiceName "Inventory Service" -ServicePath "C:\Project\Warehouse_management\services\inventory-service" -Port 5002
Start-ServiceInNewTerminal -ServiceName "Order Service" -ServicePath "C:\Project\Warehouse_management\services\order-service" -Port 5003
Start-ServiceInNewTerminal -ServiceName "Customer Service" -ServicePath "C:\Project\Warehouse_management\services\customer-service" -Port 5004
Start-ServiceInNewTerminal -ServiceName "Payment Service" -ServicePath "C:\Project\Warehouse_management\services\payment-service" -Port 5005
Start-ServiceInNewTerminal -ServiceName "Notification Service" -ServicePath "C:\Project\Warehouse_management\services\notification-service" -Port 5006
Start-ServiceInNewTerminal -ServiceName "Reporting Service" -ServicePath "C:\Project\Warehouse_management\services\reporting-service" -Port 5007
Start-ServiceInNewTerminal -ServiceName "Alert Service" -ServicePath "C:\Project\Warehouse_management\services\alert-service" -Port 5008

Write-Host "`n🎉 All services are starting in separate terminals!" -ForegroundColor Green
Write-Host "`n⏳ Wait a few seconds for all services to start..." -ForegroundColor Yellow

Start-Sleep -Seconds 10

Write-Host "`n📊 Service URLs (will open in browser):" -ForegroundColor Blue
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

Write-Host "`n🔧 To stop all services:" -ForegroundColor Red
Write-Host "  Close all PowerShell windows or run: Get-Process -Name 'dotnet' | Stop-Process -Force" -ForegroundColor White

# Open main service URLs in browser
Write-Host "`n🌐 Opening service URLs in browser..." -ForegroundColor Cyan
Start-Process "http://localhost:5001/swagger"
Start-Process "http://localhost:5002/swagger"
Start-Process "http://localhost:5003/swagger"
Start-Process "http://localhost:5004/swagger"

Write-Host "`n✅ All services started successfully!" -ForegroundColor Green
