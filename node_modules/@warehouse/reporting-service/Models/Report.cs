using System.ComponentModel.DataAnnotations;

namespace ReportingService.Models;

public class Report
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [StringLength(20)]
    public string Type { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    public string Parameters { get; set; } = "{}"; // JSON string
    
    public string? Data { get; set; } // JSON string
    
    [StringLength(20)]
    public string Status { get; set; } = ReportStatus.PENDING;
    
    public DateTime? GeneratedAt { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [StringLength(100)]
    public string CreatedBy { get; set; } = string.Empty;
}

public static class ReportTypes
{
    public const string SALES = "SALES";
    public const string INVENTORY = "INVENTORY";
    public const string ORDERS = "ORDERS";
    public const string CUSTOMERS = "CUSTOMERS";
    public const string FINANCIAL = "FINANCIAL";
}

public static class ReportStatus
{
    public const string PENDING = "PENDING";
    public const string GENERATING = "GENERATING";
    public const string COMPLETED = "COMPLETED";
    public const string FAILED = "FAILED";
}
