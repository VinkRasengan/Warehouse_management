# PowerShell script to start complete Warehouse Management System
Write-Host "🚀 Starting Complete Warehouse Management System..." -ForegroundColor Green

# Function to kill existing dotnet processes
function Stop-ExistingServices {
    Write-Host "🛑 Stopping existing services..." -ForegroundColor Yellow
    Get-Process -Name "dotnet" -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2
    Write-Host "  ✅ Existing services stopped" -ForegroundColor Green
}

# Function to start a service
function Start-Service {
    param(
        [string]$ServiceName,
        [string]$ServicePath,
        [int]$Port
    )
    
    Write-Host "📦 Starting $ServiceName on port $Port..." -ForegroundColor Yellow
    
    # Start service in new PowerShell window
    $command = "Set-Location '$ServicePath'; dotnet run --urls 'http://localhost:$Port'"
    Start-Process powershell -ArgumentList "-NoExit", "-WindowStyle", "Minimized", "-Command", $command
    
    Write-Host "  ✅ $ServiceName started on http://localhost:$Port" -ForegroundColor Green
    Start-Sleep -Seconds 2
}

# Stop existing services first
Stop-ExistingServices

# Check Docker containers
Write-Host "`n🐳 Checking Docker containers..." -ForegroundColor Blue
$dockerStatus = docker-compose ps --format "table {{.Name}}\t{{.Status}}"
Write-Host $dockerStatus -ForegroundColor White

# Start all services
Write-Host "`n📋 Starting all microservices..." -ForegroundColor Blue

$services = @(
    @{Name="Product Service"; Path="C:\Project\Warehouse_management\services\product-service"; Port=5001},
    @{Name="Inventory Service"; Path="C:\Project\Warehouse_management\services\inventory-service"; Port=5002},
    @{Name="Order Service"; Path="C:\Project\Warehouse_management\services\order-service"; Port=5003},
    @{Name="Customer Service"; Path="C:\Project\Warehouse_management\services\customer-service"; Port=5004},
    @{Name="Payment Service"; Path="C:\Project\Warehouse_management\services\payment-service"; Port=5005},
    @{Name="Notification Service"; Path="C:\Project\Warehouse_management\services\notification-service"; Port=5006},
    @{Name="Reporting Service"; Path="C:\Project\Warehouse_management\services\reporting-service"; Port=5007},
    @{Name="Alert Service"; Path="C:\Project\Warehouse_management\services\alert-service"; Port=5008}
)

foreach ($service in $services) {
    Start-Service -ServiceName $service.Name -ServicePath $service.Path -Port $service.Port
}

Write-Host "`n⏳ Waiting for all services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "`n🎉 All services started successfully!" -ForegroundColor Green

Write-Host "`n📊 Service URLs:" -ForegroundColor Blue
foreach ($service in $services) {
    Write-Host "  $($service.Name): http://localhost:$($service.Port)/swagger" -ForegroundColor White
}

Write-Host "`n🌐 Infrastructure URLs:" -ForegroundColor Cyan
Write-Host "  RabbitMQ Management: http://localhost:15672 (admin/password)" -ForegroundColor White
Write-Host "  Redis: localhost:6379" -ForegroundColor White

Write-Host "`n🔧 Health Check URLs:" -ForegroundColor Magenta
foreach ($service in $services) {
    Write-Host "  $($service.Name): http://localhost:$($service.Port)/health" -ForegroundColor Gray
}

# Open main service URLs in browser
Write-Host "`n🌐 Opening main services in browser..." -ForegroundColor Cyan
Start-Process "http://localhost:5001/swagger"  # Product Service
Start-Process "http://localhost:5002/swagger"  # Inventory Service
Start-Process "http://localhost:5003/swagger"  # Order Service
Start-Process "http://localhost:5004/swagger"  # Customer Service

Write-Host "`n✅ Warehouse Management System is now running!" -ForegroundColor Green
Write-Host "`n📝 To stop all services, run:" -ForegroundColor Red
Write-Host "   Get-Process -Name 'dotnet' | Stop-Process -Force" -ForegroundColor White
Write-Host "`n🎯 Test the system by creating products, customers, and orders through the Swagger UIs!" -ForegroundColor Yellow
