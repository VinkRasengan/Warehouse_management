using System.ComponentModel.DataAnnotations;

namespace AlertService.Models;

public class Alert
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(20)]
    public string Type { get; set; } = string.Empty;
    
    [Required]
    [StringLength(20)]
    public string Severity { get; set; } = AlertSeverity.INFO;
    
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    [StringLength(1000)]
    public string Message { get; set; } = string.Empty;
    
    public string? Data { get; set; } // JSON string for additional data
    
    [Required]
    [StringLength(100)]
    public string Source { get; set; } = string.Empty;

    public bool IsResolved { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ResolvedAt { get; set; }

    [StringLength(100)]
    public string? ResolvedBy { get; set; }

    [StringLength(1000)]
    public string? Resolution { get; set; }

    [StringLength(100)]
    public string? RelatedEntityType { get; set; }

    public int? RelatedEntityId { get; set; }
}

public static class AlertTypes
{
    public const string LOW_STOCK = "LOW_STOCK";
    public const string ORDER_CREATED = "ORDER_CREATED";
    public const string ORDER_CANCELLED = "ORDER_CANCELLED";
    public const string SYSTEM_ERROR = "SYSTEM_ERROR";
    public const string INVENTORY_UPDATE = "INVENTORY_UPDATE";
    public const string CUSTOMER_REGISTERED = "CUSTOMER_REGISTERED";
}

public static class AlertSeverity
{
    public const string INFO = "INFO";
    public const string WARNING = "WARNING";
    public const string ERROR = "ERROR";
    public const string CRITICAL = "CRITICAL";
}

public static class AlertStatus
{
    public const string ACTIVE = "ACTIVE";
    public const string RESOLVED = "RESOLVED";
    public const string DISMISSED = "DISMISSED";
}

public class AlertRule
{
    public int Id { get; set; }

    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Type { get; set; } = string.Empty;

    [Required]
    [StringLength(500)]
    public string Condition { get; set; } = string.Empty;

    [Required]
    [StringLength(20)]
    public string Severity { get; set; } = AlertSeverity.WARNING;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    [Required]
    [StringLength(100)]
    public string CreatedBy { get; set; } = string.Empty;

    [StringLength(100)]
    public string? UpdatedBy { get; set; }

    [StringLength(1000)]
    public string? Description { get; set; }
}
