# Simple Connection String Fix Script
Write-Host "🔧 Fixing Connection Strings" -ForegroundColor Blue

# PostgreSQL services
$pgServices = @{
    "inventory-service" = "Host=localhost;Port=5433;Database=inventory_db;Username=postgres;Password=password"
    "order-service" = "Host=localhost;Port=5434;Database=order_db;Username=postgres;Password=password"
    "customer-service" = "Host=localhost;Port=5435;Database=customer_db;Username=postgres;Password=password"
    "payment-service" = "Host=localhost;Port=5438;Database=payment_db;Username=postgres;Password=password"
    "notification-service" = "Host=localhost;Port=5439;Database=notification_db;Username=postgres;Password=password"
    "reporting-service" = "Host=localhost;Port=5436;Database=reporting_db;Username=postgres;Password=password"
    "alert-service" = "Host=localhost;Port=5437;Database=alert_db;Username=postgres;Password=password"
}

# MongoDB connection
$mongoConnection = "mongodb://admin:admin123@localhost:27017/warehouse_management?authSource=admin"

Write-Host "🔄 Updating PostgreSQL services..." -ForegroundColor Cyan

foreach ($service in $pgServices.Keys) {
    $path = "services/$service/appsettings.json"
    if (Test-Path $path) {
        try {
            $json = Get-Content $path -Raw | ConvertFrom-Json
            if (-not $json.ConnectionStrings) {
                $json | Add-Member -Type NoteProperty -Name "ConnectionStrings" -Value @{}
            }
            $json.ConnectionStrings.DefaultConnection = $pgServices[$service]
            $json | ConvertTo-Json -Depth 10 | Set-Content $path -Encoding UTF8
            Write-Host "✅ Updated $service" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Failed $service" -ForegroundColor Red
        }
    }
}

Write-Host "🔄 Updating MongoDB services..." -ForegroundColor Cyan

$mongoServices = @("user-service", "product-service")
foreach ($service in $mongoServices) {
    $path = "services/$service/appsettings.json"
    if (Test-Path $path) {
        try {
            $json = Get-Content $path -Raw | ConvertFrom-Json
            if (-not $json.ConnectionStrings) {
                $json | Add-Member -Type NoteProperty -Name "ConnectionStrings" -Value @{}
            }
            $json.ConnectionStrings.MongoDB = $mongoConnection
            if ($json.MongoDbSettings) {
                $json.MongoDbSettings.ConnectionString = $mongoConnection
            }
            $json | ConvertTo-Json -Depth 10 | Set-Content $path -Encoding UTF8
            Write-Host "✅ Updated $service" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Failed $service" -ForegroundColor Red
        }
    }
}

Write-Host "🎉 Connection strings updated!" -ForegroundColor Green
