using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ProductService.Data;
using ProductService.Services;
using ProductService.Models;
using Serilog;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/product-service-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure Entity Framework - Temporarily disabled for MongoDB migration
// var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
// Console.WriteLine($"Connection String: {connectionString}");
// builder.Services.AddDbContext<ProductDbContext>(options =>
//     options.UseNpgsql(connectionString));

// Configure JWT Authentication
var jwtSecret = builder.Configuration["JWT:Key"] ?? "your-super-secret-key-that-is-at-least-32-characters-long";
var jwtIssuer = builder.Configuration["JWT:Issuer"] ?? "WarehouseManagement";
var jwtAudience = builder.Configuration["JWT:Audience"] ?? "WarehouseManagement";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

builder.Services.AddAuthorization();

// Add AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// Add custom services
builder.Services.AddSingleton<IMongoRepository<Product>, InMemoryProductRepository>();
builder.Services.AddScoped<IProductService, ProductService.Services.ProductService>();
builder.Services.AddSingleton<IRabbitMQService, RabbitMQService>();

// Add health checks - Temporarily disabled for MongoDB migration
builder.Services.AddHealthChecks();
// var healthChecksBuilder = builder.Services.AddHealthChecks();
// if (!string.IsNullOrEmpty(connectionString))
// {
//     healthChecksBuilder.AddNpgSql(connectionString);
// }

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
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

// Ensure database is created - Temporarily disabled for MongoDB migration
// using (var scope = app.Services.CreateScope())
// {
//     var context = scope.ServiceProvider.GetRequiredService<ProductDbContext>();
//     context.Database.EnsureCreated();
// }

app.Run();
