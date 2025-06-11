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
    .WriteTo.File("logs/inventory-service-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Inventory Service API", Version = "v1" });
});

// Configure Entity Framework
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<InventoryDbContext>(options =>
    options.UseNpgsql(connectionString));

// Add AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// Add custom services (without RabbitMQ for now)
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

Console.WriteLine("=================================");
Console.WriteLine("Inventory Service Started!");
Console.WriteLine("=================================");
Console.WriteLine("Swagger UI: http://localhost:5000/swagger");
Console.WriteLine("Health Check: http://localhost:5000/health");
Console.WriteLine("API Base: http://localhost:5000/api/inventory");
Console.WriteLine("=================================");

app.Run();
