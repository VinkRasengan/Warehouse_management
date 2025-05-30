# Stop Local Services Script
# This script stops all running warehouse management services

Write-Host "🛑 Stopping Warehouse Management System Services" -ForegroundColor Red

# Function to stop processes by name
function Stop-ProcessesByName {
    param([string]$ProcessName)
    
    $processes = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
    if ($processes) {
        Write-Host "🔄 Stopping $($processes.Count) $ProcessName process(es)..." -ForegroundColor Yellow
        $processes | Stop-Process -Force
        Write-Host "✅ Stopped $ProcessName processes" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  No $ProcessName processes found" -ForegroundColor Gray
    }
}

# Function to stop processes by port
function Stop-ProcessesByPort {
    param([int[]]$Ports)
    
    foreach ($port in $Ports) {
        try {
            $netstat = netstat -ano | Select-String ":$port "
            if ($netstat) {
                $pid = ($netstat -split '\s+')[-1]
                if ($pid -and $pid -ne "0") {
                    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                    if ($process) {
                        Write-Host "🔄 Stopping process on port $port (PID: $pid)..." -ForegroundColor Yellow
                        Stop-Process -Id $pid -Force
                        Write-Host "✅ Stopped process on port $port" -ForegroundColor Green
                    }
                }
            }
        } catch {
            Write-Host "⚠️  Could not stop process on port $port" -ForegroundColor Orange
        }
    }
}

# Stop .NET processes
Write-Host "`n🔄 Stopping .NET services..." -ForegroundColor Blue
Stop-ProcessesByName "dotnet"

# Stop Node.js processes (frontend)
Write-Host "`n🔄 Stopping Node.js services..." -ForegroundColor Blue
Stop-ProcessesByName "node"

# Stop specific ports used by the application
Write-Host "`n🔄 Stopping services by port..." -ForegroundColor Blue
$servicePorts = @(3000, 5000, 5100, 5101, 5102, 5103, 5104, 5105, 5106, 5107, 5108)
Stop-ProcessesByPort $servicePorts

Write-Host "`n🎉 All services stopped successfully!" -ForegroundColor Green
Write-Host "💡 You can now restart services using .\deploy-local-simple.ps1" -ForegroundColor Cyan
