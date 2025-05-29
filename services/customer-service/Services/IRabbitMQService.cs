namespace CustomerService.Services
{
    public interface IRabbitMQService
    {
        Task PublishCustomerCreatedAsync(int customerId, string customerEmail);
        Task PublishCustomerUpdatedAsync(int customerId, string customerEmail);
        Task PublishLoyaltyPointsChangedAsync(int customerId, int newPoints, string tier);
    }
}
