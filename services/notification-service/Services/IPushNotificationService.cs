namespace NotificationService.Services
{
    public interface IPushNotificationService
    {
        Task<bool> SendPushNotificationAsync(string deviceToken, string title, string body, Dictionary<string, object>? data = null);
        Task<bool> SendBulkPushNotificationAsync(List<string> deviceTokens, string title, string body, Dictionary<string, object>? data = null);
        Task<bool> SendTopicNotificationAsync(string topic, string title, string body, Dictionary<string, object>? data = null);
    }
}
