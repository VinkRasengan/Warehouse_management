using AlertService.DTOs;

namespace AlertService.Services
{
    public interface IAlertService
    {
        Task<AlertDto> CreateAlertAsync(CreateAlertDto createAlertDto);
        Task<AlertDto?> GetAlertByIdAsync(int id);
        Task<IEnumerable<AlertDto>> GetAlertsAsync(string? type = null, string? severity = null, bool? isResolved = null);
        Task<AlertDto> ResolveAlertAsync(int id, string resolvedBy, string? resolution = null);
        Task<bool> DeleteAlertAsync(int id);
        Task<IEnumerable<AlertDto>> GetUnresolvedAlertsAsync();
        Task ProcessInventoryAlertAsync(int productId, string productName, int currentStock, int minimumThreshold);
        Task ProcessPaymentAlertAsync(int paymentId, string reason);
        Task ProcessOrderAlertAsync(int orderId, string alertType, string message);
    }
}
