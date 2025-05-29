# Debug Warehouse Management System
Write-Host "Debugging Warehouse Management System..." -ForegroundColor Green

Write-Host "`n=== SYSTEM CHECK ===" -ForegroundColor Blue

# Check .NET
if (Get-Command "dotnet" -ErrorAction SilentlyContinue) {
    $dotnetVersion = dotnet --version
    Write-Host "✅ .NET: $dotnetVersion" -ForegroundColor Green
} else {
    Write-Host "❌ .NET not found" -ForegroundColor Red
}

# Check Node.js
if (Get-Command "node" -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found" -ForegroundColor Red
}

# Check Docker
if (Get-Command "docker" -ErrorAction SilentlyContinue) {
    Write-Host "✅ Docker available" -ForegroundColor Green
    try {
        docker info | Out-Null
        Write-Host "✅ Docker running" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Docker not running" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️ Docker not found" -ForegroundColor Yellow
}

Write-Host "`n=== DIRECTORY CHECK ===" -ForegroundColor Blue

# Check directories
$directories = @(
    "services/product-service",
    "services/customer-service", 
    "frontend"
)

foreach ($dir in $directories) {
    if (Test-Path $dir) {
        Write-Host "✅ $dir exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $dir missing" -ForegroundColor Red
    }
}

Write-Host "`n=== PORT CHECK ===" -ForegroundColor Blue

# Check if ports are in use
$ports = @(3000, 5001, 5004, 5432, 5672)

foreach ($port in $ports) {
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue
        if ($connection) {
            Write-Host "✅ Port $port is in use" -ForegroundColor Green
        } else {
            Write-Host "❌ Port $port is free" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Port $port is free" -ForegroundColor Red
    }
}

Write-Host "`n=== DOCKER CONTAINERS ===" -ForegroundColor Blue

try {
    $containers = docker ps --format "table {{.Names}}\t{{.Status}}"
    if ($containers) {
        Write-Host $containers -ForegroundColor White
    } else {
        Write-Host "No containers running" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Cannot check Docker containers" -ForegroundColor Red
}

Write-Host "`n=== RUNNING PROCESSES ===" -ForegroundColor Blue

# Check dotnet processes
$dotnetProcesses = Get-Process -Name "dotnet" -ErrorAction SilentlyContinue
if ($dotnetProcesses) {
    Write-Host "✅ .NET processes running:" -ForegroundColor Green
    $dotnetProcesses | ForEach-Object { Write-Host "  PID: $($_.Id)" -ForegroundColor White }
} else {
    Write-Host "❌ No .NET processes running" -ForegroundColor Red
}

# Check node processes
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "✅ Node.js processes running:" -ForegroundColor Green
    $nodeProcesses | ForEach-Object { Write-Host "  PID: $($_.Id)" -ForegroundColor White }
} else {
    Write-Host "❌ No Node.js processes running" -ForegroundColor Red
}

Write-Host "`n=== RECOMMENDATIONS ===" -ForegroundColor Magenta

if (-not (Get-Process -Name "dotnet" -ErrorAction SilentlyContinue)) {
    Write-Host "1. Start Docker services first:" -ForegroundColor Yellow
    Write-Host "   docker-compose up -d" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Then start backend services:" -ForegroundColor Yellow
    Write-Host "   cd services/product-service && dotnet run --urls http://localhost:5001" -ForegroundColor White
    Write-Host "   cd services/customer-service && dotnet run --urls http://localhost:5004" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Finally start frontend:" -ForegroundColor Yellow
    Write-Host "   cd frontend && npm start" -ForegroundColor White
}

Write-Host "`nPress any key to continue..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
