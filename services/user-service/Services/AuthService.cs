using MongoDB.Driver;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;
using UserService.Models;
using AutoMapper;

namespace UserService.Services
{
    public class AuthService : IAuthService
    {
        private readonly IMongoCollection<User> _users;
        private readonly IConfiguration _configuration;
        private readonly IMapper _mapper;
        private readonly ILogger<AuthService> _logger;

        public AuthService(
            IOptions<MongoDbSettings> settings,
            IConfiguration configuration,
            IMapper mapper,
            ILogger<AuthService> logger)
        {
            var client = new MongoClient(settings.Value.ConnectionString);
            var database = client.GetDatabase(settings.Value.DatabaseName);
            _users = database.GetCollection<User>(settings.Value.UsersCollectionName);
            _configuration = configuration;
            _mapper = mapper;
            _logger = logger;

            // Create indexes
            CreateIndexes();
        }

        private void CreateIndexes()
        {
            var emailIndex = Builders<User>.IndexKeys.Ascending(x => x.Email);
            _users.Indexes.CreateOne(new CreateIndexModel<User>(emailIndex, new CreateIndexOptions { Unique = true }));
        }

        public async Task<LoginResponse> LoginAsync(LoginRequest request)
        {
            try
            {
                var user = await _users.Find(x => x.Email == request.Email).FirstOrDefaultAsync();
                
                if (user == null || !user.IsActive)
                {
                    throw new UnauthorizedAccessException("Invalid email or password");
                }

                if (!VerifyPassword(request.Password, user.PasswordHash))
                {
                    throw new UnauthorizedAccessException("Invalid email or password");
                }

                // Update last login
                user.LastLoginAt = DateTime.UtcNow;
                await _users.ReplaceOneAsync(x => x.Id == user.Id, user);

                var token = await GenerateJwtTokenAsync(user);
                var userDto = _mapper.Map<UserDto>(user);

                return new LoginResponse
                {
                    Token = token,
                    User = userDto,
                    ExpiresAt = DateTime.UtcNow.AddHours(24)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during login for email: {Email}", request.Email);
                throw;
            }
        }

        public async Task<UserDto> RegisterAsync(RegisterRequest request)
        {
            try
            {
                // Check if user already exists
                var existingUser = await _users.Find(x => x.Email == request.Email).FirstOrDefaultAsync();
                if (existingUser != null)
                {
                    throw new InvalidOperationException("User with this email already exists");
                }

                // Create new user
                var user = new User
                {
                    Email = request.Email,
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    PasswordHash = HashPassword(request.Password),
                    PhoneNumber = request.PhoneNumber,
                    Role = "staff", // Default role
                    IsActive = true,
                    EmailVerified = false,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    Permissions = GetDefaultPermissions("staff")
                };

                await _users.InsertOneAsync(user);
                
                _logger.LogInformation("User registered successfully: {Email}", request.Email);
                
                return _mapper.Map<UserDto>(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during registration for email: {Email}", request.Email);
                throw;
            }
        }

        public async Task<UserDto?> GetUserByIdAsync(string id)
        {
            try
            {
                var user = await _users.Find(x => x.Id == id).FirstOrDefaultAsync();
                return user != null ? _mapper.Map<UserDto>(user) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user by ID: {Id}", id);
                throw;
            }
        }

        public async Task<UserDto?> GetUserByEmailAsync(string email)
        {
            try
            {
                var user = await _users.Find(x => x.Email == email).FirstOrDefaultAsync();
                return user != null ? _mapper.Map<UserDto>(user) : null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user by email: {Email}", email);
                throw;
            }
        }

        public async Task<bool> VerifyPasswordAsync(string password, string hash)
        {
            return await Task.FromResult(VerifyPassword(password, hash));
        }

        public async Task<string> GenerateJwtTokenAsync(User user)
        {
            var jwtKey = _configuration["JWT:Key"] ?? "your-super-secret-key-that-is-at-least-32-characters-long";
            var jwtIssuer = _configuration["JWT:Issuer"] ?? "WarehouseManagement";
            var jwtAudience = _configuration["JWT:Audience"] ?? "WarehouseManagement";

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(jwtKey);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("firstName", user.FirstName),
                new Claim("lastName", user.LastName)
            };

            // Add permissions as claims
            foreach (var permission in user.Permissions)
            {
                claims.Add(new Claim("permission", permission));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(24),
                Issuer = jwtIssuer,
                Audience = jwtAudience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return await Task.FromResult(tokenHandler.WriteToken(token));
        }

        public async Task<bool> ValidateTokenAsync(string token)
        {
            try
            {
                var jwtKey = _configuration["JWT:Key"] ?? "your-super-secret-key-that-is-at-least-32-characters-long";
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(jwtKey);

                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _configuration["JWT:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = _configuration["JWT:Audience"],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                return await Task.FromResult(true);
            }
            catch
            {
                return await Task.FromResult(false);
            }
        }

        public async Task<UserDto> UpdateUserAsync(string id, User user)
        {
            try
            {
                user.UpdatedAt = DateTime.UtcNow;
                await _users.ReplaceOneAsync(x => x.Id == id, user);
                return _mapper.Map<UserDto>(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user: {Id}", id);
                throw;
            }
        }

        public async Task<bool> ChangePasswordAsync(string userId, string currentPassword, string newPassword)
        {
            try
            {
                var user = await _users.Find(x => x.Id == userId).FirstOrDefaultAsync();
                if (user == null || !VerifyPassword(currentPassword, user.PasswordHash))
                {
                    return false;
                }

                user.PasswordHash = HashPassword(newPassword);
                user.UpdatedAt = DateTime.UtcNow;

                await _users.ReplaceOneAsync(x => x.Id == userId, user);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error changing password for user: {UserId}", userId);
                return false;
            }
        }

        public async Task<bool> ResetPasswordAsync(string email)
        {
            try
            {
                var user = await _users.Find(x => x.Email == email).FirstOrDefaultAsync();
                if (user == null)
                {
                    return false;
                }

                // Generate temporary password
                var tempPassword = GenerateTemporaryPassword();
                user.PasswordHash = HashPassword(tempPassword);
                user.UpdatedAt = DateTime.UtcNow;

                await _users.ReplaceOneAsync(x => x.Id == user.Id, user);

                // TODO: Send email with temporary password
                _logger.LogInformation("Password reset for user: {Email}. Temp password: {TempPassword}", email, tempPassword);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resetting password for email: {Email}", email);
                return false;
            }
        }

        private static string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password, BCrypt.Net.BCrypt.GenerateSalt());
        }

        private static bool VerifyPassword(string password, string hash)
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }

        private static string GenerateTemporaryPassword()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, 8).Select(s => s[random.Next(s.Length)]).ToArray());
        }

        private static List<string> GetDefaultPermissions(string role)
        {
            return role.ToLower() switch
            {
                "admin" => new List<string> { "all" },
                "manager" => new List<string> 
                { 
                    "products:view", "products:create", "products:update", "products:delete",
                    "inventory:view", "inventory:update", "inventory:adjust",
                    "orders:view", "orders:create", "orders:update", "orders:process",
                    "customers:view", "customers:create", "customers:update",
                    "reports:view", "reports:export"
                },
                "staff" => new List<string> 
                { 
                    "products:view", "products:create", "products:update",
                    "inventory:view", "inventory:update",
                    "orders:view", "orders:create", "orders:update", "orders:process",
                    "customers:view", "customers:create", "customers:update",
                    "reports:view"
                },
                "viewer" => new List<string> 
                { 
                    "products:view", "inventory:view", "orders:view", "customers:view", "reports:view"
                },
                _ => new List<string>()
            };
        }
    }
}
