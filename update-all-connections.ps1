Write-Host "Updating all connection strings with correct password" -ForegroundColor Blue

# PostgreSQL services with correct password
$services = @{
    "inventory-service" = "inventory_db"
    "order-service" = "order_db"
    "customer-service" = "customer_db"
    "payment-service" = "payment_db"
    "notification-service" = "notification_db"
    "reporting-service" = "reporting_db"
    "alert-service" = "alert_db"
}

foreach ($service in $services.Keys) {
    $dbName = $services[$service]
    $connectionString = "Host=localhost;Port=5432;Database=$dbName;Username=postgres;Password=postgres;"
    
    $appSettingsPath = "services/$service/appsettings.json"
    
    if (Test-Path $appSettingsPath) {
        try {
            $json = Get-Content $appSettingsPath -Raw | ConvertFrom-Json
            
            if (-not $json.ConnectionStrings) {
                $json | Add-Member -Type NoteProperty -Name "ConnectionStrings" -Value @{}
            }
            
            $json.ConnectionStrings.DefaultConnection = $connectionString
            $json | ConvertTo-Json -Depth 10 | Set-Content $appSettingsPath -Encoding UTF8
            
            Write-Host "Updated $service" -ForegroundColor Green
        }
        catch {
            Write-Host "Failed to update $service" -ForegroundColor Red
        }
    }
}

# MongoDB services
$mongoServices = @("user-service", "product-service")
$mongoConnectionString = "mongodb://localhost:27017/warehouse_management"

foreach ($service in $mongoServices) {
    $appSettingsPath = "services/$service/appsettings.json"
    
    if (Test-Path $appSettingsPath) {
        try {
            $json = Get-Content $appSettingsPath -Raw | ConvertFrom-Json
            
            if (-not $json.ConnectionStrings) {
                $json | Add-Member -Type NoteProperty -Name "ConnectionStrings" -Value @{}
            }
            
            $json.ConnectionStrings.MongoDB = $mongoConnectionString
            
            if ($json.MongoDbSettings) {
                $json.MongoDbSettings.ConnectionString = $mongoConnectionString
                $json.MongoDbSettings.DatabaseName = "warehouse_management"
            }
            
            $json | ConvertTo-Json -Depth 10 | Set-Content $appSettingsPath -Encoding UTF8
            Write-Host "Updated $service MongoDB connection" -ForegroundColor Green
        }
        catch {
            Write-Host "Failed to update $service MongoDB connection" -ForegroundColor Red
        }
    }
}

Write-Host "All connection strings updated!" -ForegroundColor Green
