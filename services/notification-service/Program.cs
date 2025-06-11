using Microsoft.EntityFrameworkCore;
using notification-service.Data;
using notification-service.Services;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/notification-service-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "notification-service API", Version = "v1" });
});

// Configure Entity Framework
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<NotificationDbContext>(options =>
    options.UseNpgsql(connectionString));

// Add AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// Add custom services (without RabbitMQ for now)
builder.Services.AddScoped<INotificationService, NotificationService.Services.NotificationService>();

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
    var context = scope.ServiceProvider.GetRequiredService<NotificationDbContext>();
    context.Database.EnsureCreated();
}

Console.WriteLine("=================================");
Console.WriteLine("notification-service Started!");
Console.WriteLine("=================================");
Console.WriteLine("Swagger UI: http://localhost:5005/swagger");
Console.WriteLine("Health Check: http://localhost:5005/health");
Console.WriteLine("=================================");

app.Run();
