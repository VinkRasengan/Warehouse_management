# Simple Database Setup - Using default PostgreSQL installation
Write-Host "Setting up Databases for Warehouse Management" -ForegroundColor Blue
Write-Host "=============================================" -ForegroundColor Blue

# Step 1: Update connection strings to use default PostgreSQL
Write-Host "Step 1: Updating connection strings..." -ForegroundColor Cyan

# Use default PostgreSQL installation (usually has trust authentication for local connections)
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
    # Try different connection string formats
    $connectionStrings = @(
        "Host=localhost;Port=5432;Database=$dbName;Username=postgres;",
        "Host=localhost;Port=5432;Database=$dbName;Username=postgres;Password=;",
        "Host=localhost;Port=5432;Database=$dbName;Username=postgres;Integrated Security=true;",
        "Server=localhost;Port=5432;Database=$dbName;User Id=postgres;"
    )
    
    $appSettingsPath = "services/$service/appsettings.json"
    
    if (Test-Path $appSettingsPath) {
        try {
            $json = Get-Content $appSettingsPath -Raw | ConvertFrom-Json
            
            if (-not $json.ConnectionStrings) {
                $json | Add-Member -Type NoteProperty -Name "ConnectionStrings" -Value @{}
            }
            
            # Try the first connection string format
            $json.ConnectionStrings.DefaultConnection = $connectionStrings[0]
            $json | ConvertTo-Json -Depth 10 | Set-Content $appSettingsPath -Encoding UTF8
            
            Write-Host "  Updated $service connection string" -ForegroundColor Green
        }
        catch {
            Write-Host "  Failed to update $service connection string" -ForegroundColor Red
        }
    }
}

Write-Host "Step 2: Creating databases using Entity Framework..." -ForegroundColor Cyan
Write-Host "EF will create databases automatically when running migrations" -ForegroundColor Yellow

# Step 3: Run migrations (this will create databases automatically)
Write-Host "Step 3: Running database migrations..." -ForegroundColor Cyan

$migrationServices = @("inventory-service", "order-service", "customer-service")

foreach ($service in $migrationServices) {
    Write-Host "Processing $service..." -ForegroundColor Yellow
    
    try {
        Push-Location "services/$service"
        
        # Check if migrations exist
        if (Test-Path "Migrations") {
            Write-Host "  Running migrations for $service..." -ForegroundColor Cyan
            
            # Try to update database - EF will create database if it doesn't exist
            dotnet ef database update --verbose
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  Database setup completed for $service" -ForegroundColor Green
            } else {
                Write-Host "  Database setup failed for $service - will try alternative connection" -ForegroundColor Yellow
                
                # Try with empty password
                $dbName = $services[$service]
                $altConnectionString = "Host=localhost;Port=5432;Database=$dbName;Username=postgres;Password=;"
                
                Write-Host "  Trying alternative connection string..." -ForegroundColor Cyan
                dotnet ef database update --connection $altConnectionString
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "  Database setup completed with alternative connection" -ForegroundColor Green
                    
                    # Update appsettings with working connection string
                    $appSettingsPath = "appsettings.json"
                    if (Test-Path $appSettingsPath) {
                        $json = Get-Content $appSettingsPath -Raw | ConvertFrom-Json
                        $json.ConnectionStrings.DefaultConnection = $altConnectionString
                        $json | ConvertTo-Json -Depth 10 | Set-Content $appSettingsPath -Encoding UTF8
                    }
                } else {
                    Write-Host "  Database setup still failed for $service" -ForegroundColor Red
                }
            }
        } else {
            Write-Host "  No migrations found for $service" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "  Error processing $service" -ForegroundColor Red
    }
    finally {
        Pop-Location
    }
}

Write-Host "Step 4: MongoDB setup..." -ForegroundColor Cyan

# Check if MongoDB is running
try {
    $mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
    if ($mongoService -and $mongoService.Status -eq "Running") {
        Write-Host "MongoDB service is running" -ForegroundColor Green
        
        # Update MongoDB connection strings
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
                    Write-Host "  Updated $service MongoDB connection" -ForegroundColor Green
                }
                catch {
                    Write-Host "  Failed to update $service MongoDB connection" -ForegroundColor Red
                }
            }
        }
    } else {
        Write-Host "MongoDB service not running. Starting MongoDB..." -ForegroundColor Yellow
        try {
            Start-Service -Name "MongoDB" -ErrorAction SilentlyContinue
            Write-Host "MongoDB service started" -ForegroundColor Green
        }
        catch {
            Write-Host "Could not start MongoDB service. You may need to start it manually." -ForegroundColor Yellow
        }
    }
}
catch {
    Write-Host "MongoDB not found or not installed as a service" -ForegroundColor Yellow
    Write-Host "You can start MongoDB manually or use MongoDB Compass" -ForegroundColor White
}

Write-Host "`nDatabase setup completed!" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Test database connections by running a service" -ForegroundColor White
Write-Host "2. If connection fails, check PostgreSQL authentication settings" -ForegroundColor White
Write-Host "3. Start the services to test everything works" -ForegroundColor White

Write-Host "`nTo test a service:" -ForegroundColor Cyan
Write-Host "cd services/inventory-service" -ForegroundColor White
Write-Host "dotnet run" -ForegroundColor White
