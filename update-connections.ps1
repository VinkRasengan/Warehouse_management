Write-Host "Fixing Connection Strings" -ForegroundColor Blue

# Update inventory-service
$path = "services/inventory-service/appsettings.json"
if (Test-Path $path) {
    $json = Get-Content $path -Raw | ConvertFrom-Json
    if (-not $json.ConnectionStrings) {
        $json | Add-Member -Type NoteProperty -Name "ConnectionStrings" -Value @{}
    }
    $json.ConnectionStrings.DefaultConnection = "Host=localhost;Port=5433;Database=inventory_db;Username=postgres;Password=password"
    $json | ConvertTo-Json -Depth 10 | Set-Content $path -Encoding UTF8
    Write-Host "Updated inventory-service" -ForegroundColor Green
}

# Update order-service
$path = "services/order-service/appsettings.json"
if (Test-Path $path) {
    $json = Get-Content $path -Raw | ConvertFrom-Json
    if (-not $json.ConnectionStrings) {
        $json | Add-Member -Type NoteProperty -Name "ConnectionStrings" -Value @{}
    }
    $json.ConnectionStrings.DefaultConnection = "Host=localhost;Port=5434;Database=order_db;Username=postgres;Password=password"
    $json | ConvertTo-Json -Depth 10 | Set-Content $path -Encoding UTF8
    Write-Host "Updated order-service" -ForegroundColor Green
}

# Update customer-service
$path = "services/customer-service/appsettings.json"
if (Test-Path $path) {
    $json = Get-Content $path -Raw | ConvertFrom-Json
    if (-not $json.ConnectionStrings) {
        $json | Add-Member -Type NoteProperty -Name "ConnectionStrings" -Value @{}
    }
    $json.ConnectionStrings.DefaultConnection = "Host=localhost;Port=5435;Database=customer_db;Username=postgres;Password=password"
    $json | ConvertTo-Json -Depth 10 | Set-Content $path -Encoding UTF8
    Write-Host "Updated customer-service" -ForegroundColor Green
}

# Update user-service MongoDB
$path = "services/user-service/appsettings.json"
if (Test-Path $path) {
    $json = Get-Content $path -Raw | ConvertFrom-Json
    if (-not $json.ConnectionStrings) {
        $json | Add-Member -Type NoteProperty -Name "ConnectionStrings" -Value @{}
    }
    $json.ConnectionStrings.MongoDB = "mongodb://admin:admin123@localhost:27017/warehouse_management?authSource=admin"
    if ($json.MongoDbSettings) {
        $json.MongoDbSettings.ConnectionString = "mongodb://admin:admin123@localhost:27017/warehouse_management?authSource=admin"
    }
    $json | ConvertTo-Json -Depth 10 | Set-Content $path -Encoding UTF8
    Write-Host "Updated user-service" -ForegroundColor Green
}

Write-Host "Connection strings updated successfully!" -ForegroundColor Green
