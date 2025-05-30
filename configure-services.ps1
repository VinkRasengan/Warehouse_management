# Service Configuration Script
# This script configures all services with proper connection strings

Write-Host "Configuring Warehouse Management Services" -ForegroundColor Blue

# Configuration templates
$postgresConnection = "Host=localhost;Port=5432;Database=warehouse_main;Username=warehouse_user;Password=warehouse_pass123"
$mongoConnection = "mongodb://admin:admin123@localhost:27017/warehouse_users?authSource=admin"
$redisConnection = "localhost:6379"
$rabbitmqConnection = "amqp://admin:password@localhost:5672/"

# JWT Configuration
$jwtKey = "your-super-secret-jwt-key-that-is-at-least-32-characters-long-for-security"
$jwtIssuer = "WarehouseManagement"
$jwtAudience = "WarehouseManagement"

# Email Configuration (Gmail example)
$emailConfig = @{
    SmtpHost = "smtp.gmail.com"
    SmtpPort = "587"
    Username = "your-email@gmail.com"
    Password = "your-app-password"
    FromEmail = "your-email@gmail.com"
    FromName = "Warehouse Management System"
}

# SMS Configuration (Twilio example)
$smsConfig = @{
    AccountSid = "your-twilio-account-sid"
    AuthToken = "your-twilio-auth-token"
    FromNumber = "your-twilio-phone-number"
}

# Payment Gateway Configuration
$paymentConfig = @{
    MoMo = @{
        PartnerCode = "your-momo-partner-code"
        AccessKey = "your-momo-access-key"
        SecretKey = "your-momo-secret-key"
        Endpoint = "https://test-payment.momo.vn"
    }
    VNPay = @{
        TmnCode = "your-vnpay-tmn-code"
        HashSecret = "your-vnpay-hash-secret"
        Url = "https://sandbox.vnpayment.vn"
    }
}

function Update-AppSettings {
    param(
        [string]$ServicePath,
        [string]$ServiceName
    )
    
    $appSettingsPath = Join-Path $ServicePath "appsettings.json"
    $appSettingsDevPath = Join-Path $ServicePath "appsettings.Development.json"
    
    if (Test-Path $appSettingsPath) {
        Write-Host "Updating $ServiceName configuration..." -ForegroundColor Yellow
        
        # Read existing configuration
        $config = Get-Content $appSettingsPath | ConvertFrom-Json
        
        # Update connection strings based on service type
        if (-not $config.ConnectionStrings) {
            $config | Add-Member -Type NoteProperty -Name "ConnectionStrings" -Value @{}
        }
        
        switch ($ServiceName) {
            "User Service" {
                $config.ConnectionStrings | Add-Member -Type NoteProperty -Name "DefaultConnection" -Value $mongoConnection -Force
            }
            default {
                $config.ConnectionStrings | Add-Member -Type NoteProperty -Name "DefaultConnection" -Value $postgresConnection -Force
            }
        }
        
        # Add Redis configuration
        $config | Add-Member -Type NoteProperty -Name "Redis" -Value @{
            ConnectionString = $redisConnection
        } -Force
        
        # Add RabbitMQ configuration
        $config | Add-Member -Type NoteProperty -Name "RabbitMQ" -Value @{
            ConnectionString = $rabbitmqConnection
            HostName = "localhost"
            Port = 5672
            UserName = "admin"
            Password = "password"
        } -Force
        
        # Add JWT configuration
        $config | Add-Member -Type NoteProperty -Name "JWT" -Value @{
            Key = $jwtKey
            Issuer = $jwtIssuer
            Audience = $jwtAudience
            ExpireMinutes = 60
        } -Force
        
        # Add service-specific configurations
        switch ($ServiceName) {
            "Notification Service" {
                $config | Add-Member -Type NoteProperty -Name "Email" -Value $emailConfig -Force
                $config | Add-Member -Type NoteProperty -Name "SMS" -Value $smsConfig -Force
            }
            "Payment Service" {
                $config | Add-Member -Type NoteProperty -Name "PaymentGateways" -Value $paymentConfig -Force
            }
        }
        
        # Save updated configuration
        $config | ConvertTo-Json -Depth 10 | Set-Content $appSettingsPath
        
        # Create Development configuration
        $config | ConvertTo-Json -Depth 10 | Set-Content $appSettingsDevPath
        
        Write-Host "$ServiceName configured successfully" -ForegroundColor Green
    } else {
        Write-Host "Configuration file not found for $ServiceName" -ForegroundColor Red
    }
}

# Configure all services
$services = @(
    @{ Path = "services/user-service"; Name = "User Service" },
    @{ Path = "services/product-service"; Name = "Product Service" },
    @{ Path = "services/inventory-service"; Name = "Inventory Service" },
    @{ Path = "services/order-service"; Name = "Order Service" },
    @{ Path = "services/customer-service"; Name = "Customer Service" },
    @{ Path = "services/payment-service"; Name = "Payment Service" },
    @{ Path = "services/notification-service"; Name = "Notification Service" },
    @{ Path = "api-gateway-dotnet"; Name = "API Gateway" }
)

foreach ($service in $services) {
    if (Test-Path $service.Path) {
        Update-AppSettings -ServicePath $service.Path -ServiceName $service.Name
    } else {
        Write-Host "Service not found: $($service.Name)" -ForegroundColor Red
    }
}

Write-Host "`nService configuration completed!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Start infrastructure services: .\setup-infrastructure.ps1" -ForegroundColor White
Write-Host "2. Run database migrations (if needed)" -ForegroundColor White
Write-Host "3. Start application services: .\deploy-local-simple.ps1" -ForegroundColor White

Write-Host "`nConfiguration Summary:" -ForegroundColor Blue
Write-Host "  PostgreSQL: localhost:5432" -ForegroundColor White
Write-Host "  MongoDB: localhost:27017" -ForegroundColor White
Write-Host "  Redis: localhost:6379" -ForegroundColor White
Write-Host "  RabbitMQ: localhost:5672" -ForegroundColor White
Write-Host "  RabbitMQ Management: http://localhost:15672" -ForegroundColor White
