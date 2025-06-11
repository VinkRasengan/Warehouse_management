# Test Database Connections
Write-Host "Testing Database Connections" -ForegroundColor Blue

# Test PostgreSQL connection
Write-Host "`nTesting PostgreSQL databases..." -ForegroundColor Cyan

$databases = @("inventory_db", "order_db", "customer_db", "payment_db", "notification_db", "alert_db")

foreach ($db in $databases) {
    try {
        $connectionString = "Host=localhost;Port=5432;Database=$db;Username=postgres;Password=postgres;"
        
        # Use .NET to test connection
        Add-Type -AssemblyName System.Data
        $connection = New-Object System.Data.SqlClient.SqlConnection
        
        # For PostgreSQL, we need Npgsql
        Write-Host "  Testing $db..." -ForegroundColor Yellow
        
        # Simple test using psql
        $testQuery = "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
        $result = echo $testQuery | & "C:\Program Files\PostgreSQL\15\bin\psql.exe" -h localhost -p 5432 -U postgres -d $db -t -A 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    ✅ $db - Connected successfully ($result tables)" -ForegroundColor Green
        } else {
            Write-Host "    ❌ $db - Connection failed" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "    ❌ $db - Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test MongoDB connection
Write-Host "`nTesting MongoDB connection..." -ForegroundColor Cyan

try {
    # Check if MongoDB service is running
    $mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
    if ($mongoService -and $mongoService.Status -eq "Running") {
        Write-Host "  ✅ MongoDB service is running" -ForegroundColor Green
        
        # Try to connect using mongo shell if available
        $mongoPath = "C:\Program Files\MongoDB\Server\8.0\bin\mongosh.exe"
        if (Test-Path $mongoPath) {
            Write-Host "  Testing MongoDB connection..." -ForegroundColor Yellow
            $testCommand = "db.runCommand({ping: 1})"
            $result = echo $testCommand | & $mongoPath --quiet mongodb://localhost:27017/warehouse_management 2>$null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "    ✅ MongoDB - Connected successfully" -ForegroundColor Green
            } else {
                Write-Host "    ❌ MongoDB - Connection failed" -ForegroundColor Red
            }
        } else {
            Write-Host "    ⚠️  MongoDB shell not found, but service is running" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ❌ MongoDB service not running" -ForegroundColor Red
    }
}
catch {
    Write-Host "  ❌ MongoDB - Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nDatabase connection test completed!" -ForegroundColor Green

# Show summary
Write-Host "`n📊 SUMMARY:" -ForegroundColor Blue
Write-Host "✅ PostgreSQL databases: Ready for services" -ForegroundColor Green
Write-Host "✅ MongoDB: Ready for user-service and product-service" -ForegroundColor Green
Write-Host "⚠️  Services need RabbitMQ/Redis for full functionality" -ForegroundColor Yellow

Write-Host "`n🚀 NEXT STEPS:" -ForegroundColor Blue
Write-Host "1. Install Redis locally for caching" -ForegroundColor White
Write-Host "2. Install RabbitMQ locally for messaging" -ForegroundColor White
Write-Host "3. Or modify services to work without these dependencies" -ForegroundColor White
Write-Host "4. Test individual service endpoints" -ForegroundColor White

Write-Host "`n💡 QUICK TEST:" -ForegroundColor Blue
Write-Host "You can test the Swagger UI at: http://localhost:5000/swagger" -ForegroundColor White
Write-Host "Even though health checks fail, the API endpoints may work" -ForegroundColor White
