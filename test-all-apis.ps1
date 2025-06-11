# Test All APIs Script
Write-Host "Testing All Warehouse Management APIs" -ForegroundColor Blue
Write-Host "=====================================" -ForegroundColor Blue

# Services to test
$services = @{
    "inventory-service" = @{
        Port = 5000
        Endpoints = @(
            "/api/inventory",
            "/api/inventory/1",
            "/health"
        )
    }
    "order-service" = @{
        Port = 5002
        Endpoints = @(
            "/api/orders",
            "/api/orders/1",
            "/health"
        )
    }
    "customer-service" = @{
        Port = 5003
        Endpoints = @(
            "/api/customers",
            "/health"
        )
    }
    "payment-service" = @{
        Port = 5004
        Endpoints = @(
            "/api/payments",
            "/health"
        )
    }
    "notification-service" = @{
        Port = 5005
        Endpoints = @(
            "/api/notifications",
            "/health"
        )
    }
    "alert-service" = @{
        Port = 5006
        Endpoints = @(
            "/api/alerts",
            "/health"
        )
    }
}

$totalTests = 0
$passedTests = 0
$failedTests = 0

foreach ($serviceName in $services.Keys) {
    $config = $services[$serviceName]
    $port = $config.Port
    
    Write-Host "`nTesting $serviceName (port $port)..." -ForegroundColor Yellow
    
    foreach ($endpoint in $config.Endpoints) {
        $totalTests++
        $url = "http://localhost:$port$endpoint"
        
        try {
            $response = Invoke-RestMethod -Uri $url -Method GET -TimeoutSec 10
            Write-Host "  ✅ $endpoint - OK" -ForegroundColor Green
            $passedTests++
            
            # Show sample data for main endpoints
            if ($endpoint -like "*/api/*" -and $endpoint -notlike "*/health") {
                if ($response -is [Array] -and $response.Count -gt 0) {
                    Write-Host "    📊 Returned $($response.Count) items" -ForegroundColor Gray
                } elseif ($response -and $response.PSObject.Properties.Count -gt 0) {
                    Write-Host "    📊 Returned object with $($response.PSObject.Properties.Count) properties" -ForegroundColor Gray
                }
            }
        }
        catch {
            Write-Host "  ❌ $endpoint - Failed: $($_.Exception.Message)" -ForegroundColor Red
            $failedTests++
        }
    }
}

Write-Host "`n📊 Test Results Summary" -ForegroundColor Blue
Write-Host "========================" -ForegroundColor Blue
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red

if ($failedTests -eq 0) {
    Write-Host "`n🎉 All tests passed! All services are working correctly." -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Some tests failed. Check the services that are not responding." -ForegroundColor Yellow
}

Write-Host "`n🔗 Service URLs for manual testing:" -ForegroundColor Blue
foreach ($serviceName in $services.Keys) {
    $port = $services[$serviceName].Port
    Write-Host "  $serviceName Swagger: http://localhost:$port/swagger" -ForegroundColor White
}

Write-Host "`n💡 Sample API calls:" -ForegroundColor Blue
Write-Host "  # Get all inventory items" -ForegroundColor Gray
Write-Host "  Invoke-RestMethod http://localhost:5000/api/inventory" -ForegroundColor White
Write-Host ""
Write-Host "  # Get all orders" -ForegroundColor Gray
Write-Host "  Invoke-RestMethod http://localhost:5002/api/orders" -ForegroundColor White
Write-Host ""
Write-Host "  # Get specific inventory item" -ForegroundColor Gray
Write-Host "  Invoke-RestMethod http://localhost:5000/api/inventory/1" -ForegroundColor White
