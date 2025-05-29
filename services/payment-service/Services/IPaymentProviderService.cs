using PaymentService.Models;

namespace PaymentService.Services
{
    public interface IPaymentProviderService
    {
        Task<PaymentResult> ProcessPaymentAsync(Payment payment);
        Task<PaymentResult> RefundPaymentAsync(Payment payment, decimal amount);
        Task<PaymentResult> CheckPaymentStatusAsync(Payment payment);
    }

    public class PaymentResult
    {
        public bool IsSuccess { get; set; }
        public string? TransactionId { get; set; }
        public string? ErrorMessage { get; set; }
        public string? ProviderResponse { get; set; }
    }
}
