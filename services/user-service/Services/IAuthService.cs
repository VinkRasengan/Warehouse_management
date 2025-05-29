using UserService.Models;

namespace UserService.Services
{
    public interface IAuthService
    {
        Task<LoginResponse> LoginAsync(LoginRequest request);
        Task<UserDto> RegisterAsync(RegisterRequest request);
        Task<UserDto?> GetUserByIdAsync(string id);
        Task<UserDto?> GetUserByEmailAsync(string email);
        Task<bool> VerifyPasswordAsync(string password, string hash);
        Task<string> GenerateJwtTokenAsync(User user);
        Task<bool> ValidateTokenAsync(string token);
        Task<UserDto> UpdateUserAsync(string id, User user);
        Task<bool> ChangePasswordAsync(string userId, string currentPassword, string newPassword);
        Task<bool> ResetPasswordAsync(string email);
    }
}
