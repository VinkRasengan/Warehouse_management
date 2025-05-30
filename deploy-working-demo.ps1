# Working Demo Deployment Script
# This script deploys a working demo of the warehouse management system

param(
    [switch]$Frontend,
    [switch]$SkipBuild,
    [string]$Port = "3000"
)

Write-Host "Deploying Warehouse Management System - Working Demo" -ForegroundColor Green
Write-Host "This demo focuses on the frontend and available services" -ForegroundColor Cyan

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

# Check prerequisites
Write-Host "`nChecking prerequisites..." -ForegroundColor Blue

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "Node.js: $nodeVersion" -ForegroundColor Green
    $nodeAvailable = $true
} catch {
    Write-Host "Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    $nodeAvailable = $false
}

# Check .NET
try {
    $dotnetVersion = dotnet --version
    Write-Host ".NET SDK: $dotnetVersion" -ForegroundColor Green
    $dotnetAvailable = $true
} catch {
    Write-Host ".NET SDK not found. Backend services won't be available" -ForegroundColor DarkYellow
    $dotnetAvailable = $false
}

if (-not $nodeAvailable) {
    Write-Host "`nCannot proceed without Node.js. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Deploy Frontend
if ($Frontend -or $nodeAvailable) {
    Write-Host "`nSetting up Frontend..." -ForegroundColor Blue

    if (Test-Path "frontend") {
        Set-Location "frontend"

        # Check if dependencies are installed
        if (-not (Test-Path "node_modules") -or -not $SkipBuild) {
            Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
            npm install

            if ($LASTEXITCODE -ne 0) {
                Write-Host "Failed to install frontend dependencies" -ForegroundColor Red
                Set-Location ".."
                exit 1
            }
            Write-Host "Frontend dependencies installed" -ForegroundColor Green
        }

        # Check if port is available
        if (Test-Port $Port) {
            Write-Host "Port $Port is already in use. Trying port 3001..." -ForegroundColor DarkYellow
            $Port = "3001"
            if (Test-Port $Port) {
                Write-Host "Port $Port is also in use. Please stop other services first." -ForegroundColor DarkYellow
                Set-Location ".."
                exit 1
            }
        }

        # Start frontend
        Write-Host "Starting React frontend on port $Port..." -ForegroundColor Yellow
        Write-Host "Frontend will be available at: http://localhost:$Port" -ForegroundColor Cyan
        Write-Host "Note: Backend services are not running, so some features may not work" -ForegroundColor DarkYellow
        Write-Host "`nStarting frontend server..." -ForegroundColor Blue

        # Set environment variable for port
        $env:PORT = $Port

        # Start the frontend
        npm start

        Set-Location ".."
    } else {
        Write-Host "Frontend directory not found" -ForegroundColor Red
    }
}

# Show available options
Write-Host "`nAvailable Deployment Options:" -ForegroundColor Blue
Write-Host "  1. Frontend Only (Current): .\deploy-working-demo.ps1 -Frontend" -ForegroundColor White
Write-Host "  2. Local Services: .\deploy-local-simple.ps1" -ForegroundColor White
Write-Host "  3. Docker Full Stack: .\deploy-docker-simple.ps1 -Build" -ForegroundColor White

Write-Host "`nAccess Points:" -ForegroundColor Magenta
Write-Host "  Frontend: http://localhost:$Port" -ForegroundColor White
Write-Host "  Dashboard: file:///$(Get-Location)/deployment-dashboard.html" -ForegroundColor White

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "  1. Open http://localhost:$Port to see the frontend" -ForegroundColor White
Write-Host "  2. For full functionality, set up databases and run backend services" -ForegroundColor White
Write-Host "  3. Use Docker deployment for complete system with all services" -ForegroundColor White

Write-Host "`nDemo deployment completed!" -ForegroundColor Green
