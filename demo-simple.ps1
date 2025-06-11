# Warehouse Management System Demo
Write-Host "WAREHOUSE MANAGEMENT SYSTEM DEMO" -ForegroundColor Blue
Write-Host "=================================" -ForegroundColor Blue

# Check if services are running
$services = @{
    "inventory-service" = 5000
    "order-service" = 5002
    "customer-service" = 5003
}

Write-Host "`nChecking Service Status..." -ForegroundColor Cyan

$runningServices = @()
foreach ($serviceName in $services.Keys) {
    $port = $services[$serviceName]
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:$port/health" -Method GET -TimeoutSec 3
        Write-Host "  [OK] $serviceName (port $port) - Running" -ForegroundColor Green
        $runningServices += $serviceName
    }
    catch {
        Write-Host "  [FAIL] $serviceName (port $port) - Not running" -ForegroundColor Red
    }
}

if ($runningServices.Count -eq 0) {
    Write-Host "`nNo services are running. Please start services first:" -ForegroundColor Yellow
    Write-Host "   .\start-all-services.ps1" -ForegroundColor White
    exit
}

Write-Host "`nDEMO SCENARIOS" -ForegroundColor Blue
Write-Host "==============" -ForegroundColor Blue

# Scenario 1: Inventory Management
if ($runningServices -contains "inventory-service") {
    Write-Host "`nSCENARIO 1: Inventory Management" -ForegroundColor Yellow
    Write-Host "--------------------------------" -ForegroundColor Yellow
    
    try {
        Write-Host "  Getting all inventory items..." -ForegroundColor White
        $inventory = Invoke-RestMethod -Uri "http://localhost:5000/api/inventory" -Method GET
        Write-Host "    [SUCCESS] Found $($inventory.Count) inventory items" -ForegroundColor Green
        
        if ($inventory.Count -gt 0) {
            $item = $inventory[0]
            Write-Host "    Sample Item:" -ForegroundColor Gray
            Write-Host "       ID: $($item.id)" -ForegroundColor Gray
            Write-Host "       SKU: $($item.sku)" -ForegroundColor Gray
            Write-Host "       Quantity: $($item.quantity)" -ForegroundColor Gray
            Write-Host "       Location: $($item.location)" -ForegroundColor Gray
            
            Write-Host "  Getting specific item details..." -ForegroundColor White
            $itemDetail = Invoke-RestMethod -Uri "http://localhost:5000/api/inventory/$($item.id)" -Method GET
            Write-Host "    [SUCCESS] Retrieved detailed information for item $($item.id)" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "    [ERROR] Error testing inventory service: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Scenario 2: Order Management
if ($runningServices -contains "order-service") {
    Write-Host "`nSCENARIO 2: Order Management" -ForegroundColor Yellow
    Write-Host "----------------------------" -ForegroundColor Yellow
    
    try {
        Write-Host "  Getting all orders..." -ForegroundColor White
        $orders = Invoke-RestMethod -Uri "http://localhost:5002/api/orders" -Method GET
        Write-Host "    [SUCCESS] Found $($orders.Count) orders" -ForegroundColor Green
        
        if ($orders.Count -gt 0) {
            $order = $orders[0]
            Write-Host "    Sample Order:" -ForegroundColor Gray
            Write-Host "       Order Number: $($order.orderNumber)" -ForegroundColor Gray
            Write-Host "       Customer ID: $($order.customerId)" -ForegroundColor Gray
            Write-Host "       Status: $($order.status)" -ForegroundColor Gray
            Write-Host "       Total: `$$($order.totalAmount)" -ForegroundColor Gray
            
            Write-Host "  Getting specific order details..." -ForegroundColor White
            $orderDetail = Invoke-RestMethod -Uri "http://localhost:5002/api/orders/$($order.id)" -Method GET
            Write-Host "    [SUCCESS] Retrieved detailed information for order $($order.orderNumber)" -ForegroundColor Green
            Write-Host "    Order has $($orderDetail.orderItems.Count) items" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "    [ERROR] Error testing order service: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Scenario 3: Customer Management
if ($runningServices -contains "customer-service") {
    Write-Host "`nSCENARIO 3: Customer Management" -ForegroundColor Yellow
    Write-Host "-------------------------------" -ForegroundColor Yellow
    
    try {
        Write-Host "  Getting all customers..." -ForegroundColor White
        $customers = Invoke-RestMethod -Uri "http://localhost:5003/api/customers" -Method GET
        Write-Host "    [SUCCESS] Found $($customers.Count) customers" -ForegroundColor Green
        
        if ($customers.Count -gt 0) {
            $customer = $customers[0]
            Write-Host "    Sample Customer:" -ForegroundColor Gray
            Write-Host "       Name: $($customer.fullName)" -ForegroundColor Gray
            Write-Host "       Email: $($customer.email)" -ForegroundColor Gray
            Write-Host "       Phone: $($customer.phone)" -ForegroundColor Gray
            Write-Host "       Location: $($customer.city), $($customer.country)" -ForegroundColor Gray
            Write-Host "       Loyalty Points: $($customer.loyaltyPoints)" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "    [ERROR] Error testing customer service: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Summary
Write-Host "`nSYSTEM SUMMARY" -ForegroundColor Blue
Write-Host "==============" -ForegroundColor Blue
Write-Host "  Running Services: $($runningServices.Count)/$($services.Count)" -ForegroundColor White
Write-Host "  Database: PostgreSQL (6 databases)" -ForegroundColor White
Write-Host "  Architecture: Microservices" -ForegroundColor White
Write-Host "  APIs: RESTful with Swagger documentation" -ForegroundColor White

Write-Host "`nQUICK ACCESS LINKS" -ForegroundColor Blue
Write-Host "==================" -ForegroundColor Blue
foreach ($serviceName in $runningServices) {
    $port = $services[$serviceName]
    Write-Host "  $serviceName`:" -ForegroundColor White
    Write-Host "    Swagger: http://localhost:$port/swagger" -ForegroundColor Gray
    Write-Host "    Health:  http://localhost:$port/health" -ForegroundColor Gray
}

Write-Host "`nNEXT STEPS" -ForegroundColor Blue
Write-Host "==========" -ForegroundColor Blue
Write-Host "  1. Open Swagger UIs to explore APIs interactively" -ForegroundColor White
Write-Host "  2. Test API endpoints with Postman or curl" -ForegroundColor White
Write-Host "  3. Start additional services: payment, notification, alert" -ForegroundColor White
Write-Host "  4. Implement frontend application" -ForegroundColor White
Write-Host "  5. Add Redis caching and RabbitMQ messaging" -ForegroundColor White

Write-Host "`nWAREHOUSE MANAGEMENT SYSTEM IS READY!" -ForegroundColor Green
