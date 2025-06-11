Write-Host "Creating Database Migrations" -ForegroundColor Blue

# Check EF Core tools
try {
    dotnet ef --version | Out-Null
    Write-Host "EF Core tools found" -ForegroundColor Green
}
catch {
    Write-Host "Installing EF Core tools..." -ForegroundColor Yellow
    dotnet tool install --global dotnet-ef
}

# Services that need migrations
$services = @(
    "payment-service",
    "notification-service", 
    "reporting-service",
    "alert-service"
)

foreach ($service in $services) {
    Write-Host "Processing $service..." -ForegroundColor Yellow
    
    $migrationsPath = "services/$service/Migrations"
    
    # Check if migrations already exist
    if (Test-Path $migrationsPath) {
        $migrationFiles = Get-ChildItem $migrationsPath -Filter "*.cs" | Where-Object { $_.Name -notlike "*ModelSnapshot.cs" }
        if ($migrationFiles.Count -gt 0) {
            Write-Host "  Migrations already exist for $service" -ForegroundColor Blue
            continue
        }
    }
    
    # Create migration
    try {
        Push-Location "services/$service"
        Write-Host "  Creating migration for $service..." -ForegroundColor Cyan
        dotnet ef migrations add InitialCreate
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Migration created successfully for $service" -ForegroundColor Green
        } else {
            Write-Host "  Failed to create migration for $service" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "  Error creating migration for $service" -ForegroundColor Red
    }
    finally {
        Pop-Location
    }
}

Write-Host "Migration creation completed!" -ForegroundColor Green
