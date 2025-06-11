# Deploy Warehouse Management System with Docker
Write-Host "DEPLOYING WAREHOUSE MANAGEMENT SYSTEM - DOCKER" -ForegroundColor Blue
Write-Host "===============================================" -ForegroundColor Blue

# Check if Docker is running
try {
    docker version | Out-Null
    Write-Host "[OK] Docker is running" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check if docker-compose.yml exists
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "[ERROR] docker-compose.yml not found. Run docker-setup.ps1 first." -ForegroundColor Red
    exit 1
}

Write-Host "`nStopping existing containers..." -ForegroundColor Yellow
docker-compose down -v

Write-Host "`nBuilding and starting services..." -ForegroundColor Yellow
docker-compose up --build -d

Write-Host "`nWaiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host "`nChecking service status..." -ForegroundColor Cyan
$services = @{
    "postgres" = "5432"
    "mongodb" = "27017"
    "redis" = "6379"
    "rabbitmq" = "15672"
    "inventory-service" = "5000"
    "order-service" = "5002"
    "customer-service" = "5003"
    "payment-service" = "5004"
    "notification-service" = "5005"
    "alert-service" = "5006"
    "api-gateway" = "5001"
}

foreach ($service in $services.Keys) {
    $port = $services[$service]
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$port" -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
        Write-Host "  [OK] $service (port $port)" -ForegroundColor Green
    } catch {
        Write-Host "  [PENDING] $service (port $port)" -ForegroundColor Yellow
    }
}

Write-Host "`nDocker deployment completed!" -ForegroundColor Green
Write-Host "Access points:" -ForegroundColor White
Write-Host "  Inventory API: http://localhost:5000/swagger" -ForegroundColor Gray
Write-Host "  Order API: http://localhost:5002/swagger" -ForegroundColor Gray
Write-Host "  Customer API: http://localhost:5003/swagger" -ForegroundColor Gray
Write-Host "  API Gateway: http://localhost:5001" -ForegroundColor Gray
Write-Host "  RabbitMQ Management: http://localhost:15672 (warehouse_user/warehouse_pass)" -ForegroundColor Gray

Write-Host "`nUseful commands:" -ForegroundColor White
Write-Host "  View logs: docker-compose logs -f [service-name]" -ForegroundColor Gray
Write-Host "  Stop all: docker-compose down" -ForegroundColor Gray
Write-Host "  Restart: docker-compose restart [service-name]" -ForegroundColor Gray
