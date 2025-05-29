using System.ComponentModel.DataAnnotations;

namespace NotificationService.Models
{
    public class Notification
    {
        public int Id { get; set; }
        
        [Required]
        public NotificationType Type { get; set; }
        
        [Required]
        public string Recipient { get; set; } = string.Empty; // Email, phone number, or device token
        
        [Required]
        public string Subject { get; set; } = string.Empty;
        
        [Required]
        public string Message { get; set; } = string.Empty;
        
        public string? TemplateId { get; set; }
        
        public string? TemplateData { get; set; } // JSON data for template
        
        [Required]
        public NotificationStatus Status { get; set; }
        
        public int Priority { get; set; } = 1; // 1 = Low, 2 = Medium, 3 = High, 4 = Critical
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? ScheduledAt { get; set; }
        
        public DateTime? SentAt { get; set; }
        
        public DateTime? DeliveredAt { get; set; }
        
        public string? ErrorMessage { get; set; }
        
        public int RetryCount { get; set; } = 0;
        
        public int MaxRetries { get; set; } = 3;
        
        public string? ExternalId { get; set; } // ID from external service (Twilio, etc.)
        
        public string? Metadata { get; set; } // Additional data as JSON
        
        // Related entity information
        public string? RelatedEntityType { get; set; } // Order, Inventory, Customer, etc.
        
        public int? RelatedEntityId { get; set; }
    }

    public enum NotificationType
    {
        Email = 1,
        SMS = 2,
        Push = 3
    }

    public enum NotificationStatus
    {
        Pending = 1,
        Scheduled = 2,
        Sending = 3,
        Sent = 4,
        Delivered = 5,
        Failed = 6,
        Cancelled = 7
    }
}
