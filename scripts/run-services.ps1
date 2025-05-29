# PowerShell script to run all services for Warehouse Management System

Write-Host "🚀 Starting Warehouse Management Services..." -ForegroundColor Green

# Set environment
$env:ASPNETCORE_ENVIRONMENT = "Development"

# Array of services to run
$services = @(
    @{Name="Product Service"; Path="services/product-service"; Project="ProductService.csproj"; Port=5001},
    @{Name="Inventory Service"; Path="services/inventory-service"; Project="InventoryService.csproj"; Port=5002},
    @{Name="Order Service"; Path="services/order-service"; Project="OrderService.csproj"; Port=5003},
    @{Name="Customer Service"; Path="services/customer-service"; Project="CustomerService.csproj"; Port=5004},
    @{Name="Payment Service"; Path="services/payment-service"; Project="PaymentService.csproj"; Port=5005},
    @{Name="Notification Service"; Path="services/notification-service"; Project="NotificationService.csproj"; Port=5006},
    @{Name="Reporting Service"; Path="services/reporting-service"; Project="ReportingService.csproj"; Port=5007},
    @{Name="Alert Service"; Path="services/alert-service"; Project="AlertService.csproj"; Port=5008},
    @{Name="API Gateway"; Path="api-gateway-dotnet"; Project="ApiGateway.csproj"; Port=5000}
)

# Function to start a service
function Start-Service {
    param(
        [string]$ServiceName,
        [string]$ServicePath,
        [string]$ProjectFile,
        [int]$Port
    )
    
    Write-Host "📦 Starting $ServiceName on port $Port..." -ForegroundColor Yellow
    
    $projectPath = "$ServicePath/$ProjectFile"
    
    try {
        # Start service in background
        Start-Process powershell -ArgumentList "-Command", "cd '$ServicePath'; `$env:ASPNETCORE_ENVIRONMENT='Development'; `$env:ASPNETCORE_URLS='http://localhost:$Port'; dotnet run --project $ProjectFile" -WindowStyle Minimized
        
        Write-Host "  ✅ $ServiceName started on http://localhost:$Port" -ForegroundColor Green
        Start-Sleep -Seconds 2
    }
    catch {
        Write-Host "  ❌ Failed to start $ServiceName`: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Start all services
Write-Host "`n🔧 Starting infrastructure services..." -ForegroundColor Blue
Write-Host "Make sure Docker containers are running:" -ForegroundColor Cyan
Write-Host "  - PostgreSQL databases (ports 5432-5439)" -ForegroundColor White
Write-Host "  - RabbitMQ (port 5672, management 15672)" -ForegroundColor White
Write-Host "  - Redis (port 6379)" -ForegroundColor White

Write-Host "`n📋 Starting application services..." -ForegroundColor Blue
foreach ($service in $services) {
    Start-Service -ServiceName $service.Name -ServicePath $service.Path -ProjectFile $service.Project -Port $service.Port
}

Write-Host "`n🎉 All services started!" -ForegroundColor Green
Write-Host "`n📊 Service URLs:" -ForegroundColor Blue
foreach ($service in $services) {
    Write-Host "  $($service.Name): http://localhost:$($service.Port)" -ForegroundColor White
    if ($service.Name -ne "API Gateway") {
        Write-Host "    - Swagger: http://localhost:$($service.Port)/swagger" -ForegroundColor Gray
        Write-Host "    - Health: http://localhost:$($service.Port)/health" -ForegroundColor Gray
    }
}

Write-Host "`n🌐 API Gateway: http://localhost:5000" -ForegroundColor Cyan
Write-Host "🐰 RabbitMQ Management: http://localhost:15672 (admin/password)" -ForegroundColor Cyan

Write-Host "`nPress any key to stop all services..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Stop all dotnet processes
Write-Host "`n🛑 Stopping all services..." -ForegroundColor Red
Get-Process -Name "dotnet" -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "All services stopped." -ForegroundColor Green
