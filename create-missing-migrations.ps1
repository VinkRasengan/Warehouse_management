# Create Missing Migrations Script
# This script creates migrations for services that don't have them yet

Write-Host "🔄 Creating Missing Database Migrations" -ForegroundColor Blue
Write-Host "=======================================" -ForegroundColor Blue

# Define all services that should have migrations
$services = @(
    @{ Name = "product-service"; Project = "ProductService.csproj"; HasMigrations = $false },
    @{ Name = "inventory-service"; Project = "InventoryService.csproj"; HasMigrations = $true },
    @{ Name = "order-service"; Project = "OrderService.csproj"; HasMigrations = $true },
    @{ Name = "customer-service"; Project = "CustomerService.csproj"; HasMigrations = $true },
    @{ Name = "payment-service"; Project = "PaymentService.csproj"; HasMigrations = $false },
    @{ Name = "notification-service"; Project = "NotificationService.csproj"; HasMigrations = $false },
    @{ Name = "reporting-service"; Project = "ReportingService.csproj"; HasMigrations = $false },
    @{ Name = "alert-service"; Project = "AlertService.csproj"; HasMigrations = $false }
)

# Check if EF Core tools are installed
Write-Host "`n📋 Checking EF Core tools..." -ForegroundColor Cyan
try {
    $efVersion = dotnet ef --version
    Write-Host "✅ EF Core tools installed: $efVersion" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Installing EF Core tools..." -ForegroundColor Yellow
    dotnet tool install --global dotnet-ef
    Write-Host "✅ EF Core tools installed" -ForegroundColor Green
}

# Function to check if service has migrations
function Test-HasMigrations {
    param([string]$ServiceName)
    
    $migrationsPath = "services/$ServiceName/Migrations"
    if (Test-Path $migrationsPath) {
        $migrationFiles = Get-ChildItem $migrationsPath -Filter "*.cs" | Where-Object { $_.Name -notlike "*ModelSnapshot.cs" }
        return $migrationFiles.Count -gt 0
    }
    return $false
}

# Function to check if service uses Entity Framework
function Test-UsesEntityFramework {
    param([string]$ServiceName, [string]$ProjectFile)
    
    $projectPath = "services/$ServiceName/$ProjectFile"
    if (-not (Test-Path $projectPath)) {
        return $false
    }
    
    $content = Get-Content $projectPath -Raw
    return $content -match "Microsoft\.EntityFrameworkCore" -and $content -notmatch "MongoDB"
}

# Update service migration status
Write-Host "`n🔍 Checking existing migrations..." -ForegroundColor Cyan
foreach ($service in $services) {
    $hasMigrations = Test-HasMigrations -ServiceName $service.Name
    $usesEF = Test-UsesEntityFramework -ServiceName $service.Name -ProjectFile $service.Project
    
    $service.HasMigrations = $hasMigrations
    $service.UsesEF = $usesEF
    
    $status = if ($hasMigrations) { "✅ Has migrations" } elseif ($usesEF) { "⚠️  Needs migrations" } else { "ℹ️  No EF/MongoDB" }
    Write-Host "  $($service.Name): $status" -ForegroundColor $(if ($hasMigrations) { "Green" } elseif ($usesEF) { "Yellow" } else { "Blue" })
}

# Create migrations for services that need them
Write-Host "`n🔄 Creating missing migrations..." -ForegroundColor Cyan

foreach ($service in $services) {
    if ($service.UsesEF -and -not $service.HasMigrations) {
        Write-Host "`n📦 Creating migration for $($service.Name)..." -ForegroundColor Yellow
        
        $projectPath = "services/$($service.Name)/$($service.Project)"
        
        if (-not (Test-Path $projectPath)) {
            Write-Host "  ❌ Project file not found: $projectPath" -ForegroundColor Red
            continue
        }
        
        try {
            Push-Location "services/$($service.Name)"
            
            Write-Host "  🔄 Running: dotnet ef migrations add InitialCreate" -ForegroundColor Cyan
            dotnet ef migrations add InitialCreate
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✅ Migration created successfully for $($service.Name)" -ForegroundColor Green
            } else {
                Write-Host "  ❌ Failed to create migration for $($service.Name)" -ForegroundColor Red
            }
        }
        catch {
            Write-Host "  ❌ Error creating migration for $($service.Name): $($_.Exception.Message)" -ForegroundColor Red
        }
        finally {
            Pop-Location
        }
    }
    elseif ($service.HasMigrations) {
        Write-Host "  ✅ $($service.Name) already has migrations" -ForegroundColor Green
    }
    elseif (-not $service.UsesEF) {
        Write-Host "  ℹ️  $($service.Name) doesn't use Entity Framework" -ForegroundColor Blue
    }
}

Write-Host "`n📋 Final Status:" -ForegroundColor Cyan
foreach ($service in $services) {
    $finalStatus = Test-HasMigrations -ServiceName $service.Name
    $icon = if ($finalStatus) { "✅" } elseif ($service.UsesEF) { "❌" } else { "ℹ️" }
    $color = if ($finalStatus) { "Green" } elseif ($service.UsesEF) { "Red" } else { "Blue" }
    
    Write-Host "  $icon $($service.Name)" -ForegroundColor $color
}

Write-Host "`n🎉 Migration creation completed!" -ForegroundColor Green
Write-Host "Next step: Run setup-databases-complete.ps1 to setup databases" -ForegroundColor White
