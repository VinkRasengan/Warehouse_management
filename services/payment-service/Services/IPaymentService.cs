using PaymentService.DTOs;
using PaymentService.Models;

namespace PaymentService.Services
{
    public interface IPaymentService
    {
        Task<PaymentDto> CreatePaymentAsync(CreatePaymentDto createPaymentDto);
        Task<PaymentDto?> GetPaymentByIdAsync(int id);
        Task<PaymentDto?> GetPaymentByTransactionIdAsync(string transactionId);
        Task<IEnumerable<PaymentDto>> GetPaymentsByOrderIdAsync(int orderId);
        Task<PaymentDto> ProcessPaymentAsync(ProcessPaymentDto processPaymentDto);
        Task<PaymentDto> RefundPaymentAsync(RefundPaymentDto refundPaymentDto);
        Task<PaymentDto> UpdatePaymentStatusAsync(int paymentId, PaymentStatus status, string? reason = null);
        Task<IEnumerable<PaymentDto>> GetPaymentsByStatusAsync(PaymentStatus status);
        Task<IEnumerable<PaymentDto>> GetPaymentsByDateRangeAsync(DateTime startDate, DateTime endDate);
    }
}
