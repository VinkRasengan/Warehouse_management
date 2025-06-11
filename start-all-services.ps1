# Start All Services Script
Write-Host "Starting All Warehouse Management Services" -ForegroundColor Blue
Write-Host "===========================================" -ForegroundColor Blue

# Services configuration
$services = @{
    "inventory-service" = 5000
    "order-service" = 5002
    "customer-service" = 5003
    "payment-service" = 5004
    "notification-service" = 5005
    "alert-service" = 5006
}

# Array to store process information
$processes = @()

Write-Host "Starting services..." -ForegroundColor Cyan

foreach ($serviceName in $services.Keys) {
    $port = $services[$serviceName]
    
    Write-Host "Starting $serviceName on port $port..." -ForegroundColor Yellow
    
    try {
        # Start service in background
        $process = Start-Process -FilePath "powershell" -ArgumentList @(
            "-NoExit",
            "-Command",
            "cd 'services/$serviceName'; dotnet run --urls 'http://localhost:$port'"
        ) -PassThru -WindowStyle Minimized
        
        $processes += @{
            Name = $serviceName
            Port = $port
            ProcessId = $process.Id
            Process = $process
        }
        
        Write-Host "  $serviceName started (PID: $($process.Id))" -ForegroundColor Green
        
        # Small delay between starts
        Start-Sleep -Seconds 2
    }
    catch {
        Write-Host "  Failed to start $serviceName`: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nWaiting for services to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 15

Write-Host "`nTesting service health checks..." -ForegroundColor Cyan

foreach ($serviceName in $services.Keys) {
    $port = $services[$serviceName]
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:$port/health" -Method GET -TimeoutSec 5
        Write-Host "  ✅ $serviceName (port $port) - Healthy" -ForegroundColor Green
    }
    catch {
        Write-Host "  ❌ $serviceName (port $port) - Not responding" -ForegroundColor Red
    }
}

Write-Host "`n🎉 All services started!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

Write-Host "`n📋 Service URLs:" -ForegroundColor Blue
foreach ($serviceName in $services.Keys) {
    $port = $services[$serviceName]
    Write-Host "  $serviceName`:" -ForegroundColor White
    Write-Host "    API: http://localhost:$port" -ForegroundColor Gray
    Write-Host "    Swagger: http://localhost:$port/swagger" -ForegroundColor Gray
    Write-Host "    Health: http://localhost:$port/health" -ForegroundColor Gray
}

Write-Host "`n🔧 Management Commands:" -ForegroundColor Blue
Write-Host "  Test all APIs: test-all-apis.ps1" -ForegroundColor White
Write-Host "  Stop all services: stop-all-services.ps1" -ForegroundColor White
Write-Host "  View service status: Get-Process dotnet" -ForegroundColor White

Write-Host "`n💡 Quick Tests:" -ForegroundColor Blue
Write-Host "  Inventory: Invoke-RestMethod http://localhost:5000/api/inventory" -ForegroundColor White
Write-Host "  Orders: Invoke-RestMethod http://localhost:5002/api/orders" -ForegroundColor White
Write-Host "  Customers: Invoke-RestMethod http://localhost:5003/api/customers" -ForegroundColor White

Write-Host "`nPress Ctrl+C to stop monitoring. Services will continue running in background." -ForegroundColor Yellow

# Keep script running to monitor
try {
    while ($true) {
        Start-Sleep -Seconds 30
        
        # Check if processes are still running
        $runningCount = 0
        foreach ($proc in $processes) {
            if (Get-Process -Id $proc.ProcessId -ErrorAction SilentlyContinue) {
                $runningCount++
            }
        }
        
        Write-Host "$(Get-Date -Format 'HH:mm:ss') - $runningCount/$($processes.Count) services running" -ForegroundColor Gray
    }
}
catch {
    Write-Host "`nMonitoring stopped. Services are still running in background." -ForegroundColor Yellow
}
