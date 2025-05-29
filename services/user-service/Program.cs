using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using UserService.Models;
using UserService.Services;
using UserService.Mappings;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/user-service-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "User Service API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new()
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new()
    {
        {
            new()
            {
                Reference = new() { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// Configure MongoDB
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));

// Configure JWT Authentication
var jwtKey = builder.Configuration["JWT:Key"] ?? "your-super-secret-key-that-is-at-least-32-characters-long";
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
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.Zero
        };
    });

// Add AutoMapper
builder.Services.AddAutoMapper(typeof(UserMappingProfile));

// Add custom services
builder.Services.AddScoped<IAuthService, AuthService>();

// Add Health Checks
builder.Services.AddHealthChecks()
    .AddMongoDb(builder.Configuration.GetConnectionString("MongoDB") ?? "mongodb://localhost:27017");

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
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health");

// Seed default admin user
await SeedDefaultUsers(app.Services);

app.Run();

static async Task SeedDefaultUsers(IServiceProvider services)
{
    using var scope = services.CreateScope();
    var authService = scope.ServiceProvider.GetRequiredService<IAuthService>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    try
    {
        // Check if admin user exists
        var adminUser = await authService.GetUserByEmailAsync("admin@warehouse.com");
        if (adminUser == null)
        {
            // Create default admin user
            var adminRequest = new RegisterRequest
            {
                Email = "admin@warehouse.com",
                FirstName = "Admin",
                LastName = "User",
                Password = "admin123",
                ConfirmPassword = "admin123"
            };

            await authService.RegisterAsync(adminRequest);
            logger.LogInformation("Default admin user created: admin@warehouse.com / admin123");
        }

        // Create other demo users
        var demoUsers = new[]
        {
            new RegisterRequest { Email = "manager@warehouse.com", FirstName = "Manager", LastName = "User", Password = "manager123", ConfirmPassword = "manager123" },
            new RegisterRequest { Email = "staff@warehouse.com", FirstName = "Staff", LastName = "User", Password = "staff123", ConfirmPassword = "staff123" }
        };

        foreach (var demoUser in demoUsers)
        {
            var existingUser = await authService.GetUserByEmailAsync(demoUser.Email);
            if (existingUser == null)
            {
                await authService.RegisterAsync(demoUser);
                logger.LogInformation("Demo user created: {Email} / {Password}", demoUser.Email, demoUser.Password);
            }
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error seeding default users");
    }
}
