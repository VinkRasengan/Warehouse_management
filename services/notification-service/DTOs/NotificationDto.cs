using NotificationService.Models;

namespace NotificationService.DTOs
{
    public class CreateNotificationDto
    {
        public NotificationType Type { get; set; }
        public string Recipient { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? TemplateId { get; set; }
        public Dictionary<string, object>? TemplateData { get; set; }
        public int Priority { get; set; } = 1;
        public DateTime? ScheduledAt { get; set; }
        public string? RelatedEntityType { get; set; }
        public int? RelatedEntityId { get; set; }
        public Dictionary<string, object>? Metadata { get; set; }
    }

    public class NotificationDto
    {
        public int Id { get; set; }
        public NotificationType Type { get; set; }
        public string Recipient { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? TemplateId { get; set; }
        public NotificationStatus Status { get; set; }
        public int Priority { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ScheduledAt { get; set; }
        public DateTime? SentAt { get; set; }
        public DateTime? DeliveredAt { get; set; }
        public string? ErrorMessage { get; set; }
        public int RetryCount { get; set; }
        public string? ExternalId { get; set; }
        public string? RelatedEntityType { get; set; }
        public int? RelatedEntityId { get; set; }
        public Dictionary<string, object>? Metadata { get; set; }
    }

    public class NotificationTemplateDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public NotificationType Type { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<string>? Variables { get; set; }
    }

    public class CreateNotificationTemplateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public NotificationType Type { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string? Description { get; set; }
        public List<string>? Variables { get; set; }
    }

    public class SendBulkNotificationDto
    {
        public List<string> Recipients { get; set; } = new();
        public NotificationType Type { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? TemplateId { get; set; }
        public Dictionary<string, object>? TemplateData { get; set; }
        public int Priority { get; set; } = 1;
        public DateTime? ScheduledAt { get; set; }
    }
}
