namespace NotificationService.Services
{
    public interface IRealTimeNotificationService
    {
        Task SendNotificationToUserAsync(string userId, object notification);
        Task SendNotificationToGroupAsync(string groupName, object notification);
        Task SendNotificationToAllAsync(object notification);
        Task SendOrderNotificationAsync(string customerId, string orderId, string status, string message);
        Task SendInventoryAlertAsync(string productId, string productName, int currentStock, int minStock);
        Task SendSystemAlertAsync(string message, string severity = "info");
    }
}
