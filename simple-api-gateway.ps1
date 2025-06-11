# Create Simple API Gateway without Ocelot
Write-Host "Creating Simple API Gateway" -ForegroundColor Blue

Push-Location "api-gateway-dotnet"

# Backup current Program.cs
if (-not (Test-Path "Program.cs.ocelot")) {
    Copy-Item "Program.cs" "Program.cs.ocelot" -Force
    Write-Host "Ocelot Program.cs backed up" -ForegroundColor Green
}

# Create simple API Gateway Program.cs
$simpleProgram = @"
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

// Add HttpClient for proxying requests
builder.Services.AddHttpClient();

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

// Service mapping
var serviceMap = new Dictionary<string, string>
{
    { "/api/inventory", "http://localhost:5000" },
    { "/api/orders", "http://localhost:5002" },
    { "/api/customers", "http://localhost:5003" },
    { "/api/payments", "http://localhost:5004" },
    { "/api/notifications", "http://localhost:5005" },
    { "/api/alerts", "http://localhost:5006" }
};

// Health check endpoint
app.MapGet("/health", () => "API Gateway is healthy");

// Service status endpoint
app.MapGet("/status", () => new { 
    gateway = "healthy", 
    timestamp = DateTime.UtcNow,
    services = serviceMap
});

// Proxy middleware
app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value;
    
    // Skip if it's a gateway endpoint
    if (path == "/health" || path == "/status" || path.StartsWith("/swagger"))
    {
        await next();
        return;
    }
    
    // Find matching service
    var service = serviceMap.FirstOrDefault(s => path.StartsWith(s.Key));
    if (service.Key != null)
    {
        var httpClient = context.RequestServices.GetRequiredService<IHttpClientFactory>().CreateClient();
        var targetUrl = service.Value + path;
        
        try
        {
            var response = await httpClient.GetAsync(targetUrl);
            var content = await response.Content.ReadAsStringAsync();
            
            context.Response.StatusCode = (int)response.StatusCode;
            context.Response.ContentType = response.Content.Headers.ContentType?.ToString() ?? "application/json";
            await context.Response.WriteAsync(content);
        }
        catch (Exception ex)
        {
            context.Response.StatusCode = 503;
            await context.Response.WriteAsync($"Service unavailable: {ex.Message}");
        }
    }
    else
    {
        await next();
    }
});

app.MapControllers();

Console.WriteLine("=================================");
Console.WriteLine("Simple API Gateway Started!");
Console.WriteLine("=================================");
Console.WriteLine("Gateway URL: http://localhost:5001");
Console.WriteLine("Swagger UI: http://localhost:5001/swagger");
Console.WriteLine("Health Check: http://localhost:5001/health");
Console.WriteLine("Service Status: http://localhost:5001/status");
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

app.Run();
"@

# Write simple Program.cs
Set-Content -Path "Program.cs" -Value $simpleProgram -Encoding UTF8
Write-Host "Created simple API Gateway Program.cs" -ForegroundColor Green

Write-Host "Simple API Gateway setup completed!" -ForegroundColor Green
Write-Host "You can now start the gateway with: dotnet run --urls http://localhost:5001" -ForegroundColor White

Pop-Location
