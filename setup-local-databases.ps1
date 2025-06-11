# Setup Local Databases Script (Alternative to Docker)
# This script sets up PostgreSQL and MongoDB locally on Windows

Write-Host "Setting up Local Databases for Warehouse Management" -ForegroundColor Blue
Write-Host "===================================================" -ForegroundColor Blue

# PostgreSQL Configuration
$pgPort = 5432
$pgUser = "postgres"
$pgPassword = "password"

# Database names and their corresponding ports for services
$databases = @{
    "inventory_db" = 5433
    "order_db" = 5434
    "customer_db" = 5435
    "payment_db" = 5438
    "notification_db" = 5439
    "reporting_db" = 5436
    "alert_db" = 5437
}

Write-Host "Step 1: Checking PostgreSQL installation..." -ForegroundColor Cyan

# Check if PostgreSQL is installed
$pgPath = ""
$possiblePaths = @(
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe",
    "C:\Program Files\PostgreSQL\13\bin\psql.exe",
    "C:\Program Files (x86)\PostgreSQL\15\bin\psql.exe"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $pgPath = Split-Path $path -Parent
        Write-Host "Found PostgreSQL at: $pgPath" -ForegroundColor Green
        break
    }
}

if (-not $pgPath) {
    Write-Host "PostgreSQL not found. Please install PostgreSQL first." -ForegroundColor Red
    Write-Host "Run: winget install PostgreSQL.PostgreSQL.15" -ForegroundColor Yellow
    exit 1
}

# Add PostgreSQL to PATH for this session
$env:PATH += ";$pgPath"

Write-Host "Step 2: Creating databases..." -ForegroundColor Cyan

foreach ($dbName in $databases.Keys) {
    Write-Host "Creating database: $dbName" -ForegroundColor Yellow
    
    try {
        # Create database using psql
        $createDbCommand = "CREATE DATABASE $dbName;"
        echo $createDbCommand | & "$pgPath\psql.exe" -h localhost -p $pgPort -U $pgUser -d postgres
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Database $dbName created successfully" -ForegroundColor Green
        } else {
            Write-Host "  Database $dbName may already exist or creation failed" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "  Error creating database $dbName" -ForegroundColor Red
    }
}

Write-Host "Step 3: Updating connection strings for single PostgreSQL instance..." -ForegroundColor Cyan

# Update connection strings to use single PostgreSQL instance with different databases
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
    $connectionString = "Host=localhost;Port=$pgPort;Database=$dbName;Username=$pgUser;Password=$pgPassword"
    
    $appSettingsPath = "services/$service/appsettings.json"
    
    if (Test-Path $appSettingsPath) {
        try {
            $json = Get-Content $appSettingsPath -Raw | ConvertFrom-Json
            
            if (-not $json.ConnectionStrings) {
                $json | Add-Member -Type NoteProperty -Name "ConnectionStrings" -Value @{}
            }
            
            $json.ConnectionStrings.DefaultConnection = $connectionString
            $json | ConvertTo-Json -Depth 10 | Set-Content $appSettingsPath -Encoding UTF8
            
            Write-Host "  Updated $service connection string" -ForegroundColor Green
        }
        catch {
            Write-Host "  Failed to update $service connection string" -ForegroundColor Red
        }
    }
}

Write-Host "Step 4: Running database migrations..." -ForegroundColor Cyan

$migrationServices = @("inventory-service", "order-service", "customer-service", "payment-service", "notification-service", "reporting-service", "alert-service")

foreach ($service in $migrationServices) {
    Write-Host "Running migrations for $service..." -ForegroundColor Yellow
    
    try {
        Push-Location "services/$service"
        
        # Check if migrations exist
        if (Test-Path "Migrations") {
            Write-Host "  Updating database for $service..." -ForegroundColor Cyan
            dotnet ef database update
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  Database updated successfully for $service" -ForegroundColor Green
            } else {
                Write-Host "  Failed to update database for $service" -ForegroundColor Red
            }
        } else {
            Write-Host "  No migrations found for $service" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "  Error updating database for $service" -ForegroundColor Red
    }
    finally {
        Pop-Location
    }
}

Write-Host "Step 5: MongoDB setup (if needed)..." -ForegroundColor Cyan
Write-Host "For MongoDB services (user-service, product-service):" -ForegroundColor Yellow
Write-Host "  Option 1: Install MongoDB locally" -ForegroundColor White
Write-Host "  Option 2: Use MongoDB Atlas (cloud)" -ForegroundColor White
Write-Host "  Option 3: Use Docker for MongoDB only" -ForegroundColor White

Write-Host "`nLocal database setup completed!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Install MongoDB if needed for user-service and product-service" -ForegroundColor White
Write-Host "2. Test database connections" -ForegroundColor White
Write-Host "3. Start the services" -ForegroundColor White

Write-Host "`nDatabase connection info:" -ForegroundColor Cyan
Write-Host "  PostgreSQL: localhost:5432" -ForegroundColor White
Write-Host "  Username: postgres" -ForegroundColor White
Write-Host "  Password: password" -ForegroundColor White
Write-Host "  Databases: inventory_db, order_db, customer_db, etc." -ForegroundColor White
