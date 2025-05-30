# Docker Deployment Script for Warehouse Management System
# This script deploys the entire system using Docker Compose

param(
    [ValidateSet("development", "production")]
    [string]$Environment = "development",
    [switch]$Build,
    [switch]$Logs,
    [switch]$Stop
)

Write-Host "Docker Deployment for Warehouse Management System" -ForegroundColor Blue
Write-Host "Environment: $Environment" -ForegroundColor Cyan

# Function to check Docker installation
function Test-Docker {
    try {
        docker --version | Out-Null
        docker-compose --version | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Function to check if Docker is running
function Test-DockerRunning {
    try {
        docker info | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Stop services if requested
if ($Stop) {
    Write-Host "Stopping all Docker services..." -ForegroundColor Red
    docker-compose down -v
    if ($Environment -eq "production") {
        docker-compose -f docker-compose.production.yml down -v
    }
    Write-Host "All services stopped and volumes removed" -ForegroundColor Green
    exit 0
}

# Check prerequisites
Write-Host "`nChecking prerequisites..." -ForegroundColor Blue

if (-not (Test-Docker)) {
    Write-Host "Docker or Docker Compose not found!" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    Write-Host "Alternative: Use .\deploy-local-simple.ps1 for non-Docker deployment" -ForegroundColor Cyan
    exit 1
}

if (-not (Test-DockerRunning)) {
    Write-Host "Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again" -ForegroundColor Yellow
    exit 1
}

Write-Host "Docker is available and running" -ForegroundColor Green

# Select compose file based on environment
$composeFile = if ($Environment -eq "production") { "docker-compose.production.yml" } else { "docker-compose.yml" }

if (-not (Test-Path $composeFile)) {
    Write-Host "Compose file not found: $composeFile" -ForegroundColor Red
    exit 1
}

Write-Host "Using compose file: $composeFile" -ForegroundColor Green

# Build images if requested
if ($Build) {
    Write-Host "`nBuilding Docker images..." -ForegroundColor Blue
    if ($Environment -eq "production") {
        docker-compose -f $composeFile build --no-cache
    } else {
        docker-compose -f $composeFile build
    }

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to build images" -ForegroundColor Red
        exit 1
    }
    Write-Host "Images built successfully" -ForegroundColor Green
}

# Start services
Write-Host "`nStarting services..." -ForegroundColor Blue

if ($Environment -eq "production") {
    docker-compose -f $composeFile up -d
} else {
    docker-compose -f $composeFile up -d
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to start services" -ForegroundColor Red
    exit 1
}

# Wait for services to be ready
Write-Host "`nWaiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Health check
Write-Host "`nPerforming health checks..." -ForegroundColor Blue

$healthChecks = @(
    @{ Name = "API Gateway"; Url = "http://localhost:5000/health"; Port = 5000 },
    @{ Name = "Product Service"; Url = "http://localhost:5101/health"; Port = 5101 },
    @{ Name = "Inventory Service"; Url = "http://localhost:5102/health"; Port = 5102 },
    @{ Name = "Order Service"; Url = "http://localhost:5103/health"; Port = 5103 },
    @{ Name = "Customer Service"; Url = "http://localhost:5104/health"; Port = 5104 }
)

foreach ($check in $healthChecks) {
    try {
        $response = Invoke-WebRequest -Uri $check.Url -TimeoutSec 10 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "  $($check.Name) is healthy" -ForegroundColor Green
        } else {
            Write-Host "  $($check.Name) returned status $($response.StatusCode)" -ForegroundColor DarkYellow
        }
    } catch {
        Write-Host "  $($check.Name) is not responding" -ForegroundColor Red
    }
}

# Display service information
Write-Host "`nService URLs:" -ForegroundColor Blue
Write-Host "  API Gateway: http://localhost:5000" -ForegroundColor White
Write-Host "  API Gateway (HTTPS): https://localhost:5001" -ForegroundColor White
Write-Host "  User Service: http://localhost:5100/swagger" -ForegroundColor White
Write-Host "  Product Service: http://localhost:5101/swagger" -ForegroundColor White
Write-Host "  Inventory Service: http://localhost:5102/swagger" -ForegroundColor White
Write-Host "  Order Service: http://localhost:5103/swagger" -ForegroundColor White
Write-Host "  Customer Service: http://localhost:5104/swagger" -ForegroundColor White
Write-Host "  Reporting Service: http://localhost:5105/swagger" -ForegroundColor White
Write-Host "  Alert Service: http://localhost:5106/swagger" -ForegroundColor White
Write-Host "  Payment Service: http://localhost:5107/swagger" -ForegroundColor White
Write-Host "  Notification Service: http://localhost:5108/swagger" -ForegroundColor White

Write-Host "`nInfrastructure URLs:" -ForegroundColor Magenta
Write-Host "  RabbitMQ Management: http://localhost:15672 (admin/password)" -ForegroundColor White
Write-Host "  PostgreSQL Databases: localhost:5432-5439" -ForegroundColor White
Write-Host "  MongoDB: localhost:27017 (admin/admin123)" -ForegroundColor White
Write-Host "  Redis: localhost:6379" -ForegroundColor White

Write-Host "`nManagement Commands:" -ForegroundColor Yellow
Write-Host "  View logs: docker-compose -f $composeFile logs -f" -ForegroundColor White
Write-Host "  Restart: docker-compose -f $composeFile restart" -ForegroundColor White
Write-Host "  Stop: .\deploy-docker-simple.ps1 -Stop" -ForegroundColor White
Write-Host "  Status: docker-compose -f $composeFile ps" -ForegroundColor White

# Show logs if requested
if ($Logs) {
    Write-Host "`nShowing service logs..." -ForegroundColor Blue
    docker-compose -f $composeFile logs -f
}

Write-Host "`nDocker deployment completed successfully!" -ForegroundColor Green
Write-Host "Open http://localhost:5000 to access the API Gateway" -ForegroundColor Cyan
Write-Host "Open http://localhost:15672 to access RabbitMQ Management" -ForegroundColor Cyan
