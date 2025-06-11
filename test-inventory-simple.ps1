# Simple test for inventory service without Redis/RabbitMQ
Write-Host "Testing Inventory Service (Simplified)" -ForegroundColor Blue

# Create a temporary Program.cs for testing
$tempProgramCs = @"
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using InventoryService.Data;
using InventoryService.Services;
using Serilog;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure Entity Framework
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<InventoryDbContext>(options =>
    options.UseNpgsql(connectionString));

// Add custom services (without RabbitMQ)
builder.Services.AddScoped<IInventoryService, InventoryService.Services.InventoryService>();

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
    var context = scope.ServiceProvider.GetRequiredService<InventoryDbContext>();
    context.Database.EnsureCreated();
}

Console.WriteLine("Inventory Service started on http://localhost:5000");
Console.WriteLine("Swagger UI: http://localhost:5000/swagger");
Console.WriteLine("Health Check: http://localhost:5000/health");

app.Run();
"@

# Backup original Program.cs
Push-Location "services/inventory-service"

if (Test-Path "Program.cs.backup") {
    Write-Host "Backup already exists, restoring original first..." -ForegroundColor Yellow
    Copy-Item "Program.cs.backup" "Program.cs" -Force
}

Copy-Item "Program.cs" "Program.cs.backup" -Force
Write-Host "Original Program.cs backed up" -ForegroundColor Green

# Create simplified version
Set-Content -Path "Program.cs" -Value $tempProgramCs -Encoding UTF8
Write-Host "Created simplified Program.cs" -ForegroundColor Green

# Try to run the service
Write-Host "Starting simplified inventory service..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the service" -ForegroundColor Yellow

try {
    dotnet run --urls "http://localhost:5000"
}
finally {
    # Restore original Program.cs
    Write-Host "`nRestoring original Program.cs..." -ForegroundColor Yellow
    Copy-Item "Program.cs.backup" "Program.cs" -Force
    Remove-Item "Program.cs.backup" -Force
    Write-Host "Original Program.cs restored" -ForegroundColor Green
    Pop-Location
}
