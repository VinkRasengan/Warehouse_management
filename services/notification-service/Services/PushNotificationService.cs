using System.Text.Json;

namespace NotificationService.Services
{
    public class PushNotificationService : IPushNotificationService
    {
        private readonly ILogger<PushNotificationService> _logger;
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public PushNotificationService(ILogger<PushNotificationService> logger, HttpClient httpClient, IConfiguration configuration)
        {
            _logger = logger;
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<bool> SendPushNotificationAsync(string deviceToken, string title, string body, Dictionary<string, object>? data = null)
        {
            try
            {
                // This is a simplified implementation
                // In a real scenario, you would integrate with Firebase Cloud Messaging (FCM) or Apple Push Notification Service (APNS)
                
                var payload = new
                {
                    to = deviceToken,
                    notification = new
                    {
                        title = title,
                        body = body
                    },
                    data = data ?? new Dictionary<string, object>()
                };

                var json = JsonSerializer.Serialize(payload);
                _logger.LogInformation("Push notification payload: {Payload}", json);

                // Simulate sending push notification
                await Task.Delay(100);

                _logger.LogInformation("Push notification sent successfully to device {DeviceToken}", deviceToken);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send push notification to device {DeviceToken}", deviceToken);
                return false;
            }
        }

        public async Task<bool> SendBulkPushNotificationAsync(List<string> deviceTokens, string title, string body, Dictionary<string, object>? data = null)
        {
            var tasks = deviceTokens.Select(token => SendPushNotificationAsync(token, title, body, data));
            var results = await Task.WhenAll(tasks);
            
            var successCount = results.Count(r => r);
            _logger.LogInformation("Bulk push notification sent: {SuccessCount}/{TotalCount} successful", successCount, deviceTokens.Count);
            
            return successCount == deviceTokens.Count;
        }

        public async Task<bool> SendTopicNotificationAsync(string topic, string title, string body, Dictionary<string, object>? data = null)
        {
            try
            {
                var payload = new
                {
                    to = $"/topics/{topic}",
                    notification = new
                    {
                        title = title,
                        body = body
                    },
                    data = data ?? new Dictionary<string, object>()
                };

                var json = JsonSerializer.Serialize(payload);
                _logger.LogInformation("Topic notification payload: {Payload}", json);

                // Simulate sending topic notification
                await Task.Delay(100);

                _logger.LogInformation("Topic notification sent successfully to topic {Topic}", topic);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send topic notification to topic {Topic}", topic);
                return false;
            }
        }
    }
}
