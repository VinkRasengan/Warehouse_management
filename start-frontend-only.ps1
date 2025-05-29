# Start Frontend Only - Simple Version
Write-Host "Starting Frontend Only..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "frontend")) {
    Write-Host "Error: frontend directory not found!" -ForegroundColor Red
    Write-Host "Make sure you're in the Warehouse_management directory" -ForegroundColor Yellow
    exit 1
}

# Check Node.js
if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Node.js not found!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host "Node.js version: $(node --version)" -ForegroundColor Green
Write-Host "npm version: $(npm --version)" -ForegroundColor Green

# Navigate to frontend
Set-Location "frontend"

Write-Host "`nChecking frontend setup..." -ForegroundColor Blue

# Check package.json
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found!" -ForegroundColor Red
    exit 1
}

# Install dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies... (this may take a few minutes)" -ForegroundColor Yellow
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to install dependencies!" -ForegroundColor Red
        Write-Host "Try running: npm cache clean --force" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "Dependencies already installed" -ForegroundColor Green
}

# Create .env file
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
Write-Host "This will open your browser automatically" -ForegroundColor Yellow
Write-Host "`nFrontend URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host "`nDemo Login (when backend is running):" -ForegroundColor Magenta
Write-Host "  Email: admin@warehouse.com" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host "`nNote: Backend services need to be running for full functionality" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray

# Start the server
npm start
