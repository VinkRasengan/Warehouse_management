# Create React Frontend for Warehouse Management System
Write-Host "CREATING REACT FRONTEND" -ForegroundColor Blue
Write-Host "=======================" -ForegroundColor Blue

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js not found. Please install Node.js first." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm --version
    Write-Host "[OK] npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] npm not found." -ForegroundColor Red
    exit 1
}

# Create frontend directory
$frontendDir = "warehouse-frontend"
if (Test-Path $frontendDir) {
    Write-Host "[INFO] Frontend directory already exists. Removing..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $frontendDir
}

Write-Host "`nCreating React application..." -ForegroundColor Cyan
npx create-react-app $frontendDir --template typescript

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to create React app" -ForegroundColor Red
    exit 1
}

Push-Location $frontendDir

Write-Host "`nInstalling additional dependencies..." -ForegroundColor Cyan

# Install UI and utility libraries
$dependencies = @(
    "@mui/material",
    "@mui/icons-material", 
    "@emotion/react",
    "@emotion/styled",
    "@mui/x-data-grid",
    "@mui/x-date-pickers",
    "axios",
    "react-router-dom",
    "react-query",
    "@tanstack/react-query",
    "recharts",
    "date-fns",
    "react-hook-form",
    "@hookform/resolvers",
    "yup",
    "notistack"
)

foreach ($dep in $dependencies) {
    Write-Host "  Installing $dep..." -ForegroundColor White
    npm install $dep
}

# Install dev dependencies
$devDependencies = @(
    "@types/react-router-dom",
    "prettier",
    "eslint-config-prettier"
)

foreach ($dep in $devDependencies) {
    Write-Host "  Installing $dep (dev)..." -ForegroundColor White
    npm install --save-dev $dep
}

Write-Host "`nSetting up project structure..." -ForegroundColor Cyan

# Create directory structure
$directories = @(
    "src/components",
    "src/components/common",
    "src/components/inventory",
    "src/components/orders", 
    "src/components/customers",
    "src/components/dashboard",
    "src/pages",
    "src/services",
    "src/types",
    "src/hooks",
    "src/utils",
    "src/contexts",
    "src/assets",
    "public/assets"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
    Write-Host "  Created: $dir" -ForegroundColor Gray
}

Pop-Location

Write-Host "`n[SUCCESS] React frontend created successfully!" -ForegroundColor Green
Write-Host "Frontend location: $frontendDir" -ForegroundColor White
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. cd $frontendDir" -ForegroundColor White
Write-Host "  2. npm start" -ForegroundColor White
Write-Host "  3. Open http://localhost:3000" -ForegroundColor White

Write-Host "`nInstalled packages:" -ForegroundColor Cyan
Write-Host "  UI Framework: Material-UI (MUI)" -ForegroundColor White
Write-Host "  HTTP Client: Axios" -ForegroundColor White
Write-Host "  Routing: React Router" -ForegroundColor White
Write-Host "  State Management: React Query" -ForegroundColor White
Write-Host "  Charts: Recharts" -ForegroundColor White
Write-Host "  Forms: React Hook Form + Yup" -ForegroundColor White
Write-Host "  Notifications: Notistack" -ForegroundColor White
