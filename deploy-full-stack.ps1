# Full Stack Deployment Script
# This script deploys the complete warehouse management system with all features

param(
    [switch]$Infrastructure,
    [switch]$Configure,
    [switch]$Services,
    [switch]$Frontend,
    [switch]$All,
    [switch]$Stop
)

Write-Host "Full Stack Warehouse Management System Deployment" -ForegroundColor Blue

if ($Stop) {
    Write-Host "Stopping all services..." -ForegroundColor Red
    
    # Stop infrastructure
    if (Test-Path "docker-compose.infrastructure.yml") {
        docker-compose -f docker-compose.infrastructure.yml down
    }
    
    # Stop application services
    .\stop-local-services.ps1
    
    Write-Host "All services stopped" -ForegroundColor Green
    exit 0
}

if ($All) {
    $Infrastructure = $true
    $Configure = $true
    $Services = $true
    $Frontend = $true
}

# Step 1: Setup Infrastructure
if ($Infrastructure -or $All) {
    Write-Host "`n=== STEP 1: Setting up Infrastructure ===" -ForegroundColor Magenta
    .\setup-infrastructure.ps1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Infrastructure setup failed" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Waiting for infrastructure to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
}

# Step 2: Configure Services
if ($Configure -or $All) {
    Write-Host "`n=== STEP 2: Configuring Services ===" -ForegroundColor Magenta
    .\configure-services.ps1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Service configuration failed" -ForegroundColor Red
        exit 1
    }
}

# Step 3: Deploy Application Services
if ($Services -or $All) {
    Write-Host "`n=== STEP 3: Deploying Application Services ===" -ForegroundColor Magenta
    .\deploy-local-simple.ps1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Service deployment failed" -ForegroundColor Red
        exit 1
    }
}

# Step 4: Deploy Frontend
if ($Frontend -or $All) {
    Write-Host "`n=== STEP 4: Deploying Frontend ===" -ForegroundColor Magenta
    
    if (Test-Path "frontend") {
        Set-Location "frontend"
        
        # Install dependencies if needed
        if (-not (Test-Path "node_modules")) {
            Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
            npm install
        }
        
        # Start frontend in background
        Write-Host "Starting frontend..." -ForegroundColor Yellow
        Start-Process "npm" -ArgumentList "start" -WindowStyle Minimized
        
        Set-Location ".."
        Write-Host "Frontend started successfully" -ForegroundColor Green
    }
}

# Display final status
Write-Host "`n=== DEPLOYMENT COMPLETED ===" -ForegroundColor Green

Write-Host "`nInfrastructure Services:" -ForegroundColor Blue
Write-Host "  PostgreSQL: localhost:5432" -ForegroundColor White
Write-Host "  MongoDB: localhost:27017" -ForegroundColor White
Write-Host "  Redis: localhost:6379" -ForegroundColor White
Write-Host "  RabbitMQ: localhost:5672" -ForegroundColor White
Write-Host "  RabbitMQ Management: http://localhost:15672" -ForegroundColor White
Write-Host "  pgAdmin: http://localhost:8080" -ForegroundColor White

Write-Host "`nApplication Services:" -ForegroundColor Blue
Write-Host "  API Gateway: http://localhost:5000" -ForegroundColor White
Write-Host "  User Service: http://localhost:5100/swagger" -ForegroundColor White
Write-Host "  Product Service: http://localhost:5101/swagger" -ForegroundColor White
Write-Host "  Inventory Service: http://localhost:5102/swagger" -ForegroundColor White
Write-Host "  Order Service: http://localhost:5103/swagger" -ForegroundColor White
Write-Host "  Customer Service: http://localhost:5104/swagger" -ForegroundColor White
Write-Host "  Payment Service: http://localhost:5107/swagger" -ForegroundColor White
Write-Host "  Notification Service: http://localhost:5108/swagger" -ForegroundColor White

Write-Host "`nFrontend:" -ForegroundColor Blue
Write-Host "  React Application: http://localhost:3000" -ForegroundColor White

Write-Host "`nManagement Commands:" -ForegroundColor Yellow
Write-Host "  Stop all: .\deploy-full-stack.ps1 -Stop" -ForegroundColor White
Write-Host "  Infrastructure only: .\setup-infrastructure.ps1" -ForegroundColor White
Write-Host "  Services only: .\deploy-local-simple.ps1" -ForegroundColor White

Write-Host "`nYour warehouse management system is now fully operational!" -ForegroundColor Green
