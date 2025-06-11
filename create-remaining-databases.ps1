Write-Host "Creating remaining databases with explicit connection strings" -ForegroundColor Blue

$services = @{
    "customer-service" = "customer_db"
    "payment-service" = "payment_db"
    "notification-service" = "notification_db"
    "alert-service" = "alert_db"
}

foreach ($service in $services.Keys) {
    $dbName = $services[$service]
    $connectionString = "Host=localhost;Port=5432;Database=$dbName;Username=postgres;Password=postgres;"
    
    Write-Host "`nProcessing $service..." -ForegroundColor Yellow
    
    try {
        Push-Location "services/$service"
        
        if (Test-Path "Migrations") {
            Write-Host "  Running migrations for $service..." -ForegroundColor Cyan
            dotnet ef database update --connection $connectionString
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  Database created successfully for $service" -ForegroundColor Green
            } else {
                Write-Host "  Failed to create database for $service" -ForegroundColor Red
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

# Special handling for reporting-service (had build error)
Write-Host "`nProcessing reporting-service..." -ForegroundColor Yellow
try {
    Push-Location "services/reporting-service"
    
    Write-Host "  Building reporting-service..." -ForegroundColor Cyan
    dotnet build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  Build successful, running migrations..." -ForegroundColor Cyan
        dotnet ef database update --connection "Host=localhost;Port=5432;Database=reporting_db;Username=postgres;Password=postgres;"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Database created successfully for reporting-service" -ForegroundColor Green
        } else {
            Write-Host "  Failed to create database for reporting-service" -ForegroundColor Red
        }
    } else {
        Write-Host "  Build failed for reporting-service" -ForegroundColor Red
    }
}
catch {
    Write-Host "  Error processing reporting-service" -ForegroundColor Red
}
finally {
    Pop-Location
}

Write-Host "`nAll remaining databases processed!" -ForegroundColor Green
