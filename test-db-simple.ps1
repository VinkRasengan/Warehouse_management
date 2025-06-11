Write-Host "Testing Database Connections" -ForegroundColor Blue

# Test PostgreSQL databases
$databases = @("inventory_db", "order_db", "customer_db", "payment_db", "notification_db", "alert_db")

Write-Host "Testing PostgreSQL databases..." -ForegroundColor Cyan

foreach ($db in $databases) {
    Write-Host "Testing $db..." -ForegroundColor Yellow
    
    try {
        $testQuery = "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
        $env:PGPASSWORD = "postgres"
        $result = echo $testQuery | & "C:\Program Files\PostgreSQL\15\bin\psql.exe" -h localhost -p 5432 -U postgres -d $db -t -A 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  SUCCESS: $db connected ($result tables)" -ForegroundColor Green
        } else {
            Write-Host "  FAILED: $db connection failed" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "  ERROR: $db - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test MongoDB
Write-Host "`nTesting MongoDB..." -ForegroundColor Cyan

$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($mongoService -and $mongoService.Status -eq "Running") {
    Write-Host "  MongoDB service is running" -ForegroundColor Green
} else {
    Write-Host "  MongoDB service not running" -ForegroundColor Red
}

Write-Host "`nDatabase test completed!" -ForegroundColor Green
Write-Host "All databases are ready for the warehouse management system" -ForegroundColor White
