# Start Complete Warehouse Management System
Write-Host "STARTING COMPLETE WAREHOUSE MANAGEMENT SYSTEM" -ForegroundColor Blue
Write-Host "===============================================" -ForegroundColor Blue

# Function to check if a port is in use
function Test-Port {
    param($Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

# Function to wait for service to be ready
function Wait-ForService {
    param($ServiceName, $Port, $MaxWaitSeconds = 30)
    
    Write-Host "  Waiting for $ServiceName to be ready..." -ForegroundColor Yellow
    $waited = 0
    
    while ($waited -lt $MaxWaitSeconds) {
        if (Test-Port $Port) {
            Write-Host "  ✅ $ServiceName is ready on port $Port" -ForegroundColor Green
            return $true
        }
        Start-Sleep -Seconds 2
        $waited += 2
    }
    
    Write-Host "  ❌ $ServiceName failed to start within $MaxWaitSeconds seconds" -ForegroundColor Red
    return $false
}

Write-Host "`n🔍 CHECKING PREREQUISITES" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Check PostgreSQL
if (Test-Port 5432) {
    Write-Host "✅ PostgreSQL is running on port 5432" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL is not running. Please start PostgreSQL first." -ForegroundColor Red
    exit 1
}

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check .NET
try {
    $dotnetVersion = dotnet --version
    Write-Host "✅ .NET version: $dotnetVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ .NET not found. Please install .NET 8.0 SDK first." -ForegroundColor Red
    exit 1
}

Write-Host "`n🚀 STARTING BACKEND SERVICES" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

# Start backend services
$services = @{
    "inventory-service" = 5000
    "order-service" = 5002
    "customer-service" = 5003
}

$processes = @()

foreach ($serviceName in $services.Keys) {
    $port = $services[$serviceName]
    
    if (Test-Port $port) {
        Write-Host "⚠️  $serviceName is already running on port $port" -ForegroundColor Yellow
    } else {
        Write-Host "🔄 Starting $serviceName..." -ForegroundColor White
        
        try {
            $process = Start-Process -FilePath "powershell" -ArgumentList @(
                "-NoExit",
                "-Command",
                "cd 'services/$serviceName'; dotnet run --urls 'http://localhost:$port'"
            ) -PassThru -WindowStyle Minimized
            
            $processes += @{
                Name = $serviceName
                Port = $port
                ProcessId = $process.Id
                Process = $process
            }
            
            Write-Host "  ✅ $serviceName started (PID: $($process.Id))" -ForegroundColor Green
        } catch {
            Write-Host "  ❌ Failed to start $serviceName`: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`n⏳ WAITING FOR SERVICES TO BE READY" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Wait for all services to be ready
$allReady = $true
foreach ($serviceName in $services.Keys) {
    $port = $services[$serviceName]
    if (-not (Wait-ForService $serviceName $port)) {
        $allReady = $false
    }
}

if (-not $allReady) {
    Write-Host "`n❌ Some backend services failed to start. Please check the logs." -ForegroundColor Red
    exit 1
}

Write-Host "`n🎨 STARTING FRONTEND" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan

# Check if frontend exists
if (-not (Test-Path "warehouse-frontend")) {
    Write-Host "❌ Frontend directory not found. Run create-frontend.ps1 first." -ForegroundColor Red
    exit 1
}

# Start frontend
Write-Host "🔄 Starting React frontend..." -ForegroundColor White

try {
    $frontendProcess = Start-Process -FilePath "powershell" -ArgumentList @(
        "-NoExit",
        "-Command",
        "cd 'warehouse-frontend'; npm start"
    ) -PassThru -WindowStyle Normal
    
    Write-Host "  ✅ Frontend started (PID: $($frontendProcess.Id))" -ForegroundColor Green
    
    # Wait for frontend to be ready
    if (Wait-ForService "Frontend" 3000 60) {
        Write-Host "  ✅ Frontend is ready on http://localhost:3000" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Frontend may still be starting..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ❌ Failed to start frontend: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 SYSTEM STARTUP COMPLETE!" -ForegroundColor Green
Write-Host "===========================" -ForegroundColor Green

Write-Host "`n📋 ACCESS POINTS:" -ForegroundColor Blue
Write-Host "Frontend Application: http://localhost:3000" -ForegroundColor White
Write-Host "Backend Services:" -ForegroundColor White
foreach ($serviceName in $services.Keys) {
    $port = $services[$serviceName]
    Write-Host "  $serviceName`: http://localhost:$port/swagger" -ForegroundColor Gray
}

Write-Host "`n🔧 MANAGEMENT COMMANDS:" -ForegroundColor Blue
Write-Host "View running processes: Get-Process dotnet, node" -ForegroundColor White
Write-Host "Stop all services: Get-Process dotnet, node | Stop-Process" -ForegroundColor White
Write-Host "Test APIs: .\test-all-apis.ps1" -ForegroundColor White

Write-Host "`n💡 QUICK TESTS:" -ForegroundColor Blue
Write-Host "Test inventory API: Invoke-RestMethod http://localhost:5000/api/inventory" -ForegroundColor White
Write-Host "Test orders API: Invoke-RestMethod http://localhost:5002/api/orders" -ForegroundColor White
Write-Host "Test customers API: Invoke-RestMethod http://localhost:5003/api/customers" -ForegroundColor White

Write-Host "`n🌐 Opening frontend in browser..." -ForegroundColor Cyan
Start-Sleep -Seconds 3
Start-Process "http://localhost:3000"

Write-Host "`n✨ Warehouse Management System is now running!" -ForegroundColor Green
Write-Host "Press any key to continue monitoring or Ctrl+C to exit..." -ForegroundColor Yellow

# Keep script running for monitoring
try {
    while ($true) {
        Start-Sleep -Seconds 30
        
        # Check service health
        $healthyServices = 0
        foreach ($serviceName in $services.Keys) {
            $port = $services[$serviceName]
            if (Test-Port $port) {
                $healthyServices++
            }
        }
        
        $frontendHealthy = Test-Port 3000
        
        Write-Host "$(Get-Date -Format 'HH:mm:ss') - Backend: $healthyServices/$($services.Count) healthy, Frontend: $(if($frontendHealthy){'✅'}else{'❌'})" -ForegroundColor Gray
    }
} catch {
    Write-Host "`nMonitoring stopped. Services are still running in background." -ForegroundColor Yellow
}
