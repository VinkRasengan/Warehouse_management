using PaymentService.Models;

namespace PaymentService.DTOs
{
    public class CreatePaymentDto
    {
        public int OrderId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "VND";
        public PaymentMethod PaymentMethod { get; set; }
        public string? CustomerEmail { get; set; }
        public string? CustomerPhone { get; set; }
        public string? Description { get; set; }
    }

    public class PaymentDto
    {
        public int Id { get; set; }
        public string TransactionId { get; set; } = string.Empty;
        public int OrderId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public PaymentMethod PaymentMethod { get; set; }
        public PaymentStatus Status { get; set; }
        public string? PaymentProviderId { get; set; }
        public string? PaymentProviderTransactionId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ProcessedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string? FailureReason { get; set; }
        public string? CustomerEmail { get; set; }
        public string? CustomerPhone { get; set; }
        public string? Description { get; set; }
        public List<PaymentTransactionDto> Transactions { get; set; } = new();
    }

    public class PaymentTransactionDto
    {
        public int Id { get; set; }
        public int PaymentId { get; set; }
        public string TransactionType { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public TransactionStatus Status { get; set; }
        public string? ExternalTransactionId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ProcessedAt { get; set; }
        public string? Notes { get; set; }
    }

    public class ProcessPaymentDto
    {
        public int PaymentId { get; set; }
        public string? PaymentProviderTransactionId { get; set; }
        public string? PaymentProviderResponse { get; set; }
    }

    public class RefundPaymentDto
    {
        public int PaymentId { get; set; }
        public decimal? Amount { get; set; } // If null, full refund
        public string? Reason { get; set; }
    }
}
