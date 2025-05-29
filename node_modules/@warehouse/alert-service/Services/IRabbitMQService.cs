namespace AlertService.Services
{
    public interface IRabbitMQService
    {
        Task PublishAlertCreatedAsync(int alertId, string alertType, string severity);
        Task PublishAlertResolvedAsync(int alertId, string resolvedBy);
    }
}
