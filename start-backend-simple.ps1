# Simple Backend Services Launcher
Write-Host "Starting Backend Services..." -ForegroundColor Green

# Check .NET
if (-not (Get-Command "dotnet" -ErrorAction SilentlyContinue)) {
    Write-Host ".NET not found. Please install .NET 8 SDK" -ForegroundColor Red
    exit 1
}

Write-Host ".NET version: $(dotnet --version)" -ForegroundColor Green

# Services to start
$services = @(
    @{Name="Product Service"; Path="services/product-service"; Port=5001},
    @{Name="Customer Service"; Path="services/customer-service"; Port=5004}
)

Write-Host "`nStarting services..." -ForegroundColor Blue

foreach ($service in $services) {
    if (Test-Path $service.Path) {
        Write-Host "Starting $($service.Name) on port $($service.Port)..." -ForegroundColor Yellow
        
        # Start service in new window
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$($service.Path)'; dotnet run --urls 'http://localhost:$($service.Port)'"
        
        Start-Sleep -Seconds 3
    } else {
        Write-Host "$($service.Name) directory not found: $($service.Path)" -ForegroundColor Red
    }
}

Write-Host "`nBackend services are starting..." -ForegroundColor Green
Write-Host "Wait 30 seconds then check:" -ForegroundColor Yellow
Write-Host "  Product Service: http://localhost:5001/swagger" -ForegroundColor White
Write-Host "  Customer Service: http://localhost:5004/swagger" -ForegroundColor White

Write-Host "`nPress any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
