using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.ComponentModel.DataAnnotations;

namespace UserService.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class SimpleAuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<SimpleAuthController> _logger;

        // Demo users (in-memory)
        private static readonly Dictionary<string, (string Password, string Role, string Name)> DemoUsers = new()
        {
            { "admin@warehouse.com", ("admin123", "Admin", "Administrator") },
            { "manager@warehouse.com", ("manager123", "Manager", "Manager User") },
            { "staff@warehouse.com", ("staff123", "Staff", "Staff User") },
            { "demo", ("demo", "User", "Demo User") },
            { "admin", ("admin", "Admin", "Admin User") }
        };

        public SimpleAuthController(IConfiguration configuration, ILogger<SimpleAuthController> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        [HttpPost("login")]
        public ActionResult<object> Login([FromBody] SimpleLoginRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Check demo users
                var userKey = request.Email?.ToLower() ?? request.Username?.ToLower();
                if (string.IsNullOrEmpty(userKey))
                {
                    return Unauthorized(new { message = "Email or username is required" });
                }

                if (DemoUsers.TryGetValue(userKey, out var user))
                {
                    if (user.Password == request.Password)
                    {
                        var token = GenerateJwtToken(userKey, user.Role, user.Name);
                        
                        _logger.LogInformation("User logged in successfully: {Email}", userKey);
                        
                        return Ok(new
                        {
                            token = token,
                            user = new
                            {
                                id = Guid.NewGuid().ToString(),
                                email = userKey.Contains("@") ? userKey : $"{userKey}@warehouse.com",
                                name = user.Name,
                                role = user.Role
                            },
                            expiresIn = 3600
                        });
                    }
                }

                _logger.LogWarning("Login failed for: {Email}", userKey);
                return Unauthorized(new { message = "Invalid credentials" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpGet("demo-users")]
        public ActionResult<object> GetDemoUsers()
        {
            var users = DemoUsers.Select(u => new
            {
                email = u.Key,
                password = u.Value.Password,
                role = u.Value.Role,
                name = u.Value.Name
            });

            return Ok(new { users = users });
        }

        [HttpGet("health")]
        public ActionResult Health()
        {
            return Ok(new { status = "healthy", service = "user-service", timestamp = DateTime.UtcNow });
        }

        private string GenerateJwtToken(string email, string role, string name)
        {
            var jwtKey = _configuration["JWT:Key"] ?? "your-super-secret-key-that-is-at-least-32-characters-long";
            var jwtIssuer = _configuration["JWT:Issuer"] ?? "WarehouseManagement";
            var jwtAudience = _configuration["JWT:Audience"] ?? "WarehouseManagement";

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Email, email),
                new Claim(ClaimTypes.Name, name),
                new Claim(ClaimTypes.Role, role),
                new Claim("email", email),
                new Claim("role", role)
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class SimpleLoginRequest
    {
        public string? Email { get; set; }
        public string? Username { get; set; }

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}
