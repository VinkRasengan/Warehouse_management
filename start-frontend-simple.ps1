# Simple Frontend Launcher
Write-Host "Starting Frontend..." -ForegroundColor Green

# Check Node.js
if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

Write-Host "Node.js version: $(node --version)" -ForegroundColor Green

# Check if frontend directory exists
if (-not (Test-Path "frontend")) {
    Write-Host "Frontend directory not found!" -ForegroundColor Red
    exit 1
}

# Navigate to frontend directory
Set-Location "frontend"

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install dependencies!" -ForegroundColor Red
        exit 1
    }
}

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    
    $envContent = @"
REACT_APP_API_URL=http://localhost:5004/api
REACT_APP_ENVIRONMENT=development
REACT_APP_NAME=Warehouse Management System
REACT_APP_VERSION=1.0.0
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host ".env file created" -ForegroundColor Green
}

# Start React development server
Write-Host "`nStarting React development server..." -ForegroundColor Blue
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "`nDemo Login:" -ForegroundColor Yellow
Write-Host "  Email: admin@warehouse.com" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White

npm start
