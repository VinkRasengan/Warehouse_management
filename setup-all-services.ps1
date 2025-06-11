# Setup All Services Script
Write-Host "Setting up All Warehouse Management Services" -ForegroundColor Blue
Write-Host "=============================================" -ForegroundColor Blue

# Services to setup
$services = @{
    "customer-service" = @{
        Port = 5003
        DbContext = "CustomerDbContext"
        ServiceInterface = "ICustomerService"
        ServiceClass = "CustomerService.Services.CustomerService"
        Controller = "CustomersController"
    }
    "payment-service" = @{
        Port = 5004
        DbContext = "PaymentDbContext"
        ServiceInterface = "IPaymentService"
        ServiceClass = "PaymentService.Services.PaymentService"
        Controller = "PaymentsController"
    }
    "notification-service" = @{
        Port = 5005
        DbContext = "NotificationDbContext"
        ServiceInterface = "INotificationService"
        ServiceClass = "NotificationService.Services.NotificationService"
        Controller = "NotificationsController"
    }
    "alert-service" = @{
        Port = 5006
        DbContext = "AlertDbContext"
        ServiceInterface = "IAlertService"
        ServiceClass = "AlertService.Services.AlertService"
        Controller = "AlertsController"
    }
}

foreach ($serviceName in $services.Keys) {
    $config = $services[$serviceName]
    
    Write-Host "`nSetting up $serviceName..." -ForegroundColor Yellow
    
    Push-Location "services/$serviceName"
    
    try {
        # Backup original files
        if (-not (Test-Path "Program.cs.original")) {
            Copy-Item "Program.cs" "Program.cs.original" -Force
            Write-Host "  Original Program.cs backed up" -ForegroundColor Green
        }
        
        # Remove [Authorize] from controller if exists
        $controllerPath = "Controllers/$($config.Controller).cs"
        if (Test-Path $controllerPath) {
            if (-not (Test-Path "Controllers/$($config.Controller).cs.original")) {
                Copy-Item $controllerPath "Controllers/$($config.Controller).cs.original" -Force
                Write-Host "  Original controller backed up" -ForegroundColor Green
            }
            
            $controllerContent = Get-Content $controllerPath -Raw
            $modifiedController = $controllerContent -replace '\[Authorize\]', '// [Authorize] // Disabled for testing'
            Set-Content -Path $controllerPath -Value $modifiedController -Encoding UTF8
            Write-Host "  Removed [Authorize] from controller" -ForegroundColor Green
        }
        
        # Create simplified Program.cs
        $simplifiedProgram = @"
using Microsoft.EntityFrameworkCore;
using $serviceName.Data;
using $serviceName.Services;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/$serviceName-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "$serviceName API", Version = "v1" });
});

// Configure Entity Framework
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<$($config.DbContext)>(options =>
    options.UseNpgsql(connectionString));

// Add AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// Add custom services (without RabbitMQ for now)
builder.Services.AddScoped<$($config.ServiceInterface), $($config.ServiceClass)>();

// Add health checks
builder.Services.AddHealthChecks();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowAll");
app.MapControllers();
app.MapHealthChecks("/health");

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<$($config.DbContext)>();
    context.Database.EnsureCreated();
}

Console.WriteLine("=================================");
Console.WriteLine("$serviceName Started!");
Console.WriteLine("=================================");
Console.WriteLine("Swagger UI: http://localhost:$($config.Port)/swagger");
Console.WriteLine("Health Check: http://localhost:$($config.Port)/health");
Console.WriteLine("=================================");

app.Run();
"@
        
        # Write simplified Program.cs
        Set-Content -Path "Program.cs" -Value $simplifiedProgram -Encoding UTF8
        Write-Host "  Created simplified Program.cs" -ForegroundColor Green
        
        # Remove RabbitMQ dependencies from service class if exists
        $serviceClassPath = "Services/$serviceName.cs"
        if (Test-Path $serviceClassPath) {
            if (-not (Test-Path "Services/$serviceName.cs.original")) {
                Copy-Item $serviceClassPath "Services/$serviceName.cs.original" -Force
                Write-Host "  Original service class backed up" -ForegroundColor Green
            }
            
            $serviceContent = Get-Content $serviceClassPath -Raw
            $modifiedService = $serviceContent -replace 'IRabbitMQService _rabbitMQService', '// IRabbitMQService _rabbitMQService // Disabled'
            $modifiedService = $modifiedService -replace 'IRabbitMQService rabbitMQService', '// IRabbitMQService rabbitMQService // Disabled'
            $modifiedService = $modifiedService -replace '_rabbitMQService = rabbitMQService', '// _rabbitMQService = rabbitMQService // Disabled'
            $modifiedService = $modifiedService -replace 'await _rabbitMQService\.PublishAsync', '// await _rabbitMQService.PublishAsync // Disabled'
            Set-Content -Path $serviceClassPath -Value $modifiedService -Encoding UTF8
            Write-Host "  Removed RabbitMQ dependencies from service class" -ForegroundColor Green
        }
        
        Write-Host "  $serviceName setup completed!" -ForegroundColor Green
    }
    catch {
        Write-Host "  Error setting up $serviceName`: $($_.Exception.Message)" -ForegroundColor Red
    }
    finally {
        Pop-Location
    }
}

Write-Host "`nAll services setup completed!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

Write-Host "`nServices ready to start:" -ForegroundColor Cyan
Write-Host "  inventory-service: http://localhost:5000" -ForegroundColor White
Write-Host "  order-service: http://localhost:5002" -ForegroundColor White
Write-Host "  customer-service: http://localhost:5003" -ForegroundColor White
Write-Host "  payment-service: http://localhost:5004" -ForegroundColor White
Write-Host "  notification-service: http://localhost:5005" -ForegroundColor White
Write-Host "  alert-service: http://localhost:5006" -ForegroundColor White

Write-Host "`nTo start all services, run: start-all-services.ps1" -ForegroundColor Cyan
