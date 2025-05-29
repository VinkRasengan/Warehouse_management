using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ApiGateway.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IConfiguration configuration, ILogger<AuthController> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        // TODO: Implement proper user authentication with database
        // For now, using hardcoded credentials for demo
        if (request.Username == "admin" && request.Password == "password")
        {
            var token = GenerateJwtToken(request.Username, "Admin");
            return Ok(new { token, expiresIn = 3600 });
        }

        return Unauthorized(new { message = "Invalid credentials" });
    }

    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterRequest request)
    {
        // TODO: Implement user registration with database
        _logger.LogInformation("User registration attempt for username: {Username}", request.Username);
        
        // For demo purposes, return success
        return Ok(new { message = "User registered successfully" });
    }

    private string GenerateJwtToken(string username, string role)
    {
        var jwtSecret = _configuration["JWT_SECRET"] ?? "your-jwt-secret-key-here-make-it-long-and-secure";
        var jwtIssuer = _configuration["JWT_ISSUER"] ?? "WarehouseManagement";
        var jwtAudience = _configuration["JWT_AUDIENCE"] ?? "WarehouseManagement";

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(jwtSecret);
        
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.Name, username),
                new Claim(ClaimTypes.Role, role),
                new Claim("username", username)
            }),
            Expires = DateTime.UtcNow.AddHours(1),
            Issuer = jwtIssuer,
            Audience = jwtAudience,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}
