# Master Database Setup Script for Warehouse Management System
# This script orchestrates the complete database setup process

param(
    [switch]$SkipDocker,
    [switch]$SkipMigrations,
    [switch]$SkipConnectionStrings
)

Write-Host "🏭 Warehouse Management System - Database Setup" -ForegroundColor Blue
Write-Host "===============================================" -ForegroundColor Blue
Write-Host "This script will set up all databases for the warehouse management system" -ForegroundColor White
Write-Host ""

# Display what will be set up
Write-Host "📊 Database Architecture:" -ForegroundColor Cyan
Write-Host "  🐘 PostgreSQL Databases:" -ForegroundColor White
Write-Host "    • inventory-service    → localhost:5433 (inventory_db)" -ForegroundColor Gray
Write-Host "    • order-service        → localhost:5434 (order_db)" -ForegroundColor Gray
Write-Host "    • customer-service     → localhost:5435 (customer_db)" -ForegroundColor Gray
Write-Host "    • payment-service      → localhost:5438 (payment_db)" -ForegroundColor Gray
Write-Host "    • notification-service → localhost:5439 (notification_db)" -ForegroundColor Gray
Write-Host "    • reporting-service    → localhost:5436 (reporting_db)" -ForegroundColor Gray
Write-Host "    • alert-service        → localhost:5437 (alert_db)" -ForegroundColor Gray
Write-Host ""
Write-Host "  🍃 MongoDB Databases:" -ForegroundColor White
Write-Host "    • user-service         → localhost:27017 (warehouse_management)" -ForegroundColor Gray
Write-Host "    • product-service      → localhost:27017 (warehouse_management)" -ForegroundColor Gray
Write-Host ""
Write-Host "  🔴 Redis Cache:          → localhost:6379" -ForegroundColor White
Write-Host "  🐰 RabbitMQ Broker:      → localhost:5672" -ForegroundColor White
Write-Host ""

# Confirm before proceeding
$confirm = Read-Host "Do you want to proceed with the database setup? (Y/N)"
if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "❌ Setup cancelled by user" -ForegroundColor Red
    exit 0
}

Write-Host "`n🚀 Starting database setup process..." -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Step 1: Fix connection strings
if (-not $SkipConnectionStrings) {
    Write-Host "`n📋 Step 1: Fixing connection strings..." -ForegroundColor Cyan
    try {
        & ".\fix-connection-strings.ps1"
        Write-Host "✅ Connection strings updated successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to update connection strings: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "⚠️  Continuing with setup..." -ForegroundColor Yellow
    }
} else {
    Write-Host "`n📋 Step 1: Skipping connection strings (--SkipConnectionStrings)" -ForegroundColor Yellow
}

# Step 2: Create missing migrations
if (-not $SkipMigrations) {
    Write-Host "`n📋 Step 2: Creating missing migrations..." -ForegroundColor Cyan
    try {
        & ".\create-missing-migrations.ps1"
        Write-Host "✅ Migrations created successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to create migrations: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "⚠️  Continuing with setup..." -ForegroundColor Yellow
    }
} else {
    Write-Host "`n📋 Step 2: Skipping migrations (--SkipMigrations)" -ForegroundColor Yellow
}

# Step 3: Setup databases with Docker
if (-not $SkipDocker) {
    Write-Host "`n📋 Step 3: Setting up databases..." -ForegroundColor Cyan
    try {
        & ".\setup-databases-complete.ps1"
        Write-Host "✅ Databases setup completed successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed to setup databases: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "⚠️  Please check Docker and try again" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n📋 Step 3: Skipping Docker setup (--SkipDocker)" -ForegroundColor Yellow
}

# Step 4: Final verification
Write-Host "`n📋 Step 4: Final verification..." -ForegroundColor Cyan

# Check if Docker containers are running
try {
    $containers = docker ps --format "table {{.Names}}\t{{.Status}}" | Select-String "warehouse"
    if ($containers) {
        Write-Host "✅ Docker containers are running:" -ForegroundColor Green
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Select-String "warehouse"
    } else {
        Write-Host "⚠️  No warehouse containers found running" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "⚠️  Could not check Docker containers (Docker may not be running)" -ForegroundColor Yellow
}

# Check migration files
Write-Host "`n🔍 Checking migration files..." -ForegroundColor Cyan
$services = @("inventory-service", "order-service", "customer-service", "payment-service", "notification-service", "reporting-service", "alert-service")

foreach ($service in $services) {
    $migrationsPath = "services/$service/Migrations"
    if (Test-Path $migrationsPath) {
        $migrationFiles = Get-ChildItem $migrationsPath -Filter "*.cs" | Where-Object { $_.Name -notlike "*ModelSnapshot.cs" }
        if ($migrationFiles.Count -gt 0) {
            Write-Host "  ✅ $service has migrations" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  $service has no migration files" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ❌ $service has no Migrations folder" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Database setup process completed!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Start Docker Desktop if not already running" -ForegroundColor White
Write-Host "2. Run: docker-compose up -d" -ForegroundColor White
Write-Host "3. Wait for all services to be ready" -ForegroundColor White
Write-Host "4. Test the services:" -ForegroundColor White
Write-Host "   • API Gateway: http://localhost:5000" -ForegroundColor Gray
Write-Host "   • Frontend: http://localhost:3000" -ForegroundColor Gray
Write-Host ""

Write-Host "🔧 Troubleshooting:" -ForegroundColor Cyan
Write-Host "• If Docker fails: Restart Docker Desktop and try again" -ForegroundColor White
Write-Host "• If migrations fail: Check connection strings in appsettings.json" -ForegroundColor White
Write-Host "• If services fail: Check logs with 'docker-compose logs [service-name]'" -ForegroundColor White
Write-Host ""

Write-Host "📚 Useful Commands:" -ForegroundColor Cyan
Write-Host "• Check containers: docker ps" -ForegroundColor White
Write-Host "• View logs: docker-compose logs" -ForegroundColor White
Write-Host "• Stop all: docker-compose down" -ForegroundColor White
Write-Host "• Restart: docker-compose restart" -ForegroundColor White

Write-Host "`n✨ Database setup is now complete! ✨" -ForegroundColor Green
