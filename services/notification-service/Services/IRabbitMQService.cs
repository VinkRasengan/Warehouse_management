namespace NotificationService.Services
{
    public interface IRabbitMQService
    {
        Task StartListeningAsync();
        void StopListening();
        Task PublishNotificationSentAsync(int notificationId, string recipient, string type);
        Task PublishNotificationFailedAsync(int notificationId, string recipient, string type, string error);
    }
}
