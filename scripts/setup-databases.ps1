# PowerShell script to setup all databases for Warehouse Management System

Write-Host "🚀 Setting up databases for Warehouse Management System..." -ForegroundColor Green

# Array of services to process
$services = @(
    @{Name="order-service"; Project="OrderService.csproj"},
    @{Name="customer-service"; Project="CustomerService.csproj"},
    @{Name="payment-service"; Project="PaymentService.csproj"},
    @{Name="notification-service"; Project="NotificationService.csproj"},
    @{Name="reporting-service"; Project="ReportingService.csproj"},
    @{Name="alert-service"; Project="AlertService.csproj"}
)

# Function to run EF commands
function Run-EFCommand {
    param(
        [string]$ServiceName,
        [string]$ProjectFile,
        [string]$Command
    )
    
    Write-Host "📦 Processing $ServiceName..." -ForegroundColor Yellow
    
    $projectPath = "services/$ServiceName/$ProjectFile"
    
    try {
        if ($Command -eq "migrations") {
            Write-Host "  Creating migration..." -ForegroundColor Cyan
            dotnet ef migrations add InitialCreate --project $projectPath
        }
        elseif ($Command -eq "update") {
            Write-Host "  Updating database..." -ForegroundColor Cyan
            dotnet ef database update --project $projectPath
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ $ServiceName $Command completed successfully" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $ServiceName $Command failed" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "  ❌ Error processing $ServiceName`: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Create migrations for all services
Write-Host "`n📋 Creating migrations..." -ForegroundColor Blue
foreach ($service in $services) {
    Run-EFCommand -ServiceName $service.Name -ProjectFile $service.Project -Command "migrations"
}

# Update databases for all services
Write-Host "`n🗄️ Updating databases..." -ForegroundColor Blue
foreach ($service in $services) {
    Run-EFCommand -ServiceName $service.Name -ProjectFile $service.Project -Command "update"
}

Write-Host "`n🎉 Database setup completed!" -ForegroundColor Green
Write-Host "All services should now have their databases created and migrated." -ForegroundColor White
