# PowerShell script to start Warehouse Management Frontend
Write-Host "🎨 Starting Warehouse Management Frontend..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    Write-Host "📥 Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed." -ForegroundColor Red
    exit 1
}

# Navigate to frontend directory
if (Test-Path "frontend") {
    Set-Location "frontend"
    Write-Host "📁 Changed to frontend directory" -ForegroundColor Blue
} else {
    Write-Host "❌ Frontend directory not found!" -ForegroundColor Red
    exit 1
}

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found!" -ForegroundColor Red
    exit 1
}

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "⚙️ Creating .env file..." -ForegroundColor Yellow
    
    $envContent = @"
# API Configuration
REACT_APP_API_URL=http://localhost:5004/api
REACT_APP_ENVIRONMENT=development

# App Configuration
REACT_APP_NAME=Warehouse Management System
REACT_APP_VERSION=1.0.0

# Features
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_NOTIFICATIONS=true
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ .env file created" -ForegroundColor Green
}

# Start the development server
Write-Host "`n🚀 Starting React development server..." -ForegroundColor Green
Write-Host "📱 Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔗 Backend API should be running at: http://localhost:5004" -ForegroundColor Cyan

Write-Host "`n🎯 Demo Login Credentials:" -ForegroundColor Blue
Write-Host "   Email: admin@warehouse.com" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White

Write-Host "`n⏳ Starting server (this may take a moment)..." -ForegroundColor Yellow

# Start React development server
npm start

# If we reach here, the server has stopped
Write-Host "`n🛑 Frontend server stopped." -ForegroundColor Yellow
