# Setup Order Service without Redis/RabbitMQ dependencies
Write-Host "Setting up Order Service" -ForegroundColor Blue

Push-Location "services/order-service"

# Backup original files if not already backed up
if (-not (Test-Path "Program.cs.original")) {
    Copy-Item "Program.cs" "Program.cs.original" -Force
    Write-Host "Original Program.cs backed up" -ForegroundColor Green
}

# Check if OrderService.cs exists and backup
$orderServicePath = "Services/OrderService.cs"
if (Test-Path $orderServicePath) {
    if (-not (Test-Path "Services/OrderService.cs.original")) {
        Copy-Item $orderServicePath "Services/OrderService.cs.original" -Force
        Write-Host "Original OrderService.cs backed up" -ForegroundColor Green
    }
}

# Check if controller exists and remove [Authorize] attribute
$controllerPath = "Controllers/OrderController.cs"
if (Test-Path $controllerPath) {
    if (-not (Test-Path "Controllers/OrderController.cs.original")) {
        Copy-Item $controllerPath "Controllers/OrderController.cs.original" -Force
        Write-Host "Original OrderController.cs backed up" -ForegroundColor Green
    }
    
    # Remove [Authorize] attribute from controller
    $controllerContent = Get-Content $controllerPath -Raw
    $modifiedController = $controllerContent -replace '\[Authorize\]', '// [Authorize] // Disabled for testing'
    Set-Content -Path $controllerPath -Value $modifiedController -Encoding UTF8
    Write-Host "Removed [Authorize] from OrderController" -ForegroundColor Green
}

# Create simplified Program.cs
$simplifiedProgram = @"
using Microsoft.EntityFrameworkCore;
using OrderService.Data;
using OrderService.Services;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/order-service-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Order Service API", Version = "v1" });
});

// Configure Entity Framework
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<OrderDbContext>(options =>
    options.UseNpgsql(connectionString));

// Add AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// Add custom services (without RabbitMQ for now)
if (typeof(IOrderService).IsAssignableFrom(typeof(OrderService.Services.OrderService)))
{
    builder.Services.AddScoped<IOrderService, OrderService.Services.OrderService>();
}

// Add health checks (without Redis)
builder.Services.AddHealthChecks()
    .AddNpgSql(connectionString);

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
    var context = scope.ServiceProvider.GetRequiredService<OrderDbContext>();
    context.Database.EnsureCreated();
}

Console.WriteLine("=================================");
Console.WriteLine("Order Service Started!");
Console.WriteLine("=================================");
Console.WriteLine("Swagger UI: http://localhost:5002/swagger");
Console.WriteLine("Health Check: http://localhost:5002/health");
Console.WriteLine("API Base: http://localhost:5002/api/order");
Console.WriteLine("=================================");

app.Run();
"@

# Write simplified Program.cs
Set-Content -Path "Program.cs" -Value $simplifiedProgram -Encoding UTF8
Write-Host "Created simplified Program.cs for Order Service" -ForegroundColor Green

Write-Host "Order Service setup completed!" -ForegroundColor Green
Write-Host "You can now start the service with: dotnet run --urls http://localhost:5002" -ForegroundColor White

Pop-Location
