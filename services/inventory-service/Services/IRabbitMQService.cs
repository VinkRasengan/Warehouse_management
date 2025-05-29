namespace InventoryService.Services;

public interface IRabbitMQService
{
    Task PublishAsync(string eventName, object data);
    void Dispose();
}
