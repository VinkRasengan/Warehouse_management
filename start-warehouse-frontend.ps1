# Start Warehouse Management Frontend
Write-Host "STARTING WAREHOUSE MANAGEMENT FRONTEND" -ForegroundColor Blue
Write-Host "=======================================" -ForegroundColor Blue

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if frontend directory exists
if (-not (Test-Path "warehouse-frontend")) {
    Write-Host "[ERROR] Frontend directory not found. Run create-frontend.ps1 first." -ForegroundColor Red
    exit 1
}

Push-Location "warehouse-frontend"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "[INFO] Installing dependencies..." -ForegroundColor Yellow
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
        Pop-Location
        exit 1
    }
}

Write-Host "`nStarting development server..." -ForegroundColor Cyan
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor White
Write-Host "Make sure backend services are running on:" -ForegroundColor White
Write-Host "  - Inventory Service: http://localhost:5000" -ForegroundColor Gray
Write-Host "  - Order Service: http://localhost:5002" -ForegroundColor Gray
Write-Host "  - Customer Service: http://localhost:5003" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop the development server" -ForegroundColor Yellow
Write-Host ""

# Start the development server
npm start

Pop-Location
