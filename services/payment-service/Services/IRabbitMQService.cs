namespace PaymentService.Services
{
    public interface IRabbitMQService
    {
        Task PublishPaymentCompletedAsync(int orderId, decimal amount, string transactionId);
        Task PublishPaymentFailedAsync(int orderId, string reason);
        Task PublishRefundCompletedAsync(int orderId, decimal amount, string transactionId);
    }
}
