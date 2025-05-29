using System.ComponentModel.DataAnnotations;

namespace PaymentService.Models
{
    public class Payment
    {
        public int Id { get; set; }
        
        [Required]
        public string TransactionId { get; set; } = string.Empty;
        
        [Required]
        public int OrderId { get; set; }
        
        [Required]
        public decimal Amount { get; set; }
        
        [Required]
        public string Currency { get; set; } = "VND";
        
        [Required]
        public PaymentMethod PaymentMethod { get; set; }
        
        [Required]
        public PaymentStatus Status { get; set; }
        
        public string? PaymentProviderId { get; set; }
        
        public string? PaymentProviderTransactionId { get; set; }
        
        public string? PaymentProviderResponse { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? ProcessedAt { get; set; }
        
        public DateTime? CompletedAt { get; set; }
        
        public string? FailureReason { get; set; }
        
        public string? CustomerEmail { get; set; }
        
        public string? CustomerPhone { get; set; }
        
        public string? Description { get; set; }
        
        // Navigation properties
        public ICollection<PaymentTransaction> Transactions { get; set; } = new List<PaymentTransaction>();
    }

    public enum PaymentMethod
    {
        Cash = 1,
        CreditCard = 2,
        DebitCard = 3,
        MoMo = 4,
        ZaloPay = 5,
        VNPay = 6,
        BankTransfer = 7
    }

    public enum PaymentStatus
    {
        Pending = 1,
        Processing = 2,
        Completed = 3,
        Failed = 4,
        Cancelled = 5,
        Refunded = 6,
        PartiallyRefunded = 7
    }
}
