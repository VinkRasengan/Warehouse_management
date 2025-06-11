Write-Host "Creating all databases with migrations" -ForegroundColor Blue

$services = @("order-service", "customer-service", "payment-service", "notification-service", "reporting-service", "alert-service")

foreach ($service in $services) {
    Write-Host "`nProcessing $service..." -ForegroundColor Yellow
    
    try {
        Push-Location "services/$service"
        
        if (Test-Path "Migrations") {
            Write-Host "  Running migrations for $service..." -ForegroundColor Cyan
            dotnet ef database update
            
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

Write-Host "`nAll databases created!" -ForegroundColor Green
