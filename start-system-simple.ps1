# Simple Warehouse Management System Launcher
Write-Host "Starting Warehouse Management System..." -ForegroundColor Green

# Function to check if a command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

Write-Host "`nChecking system requirements..." -ForegroundColor Blue

# Check Node.js
if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Host "Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check .NET
if (Test-Command "dotnet") {
    $dotnetVersion = dotnet --version
    Write-Host ".NET: $dotnetVersion" -ForegroundColor Green
} else {
    Write-Host ".NET not found. Please install .NET 8 SDK" -ForegroundColor Red
    exit 1
}

Write-Host "`nSetting up Frontend..." -ForegroundColor Blue

# Setup Frontend
if (Test-Path "frontend") {
    Set-Location "frontend"
    
    # Install frontend dependencies
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
        npm install
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Frontend dependencies installed" -ForegroundColor Green
        } else {
            Write-Host "Failed to install frontend dependencies" -ForegroundColor Red
            Set-Location ".."
            exit 1
        }
    } else {
        Write-Host "Frontend dependencies already installed" -ForegroundColor Green
    }
    
    # Create .env file
    if (-not (Test-Path ".env")) {
        $envContent = @"
REACT_APP_API_URL=http://localhost:5004/api
REACT_APP_ENVIRONMENT=development
REACT_APP_NAME=Warehouse Management System
REACT_APP_VERSION=1.0.0
"@
        $envContent | Out-File -FilePath ".env" -Encoding UTF8
        Write-Host "Frontend .env file created" -ForegroundColor Green
    }
    
    Set-Location ".."
} else {
    Write-Host "Frontend directory not found!" -ForegroundColor Red
}

Write-Host "`nSetting up Backend Services..." -ForegroundColor Blue

# Setup Backend Services
$services = @("product-service", "inventory-service", "order-service", "customer-service")

foreach ($service in $services) {
    $servicePath = "services/$service"
    if (Test-Path $servicePath) {
        Write-Host "Building $service..." -ForegroundColor Yellow
        Set-Location $servicePath
        
        # Restore packages
        dotnet restore
        if ($LASTEXITCODE -eq 0) {
            Write-Host "$service packages restored" -ForegroundColor Green
        } else {
            Write-Host "Failed to restore $service packages" -ForegroundColor Red
        }
        
        Set-Location "../.."
    } else {
        Write-Host "$service directory not found" -ForegroundColor Yellow
    }
}

Write-Host "`nStarting all services..." -ForegroundColor Blue

# Start Backend Services
Write-Host "Starting backend services..." -ForegroundColor Yellow

$backendJobs = @()

foreach ($service in $services) {
    $servicePath = "services/$service"
    if (Test-Path $servicePath) {
        $port = switch ($service) {
            "product-service" { 5001 }
            "inventory-service" { 5002 }
            "order-service" { 5003 }
            "customer-service" { 5004 }
            default { 5000 }
        }
        
        Write-Host "Starting $service on port $port..." -ForegroundColor Gray
        
        # Start service in background
        $job = Start-Job -ScriptBlock {
            param($servicePath, $port)
            Set-Location $servicePath
            $env:ASPNETCORE_URLS = "http://localhost:$port"
            dotnet run
        } -ArgumentList (Resolve-Path $servicePath), $port
        
        $backendJobs += $job
        Start-Sleep -Seconds 2
    }
}

# Wait for backend services to start
Write-Host "Waiting for backend services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Start Frontend
Write-Host "`nStarting Frontend..." -ForegroundColor Blue

if (Test-Path "frontend") {
    Set-Location "frontend"
    
    Write-Host "Starting React development server..." -ForegroundColor Yellow
    Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
    
    # Start frontend in background
    $frontendJob = Start-Job -ScriptBlock {
        Set-Location "frontend"
        npm start
    }
    
    Set-Location ".."
    Start-Sleep -Seconds 10
}

Write-Host "`nSystem Setup Complete!" -ForegroundColor Green

Write-Host "`nAccess URLs:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Product Service: http://localhost:5001/swagger" -ForegroundColor White
Write-Host "  Inventory Service: http://localhost:5002/swagger" -ForegroundColor White
Write-Host "  Order Service: http://localhost:5003/swagger" -ForegroundColor White
Write-Host "  Customer Service: http://localhost:5004/swagger" -ForegroundColor White

Write-Host "`nDemo Login:" -ForegroundColor Blue
Write-Host "  Email: admin@warehouse.com" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White

Write-Host "`nManagement Commands:" -ForegroundColor Magenta
Write-Host "  Stop all services: Get-Process -Name 'dotnet','node' | Stop-Process -Force" -ForegroundColor White

Write-Host "`nHappy coding! Your Warehouse Management System is ready!" -ForegroundColor Green

# Keep script running to monitor services
Write-Host "`nPress Ctrl+C to stop all services..." -ForegroundColor Yellow
try {
    while ($true) {
        Start-Sleep -Seconds 30
        Write-Host "$(Get-Date -Format 'HH:mm:ss') - System running..." -ForegroundColor Gray
    }
} finally {
    Write-Host "`nStopping all services..." -ForegroundColor Yellow
    $backendJobs | Stop-Job
    if ($frontendJob) { $frontendJob | Stop-Job }
    Get-Process -Name "dotnet","node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "All services stopped" -ForegroundColor Green
}
