# PowerShell script to host services on network (accessible from other machines)
Write-Host "🌐 Starting Warehouse Management System for Network Access..." -ForegroundColor Green

# Get local IP address
$localIP = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi" | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*" -or $_.IPAddress -like "172.*"}).IPAddress
if (-not $localIP) {
    $localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*" -or $_.IPAddress -like "172.*"}).IPAddress | Select-Object -First 1
}

Write-Host "🔍 Local IP Address: $localIP" -ForegroundColor Cyan

# Function to start a service with network binding
function Start-NetworkService {
    param(
        [string]$ServiceName,
        [string]$ServicePath,
        [int]$Port
    )
    
    Write-Host "📦 Starting $ServiceName on $localIP`:$Port..." -ForegroundColor Yellow
    
    # Start service accessible from network
    $urls = "http://0.0.0.0:$Port;http://localhost:$Port;http://$localIP`:$Port"
    $command = "Set-Location '$ServicePath'; `$env:ASPNETCORE_URLS='$urls'; dotnet run"
    Start-Process powershell -ArgumentList "-NoExit", "-WindowStyle", "Minimized", "-Command", $command
    
    Write-Host "  ✅ $ServiceName accessible at:" -ForegroundColor Green
    Write-Host "    - Local: http://localhost:$Port/swagger" -ForegroundColor White
    Write-Host "    - Network: http://$localIP`:$Port/swagger" -ForegroundColor White
    Start-Sleep -Seconds 2
}

# Stop existing services
Write-Host "🛑 Stopping existing services..." -ForegroundColor Yellow
Get-Process -Name "dotnet" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Configure Windows Firewall (requires admin)
Write-Host "🔥 Configuring Windows Firewall..." -ForegroundColor Blue
try {
    New-NetFirewallRule -DisplayName "Warehouse Management - Product Service" -Direction Inbound -Protocol TCP -LocalPort 5001 -Action Allow -ErrorAction SilentlyContinue
    New-NetFirewallRule -DisplayName "Warehouse Management - Inventory Service" -Direction Inbound -Protocol TCP -LocalPort 5002 -Action Allow -ErrorAction SilentlyContinue
    New-NetFirewallRule -DisplayName "Warehouse Management - Order Service" -Direction Inbound -Protocol TCP -LocalPort 5003 -Action Allow -ErrorAction SilentlyContinue
    New-NetFirewallRule -DisplayName "Warehouse Management - Customer Service" -Direction Inbound -Protocol TCP -LocalPort 5004 -Action Allow -ErrorAction SilentlyContinue
    New-NetFirewallRule -DisplayName "Warehouse Management - Payment Service" -Direction Inbound -Protocol TCP -LocalPort 5005 -Action Allow -ErrorAction SilentlyContinue
    New-NetFirewallRule -DisplayName "Warehouse Management - Notification Service" -Direction Inbound -Protocol TCP -LocalPort 5006 -Action Allow -ErrorAction SilentlyContinue
    New-NetFirewallRule -DisplayName "Warehouse Management - Reporting Service" -Direction Inbound -Protocol TCP -LocalPort 5007 -Action Allow -ErrorAction SilentlyContinue
    New-NetFirewallRule -DisplayName "Warehouse Management - Alert Service" -Direction Inbound -Protocol TCP -LocalPort 5008 -Action Allow -ErrorAction SilentlyContinue
    Write-Host "  ✅ Firewall rules added" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Could not add firewall rules (run as Administrator for automatic setup)" -ForegroundColor Yellow
}

# Start all services with network binding
$services = @(
    @{Name="Product Service"; Path="C:\Project\Warehouse_management\services\product-service"; Port=5001},
    @{Name="Inventory Service"; Path="C:\Project\Warehouse_management\services\inventory-service"; Port=5002},
    @{Name="Order Service"; Path="C:\Project\Warehouse_management\services\order-service"; Port=5003},
    @{Name="Customer Service"; Path="C:\Project\Warehouse_management\services\customer-service"; Port=5004},
    @{Name="Payment Service"; Path="C:\Project\Warehouse_management\services\payment-service"; Port=5005},
    @{Name="Notification Service"; Path="C:\Project\Warehouse_management\services\notification-service"; Port=5006},
    @{Name="Reporting Service"; Path="C:\Project\Warehouse_management\services\reporting-service"; Port=5007},
    @{Name="Alert Service"; Path="C:\Project\Warehouse_management\services\alert-service"; Port=5008}
)

foreach ($service in $services) {
    Start-NetworkService -ServiceName $service.Name -ServicePath $service.Path -Port $service.Port
}

Write-Host "`n⏳ Waiting for all services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "`n🎉 All services started and accessible from network!" -ForegroundColor Green

Write-Host "`n📊 Network Access URLs:" -ForegroundColor Blue
foreach ($service in $services) {
    Write-Host "  $($service.Name): http://$localIP`:$($service.Port)/swagger" -ForegroundColor White
}

Write-Host "`n🔗 Share these URLs with other users on your network:" -ForegroundColor Cyan
Write-Host "  Product Service: http://$localIP`:5001/swagger" -ForegroundColor White
Write-Host "  Customer Service: http://$localIP`:5004/swagger" -ForegroundColor White
Write-Host "  Order Service: http://$localIP`:5003/swagger" -ForegroundColor White

Write-Host "`n📱 Mobile/Tablet Access:" -ForegroundColor Magenta
Write-Host "  Use the same URLs above on mobile devices connected to the same WiFi" -ForegroundColor White

Write-Host "`n🛡️ Security Note:" -ForegroundColor Red
Write-Host "  These services are now accessible from your local network" -ForegroundColor White
Write-Host "  Make sure your network is secure before sharing access" -ForegroundColor White
