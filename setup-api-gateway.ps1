# Setup API Gateway for local development
Write-Host "Setting up API Gateway for local development" -ForegroundColor Blue

Push-Location "api-gateway-dotnet"

# Backup original files
if (-not (Test-Path "Program.cs.original")) {
    Copy-Item "Program.cs" "Program.cs.original" -Force
    Write-Host "Original Program.cs backed up" -ForegroundColor Green
}

if (-not (Test-Path "ocelot.json.original")) {
    Copy-Item "ocelot.json" "ocelot.json.original" -Force
    Write-Host "Original ocelot.json backed up" -ForegroundColor Green
}

# Create simplified Program.cs without authentication
$simplifiedProgram = @"
using Ocelot.DependencyInjection;
using Ocelot.Middleware;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/api-gateway-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Warehouse Management API Gateway", Version = "v1" });
});

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

// Add Ocelot with local configuration
builder.Configuration.AddJsonFile("ocelot.local.json", optional: false, reloadOnChange: true);
builder.Services.AddOcelot();

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowAll");
app.MapControllers();

// Add health check endpoint
app.MapGet("/health", () => "API Gateway is healthy");

// Add service status endpoint
app.MapGet("/status", async () =>
{
    var services = new Dictionary<string, object>
    {
        { "inventory-service", "http://localhost:5000" },
        { "order-service", "http://localhost:5002" },
        { "customer-service", "http://localhost:5003" },
        { "payment-service", "http://localhost:5004" },
        { "notification-service", "http://localhost:5005" },
        { "alert-service", "http://localhost:5006" }
    };
    
    return new { 
        gateway = "healthy", 
        timestamp = DateTime.UtcNow,
        services = services
    };
});

Console.WriteLine("=================================");
Console.WriteLine("API Gateway Started!");
Console.WriteLine("=================================");
Console.WriteLine("Gateway URL: http://localhost:5000");
Console.WriteLine("Swagger UI: http://localhost:5000/swagger");
Console.WriteLine("Health Check: http://localhost:5000/health");
Console.WriteLine("Service Status: http://localhost:5000/status");
Console.WriteLine("=================================");
Console.WriteLine("");
Console.WriteLine("Available Routes:");
Console.WriteLine("  GET  /api/inventory     -> inventory-service:5000");
Console.WriteLine("  GET  /api/orders        -> order-service:5002");
Console.WriteLine("  GET  /api/customers     -> customer-service:5003");
Console.WriteLine("  GET  /api/payments      -> payment-service:5004");
Console.WriteLine("  GET  /api/notifications -> notification-service:5005");
Console.WriteLine("  GET  /api/alerts        -> alert-service:5006");
Console.WriteLine("=================================");

// Use Ocelot middleware
await app.UseOcelot();

app.Run();
"@

# Write simplified Program.cs
Set-Content -Path "Program.cs" -Value $simplifiedProgram -Encoding UTF8
Write-Host "Created simplified Program.cs" -ForegroundColor Green

# Copy local ocelot config
Copy-Item "ocelot.local.json" "ocelot.json" -Force
Write-Host "Using local ocelot configuration" -ForegroundColor Green

Write-Host "API Gateway setup completed!" -ForegroundColor Green
Write-Host "You can now start the gateway with: dotnet run --urls http://localhost:5000" -ForegroundColor White

Pop-Location
