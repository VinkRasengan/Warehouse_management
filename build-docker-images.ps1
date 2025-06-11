# Build Docker Images for Warehouse Management System
Write-Host "BUILDING DOCKER IMAGES" -ForegroundColor Blue
Write-Host "======================" -ForegroundColor Blue

# Services to build
$services = @(
    @{Name="inventory-service"; Path="services/inventory-service"},
    @{Name="order-service"; Path="services/order-service"},
    @{Name="customer-service"; Path="services/customer-service"},
    @{Name="payment-service"; Path="services/payment-service"},
    @{Name="notification-service"; Path="services/notification-service"},
    @{Name="alert-service"; Path="services/alert-service"},
    @{Name="api-gateway"; Path="api-gateway-dotnet"}
)

$successCount = 0
$totalCount = $services.Count

foreach ($service in $services) {
    $serviceName = $service.Name
    $servicePath = $service.Path
    
    Write-Host "`nBuilding $serviceName..." -ForegroundColor Yellow
    
    if (-not (Test-Path $servicePath)) {
        Write-Host "  [SKIP] Service directory not found: $servicePath" -ForegroundColor Yellow
        continue
    }
    
    if (-not (Test-Path "$servicePath/Dockerfile")) {
        Write-Host "  [SKIP] Dockerfile not found: $servicePath/Dockerfile" -ForegroundColor Yellow
        continue
    }
    
    try {
        # Build Docker image
        $imageName = "warehouse/$serviceName`:latest"
        Write-Host "  Building image: $imageName" -ForegroundColor White
        
        docker build -t $imageName $servicePath
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] Successfully built $serviceName" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "  [ERROR] Failed to build $serviceName" -ForegroundColor Red
        }
    } catch {
        Write-Host "  [ERROR] Exception building $serviceName`: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nBuild Summary:" -ForegroundColor Blue
Write-Host "==============" -ForegroundColor Blue
Write-Host "  Successfully built: $successCount/$totalCount services" -ForegroundColor White

if ($successCount -eq $totalCount) {
    Write-Host "  [SUCCESS] All services built successfully!" -ForegroundColor Green
} else {
    Write-Host "  [WARNING] Some services failed to build" -ForegroundColor Yellow
}

Write-Host "`nBuilt Docker images:" -ForegroundColor Cyan
docker images | Select-String "warehouse/"

Write-Host "`nNext steps:" -ForegroundColor White
Write-Host "  1. Run: .\deploy-docker.ps1 (for Docker Compose)" -ForegroundColor Gray
Write-Host "  2. Run: .\deploy-k8s.ps1 (for Kubernetes)" -ForegroundColor Gray
Write-Host "  3. Push images to registry: docker push warehouse/[service-name]" -ForegroundColor Gray
