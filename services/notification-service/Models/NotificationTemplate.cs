using System.ComponentModel.DataAnnotations;

namespace NotificationService.Models
{
    public class NotificationTemplate
    {
        public int Id { get; set; }
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        public string Code { get; set; } = string.Empty; // Unique identifier
        
        [Required]
        public NotificationType Type { get; set; }
        
        [Required]
        public string Subject { get; set; } = string.Empty;
        
        [Required]
        public string Body { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt { get; set; }
        
        public string? Variables { get; set; } // JSON array of available variables
    }
}
