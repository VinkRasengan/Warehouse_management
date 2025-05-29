using AlertService.DTOs;

namespace AlertService.Services
{
    public interface IEmailService
    {
        Task SendAlertEmailAsync(string title, string message, string severity);
        Task SendAlertDigestAsync(List<string> recipients, List<AlertDto> alerts);
    }
}
