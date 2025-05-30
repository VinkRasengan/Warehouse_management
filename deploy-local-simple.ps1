# Simple Local Deployment Script (No Docker Required)
# This script runs all services locally for development/testing

param(
    [switch]$SkipBuild,
    [switch]$SkipDatabases,
    [string]$Environment = "Development"
)

Write-Host "Starting Local Warehouse Management System Deployment" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Cyan

# Function to check if port is available
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

# Function to start a service in background
function Start-Service {
    param(
        [string]$ServicePath,
        [string]$ServiceName,
        [int]$Port
    )
    
    Write-Host "Starting $ServiceName on port $Port..." -ForegroundColor Yellow

    if (Test-Port $Port) {
        Write-Host "Port $Port is already in use. Skipping $ServiceName" -ForegroundColor Orange
        return
    }
    
    $processArgs = @{
        FilePath = "dotnet"
        ArgumentList = "run", "--project", $ServicePath, "--urls", "http://localhost:$Port"
        WindowStyle = "Minimized"
        PassThru = $true
    }
    
    $process = Start-Process @processArgs
    Start-Sleep -Seconds 2
    
    if ($process.HasExited) {
        Write-Host "Failed to start $ServiceName" -ForegroundColor Red
    } else {
        Write-Host "$ServiceName started successfully (PID: $($process.Id))" -ForegroundColor Green
    }
    
    return $process
}

# Check prerequisites
Write-Host "`nChecking prerequisites..." -ForegroundColor Blue

# Check .NET
try {
    $dotnetVersion = dotnet --version
    Write-Host ".NET SDK: $dotnetVersion" -ForegroundColor Green
} catch {
    Write-Host ".NET SDK not found. Please install .NET 8.0 SDK" -ForegroundColor Red
    exit 1
}

# Check Node.js for frontend
try {
    $nodeVersion = node --version
    Write-Host "Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js not found. Frontend won't be available" -ForegroundColor Orange
}

# Build services if not skipped
if (-not $SkipBuild) {
    Write-Host "`nBuilding all services..." -ForegroundColor Blue
    
    $services = @(
        "api-gateway-dotnet",
        "services/user-service",
        "services/product-service",
        "services/inventory-service",
        "services/order-service",
        "services/customer-service",
        "services/payment-service",
        "services/notification-service"
        # Temporarily skipping problematic services:
        # "services/reporting-service",
        # "services/alert-service"
    )
    
    foreach ($service in $services) {
        if (Test-Path $service) {
            Write-Host "  Building $service..." -ForegroundColor Gray
            Set-Location $service
            dotnet build --configuration Release
            if ($LASTEXITCODE -ne 0) {
                Write-Host "Failed to build $service" -ForegroundColor Red
                Set-Location $PSScriptRoot
                exit 1
            }
            Set-Location $PSScriptRoot
        } else {
            Write-Host "Service not found: $service" -ForegroundColor Orange
        }
    }

    Write-Host "All services built successfully" -ForegroundColor Green
}

# Start infrastructure services info
if (-not $SkipDatabases) {
    Write-Host "`nInfrastructure Services Required:" -ForegroundColor Blue
    Write-Host "  For full functionality, you need:" -ForegroundColor Yellow
    Write-Host "  - PostgreSQL (multiple databases)" -ForegroundColor White
    Write-Host "  - MongoDB (for user service)" -ForegroundColor White
    Write-Host "  - Redis (for caching)" -ForegroundColor White
    Write-Host "  - RabbitMQ (for messaging)" -ForegroundColor White
    Write-Host "`n  Consider using Docker for infrastructure:" -ForegroundColor Cyan
    Write-Host "     docker-compose up -d postgres-product postgres-inventory mongodb redis rabbitmq" -ForegroundColor Gray
}

# Start services
Write-Host "`nStarting application services..." -ForegroundColor Blue

$processes = @()

# Start API Gateway
$processes += Start-Service "api-gateway-dotnet" "API Gateway" 5000

# Start microservices
$serviceConfigs = @(
    @{ Path = "services/user-service"; Name = "User Service"; Port = 5100 },
    @{ Path = "services/product-service"; Name = "Product Service"; Port = 5101 },
    @{ Path = "services/inventory-service"; Name = "Inventory Service"; Port = 5102 },
    @{ Path = "services/order-service"; Name = "Order Service"; Port = 5103 },
    @{ Path = "services/customer-service"; Name = "Customer Service"; Port = 5104 },
    @{ Path = "services/payment-service"; Name = "Payment Service"; Port = 5107 },
    @{ Path = "services/notification-service"; Name = "Notification Service"; Port = 5108 }
    # Temporarily skipping problematic services:
    # @{ Path = "services/reporting-service"; Name = "Reporting Service"; Port = 5105 },
    # @{ Path = "services/alert-service"; Name = "Alert Service"; Port = 5106 }
)

foreach ($config in $serviceConfigs) {
    if (Test-Path $config.Path) {
        $processes += Start-Service $config.Path $config.Name $config.Port
    }
}

# Start frontend if Node.js is available
try {
    if (Test-Path "frontend/package.json") {
        Write-Host "`nStarting Frontend..." -ForegroundColor Blue
        Set-Location "frontend"

        # Install dependencies if needed
        if (-not (Test-Path "node_modules")) {
            Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
            npm install
        }

        # Start frontend
        Write-Host "Starting React frontend on port 3000..." -ForegroundColor Yellow
        $frontendProcess = Start-Process "npm" -ArgumentList "start" -WindowStyle Minimized -PassThru
        $processes += $frontendProcess

        Set-Location $PSScriptRoot
        Write-Host "Frontend started successfully" -ForegroundColor Green
    }
} catch {
    Write-Host "Could not start frontend" -ForegroundColor Orange
}

# Display service URLs
Write-Host "`nService URLs:" -ForegroundColor Blue
Write-Host "  API Gateway: http://localhost:5000" -ForegroundColor White
Write-Host "  User Service: http://localhost:5100/swagger" -ForegroundColor White
Write-Host "  Product Service: http://localhost:5101/swagger" -ForegroundColor White
Write-Host "  Inventory Service: http://localhost:5102/swagger" -ForegroundColor White
Write-Host "  Order Service: http://localhost:5103/swagger" -ForegroundColor White
Write-Host "  Customer Service: http://localhost:5104/swagger" -ForegroundColor White
Write-Host "  Reporting Service: http://localhost:5105/swagger" -ForegroundColor White
Write-Host "  Alert Service: http://localhost:5106/swagger" -ForegroundColor White
Write-Host "  Payment Service: http://localhost:5107/swagger" -ForegroundColor White
Write-Host "  Notification Service: http://localhost:5108/swagger" -ForegroundColor White

if (Test-Path "frontend") {
    Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
}

Write-Host "`nManagement Info:" -ForegroundColor Magenta
Write-Host "  All services are running in background processes" -ForegroundColor White
Write-Host "  Check Windows Task Manager to see running processes" -ForegroundColor White
Write-Host "  Services will continue running until manually stopped" -ForegroundColor White

Write-Host "`nTo stop all services:" -ForegroundColor Red
Write-Host "  Run: .\stop-local-services.ps1" -ForegroundColor Gray

Write-Host "`nDeployment completed successfully!" -ForegroundColor Green
Write-Host "Open http://localhost:5000 to access the API Gateway" -ForegroundColor Cyan
Write-Host "Open http://localhost:3000 to access the Frontend (if available)" -ForegroundColor Cyan
