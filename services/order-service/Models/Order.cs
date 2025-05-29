using System.ComponentModel.DataAnnotations;

namespace OrderService.Models;

public class Order
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(50)]
    public string OrderNumber { get; set; } = string.Empty;
    
    [Required]
    public int CustomerId { get; set; }
    
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = OrderStatus.PENDING;
    
    [Required]
    public decimal TotalAmount { get; set; }
    
    [Required]
    public decimal SubTotal { get; set; }
    
    public decimal TaxAmount { get; set; } = 0;
    
    public decimal ShippingAmount { get; set; } = 0;
    
    public decimal DiscountAmount { get; set; } = 0;
    
    [StringLength(500)]
    public string? Notes { get; set; }
    
    // Shipping Information
    [Required]
    [StringLength(200)]
    public string ShippingAddress { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string ShippingCity { get; set; } = string.Empty;
    
    [Required]
    [StringLength(20)]
    public string ShippingPostalCode { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string ShippingCountry { get; set; } = string.Empty;
    
    // Billing Information
    [Required]
    [StringLength(200)]
    public string BillingAddress { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string BillingCity { get; set; } = string.Empty;
    
    [Required]
    [StringLength(20)]
    public string BillingPostalCode { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string BillingCountry { get; set; } = string.Empty;
    
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    
    public DateTime? ShippedDate { get; set; }
    
    public DateTime? DeliveredDate { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}

public class OrderItem
{
    public int Id { get; set; }
    
    public int OrderId { get; set; }
    
    [Required]
    public int ProductId { get; set; }
    
    [Required]
    [StringLength(50)]
    public string SKU { get; set; } = string.Empty;
    
    [Required]
    [StringLength(200)]
    public string ProductName { get; set; } = string.Empty;
    
    [Required]
    public int Quantity { get; set; }
    
    [Required]
    public decimal UnitPrice { get; set; }
    
    public decimal DiscountAmount { get; set; } = 0;
    
    [Required]
    public decimal TotalPrice { get; set; }
    
    // Navigation properties
    public virtual Order Order { get; set; } = null!;
}

public static class OrderStatus
{
    public const string PENDING = "PENDING";
    public const string CONFIRMED = "CONFIRMED";
    public const string PROCESSING = "PROCESSING";
    public const string SHIPPED = "SHIPPED";
    public const string DELIVERED = "DELIVERED";
    public const string CANCELLED = "CANCELLED";
    public const string REFUNDED = "REFUNDED";
}
