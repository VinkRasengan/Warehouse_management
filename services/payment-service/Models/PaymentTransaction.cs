using System.ComponentModel.DataAnnotations;

namespace PaymentService.Models
{
    public class PaymentTransaction
    {
        public int Id { get; set; }
        
        [Required]
        public int PaymentId { get; set; }
        
        [Required]
        public string TransactionType { get; set; } = string.Empty; // Payment, Refund, Partial Refund
        
        [Required]
        public decimal Amount { get; set; }
        
        [Required]
        public TransactionStatus Status { get; set; }
        
        public string? ExternalTransactionId { get; set; }
        
        public string? ProviderResponse { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? ProcessedAt { get; set; }
        
        public string? Notes { get; set; }
        
        // Navigation properties
        public Payment Payment { get; set; } = null!;
    }

    public enum TransactionStatus
    {
        Pending = 1,
        Processing = 2,
        Completed = 3,
        Failed = 4,
        Cancelled = 5
    }
}
