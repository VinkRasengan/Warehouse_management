# Fix Connection Strings Script
# This script updates all connection strings to match the docker-compose configuration

Write-Host "🔧 Fixing Connection Strings" -ForegroundColor Blue
Write-Host "============================" -ForegroundColor Blue

# Define correct connection strings based on docker-compose.yml
$connectionStrings = @{
    "inventory-service" = "Host=localhost;Port=5433;Database=inventory_db;Username=postgres;Password=password"
    "order-service" = "Host=localhost;Port=5434;Database=order_db;Username=postgres;Password=password"
    "customer-service" = "Host=localhost;Port=5435;Database=customer_db;Username=postgres;Password=password"
    "payment-service" = "Host=localhost;Port=5438;Database=payment_db;Username=postgres;Password=password"
    "notification-service" = "Host=localhost;Port=5439;Database=notification_db;Username=postgres;Password=password"
    "reporting-service" = "Host=localhost;Port=5436;Database=reporting_db;Username=postgres;Password=password"
    "alert-service" = "Host=localhost;Port=5437;Database=alert_db;Username=postgres;Password=password"
}

$mongoConnectionString = "mongodb://admin:admin123@localhost:27017/warehouse_management?authSource=admin"

# Update PostgreSQL services
Write-Host "`n🔄 Updating PostgreSQL connection strings..." -ForegroundColor Cyan

foreach ($serviceName in $connectionStrings.Keys) {
    Write-Host "📦 Processing $serviceName..." -ForegroundColor Yellow

    $appSettingsPath = "services/$serviceName/appsettings.json"

    if (Test-Path $appSettingsPath) {
        try {
            $content = Get-Content $appSettingsPath -Raw | ConvertFrom-Json

            if (-not $content.ConnectionStrings) {
                $content | Add-Member -Type NoteProperty -Name "ConnectionStrings" -Value @{}
            }
            $content.ConnectionStrings.DefaultConnection = $connectionStrings[$serviceName]

            $jsonContent = $content | ConvertTo-Json -Depth 10
            Set-Content -Path $appSettingsPath -Value $jsonContent -Encoding UTF8

            Write-Host "  ✅ Updated $serviceName" -ForegroundColor Green
        }
        catch {
            Write-Host "  ❌ Failed to update $serviceName`: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "  ⚠️  appsettings.json not found for $serviceName" -ForegroundColor Yellow
    }
}

# Update MongoDB services
Write-Host "`n🔄 Updating MongoDB connection strings..." -ForegroundColor Cyan

$mongoServices = @("user-service", "product-service")

foreach ($serviceName in $mongoServices) {
    Write-Host "📦 Processing $serviceName..." -ForegroundColor Yellow

    $appSettingsPath = "services/$serviceName/appsettings.json"

    if (Test-Path $appSettingsPath) {
        try {
            $content = Get-Content $appSettingsPath -Raw | ConvertFrom-Json

            if (-not $content.ConnectionStrings) {
                $content | Add-Member -Type NoteProperty -Name "ConnectionStrings" -Value @{}
            }
            $content.ConnectionStrings.MongoDB = $mongoConnectionString

            if ($content.MongoDbSettings) {
                $content.MongoDbSettings.ConnectionString = $mongoConnectionString
            }

            $jsonContent = $content | ConvertTo-Json -Depth 10
            Set-Content -Path $appSettingsPath -Value $jsonContent -Encoding UTF8

            Write-Host "  ✅ Updated $serviceName" -ForegroundColor Green
        }
        catch {
            Write-Host "  ❌ Failed to update $serviceName`: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "  ⚠️  appsettings.json not found for $serviceName" -ForegroundColor Yellow
    }
}

Write-Host "`n🎉 Connection string updates completed!" -ForegroundColor Green
Write-Host "📋 Summary:" -ForegroundColor White
Write-Host "  • PostgreSQL services: 7 services updated" -ForegroundColor White
Write-Host "  • MongoDB services: 2 services updated" -ForegroundColor White
