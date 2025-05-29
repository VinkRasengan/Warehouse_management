using System.ComponentModel.DataAnnotations;

namespace OrderService.DTOs;

public class OrderDto
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public int CustomerId { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal SubTotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal ShippingAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public string? Notes { get; set; }
    
    // Shipping Information
    public string ShippingAddress { get; set; } = string.Empty;
    public string ShippingCity { get; set; } = string.Empty;
    public string ShippingPostalCode { get; set; } = string.Empty;
    public string ShippingCountry { get; set; } = string.Empty;
    
    // Billing Information
    public string BillingAddress { get; set; } = string.Empty;
    public string BillingCity { get; set; } = string.Empty;
    public string BillingPostalCode { get; set; } = string.Empty;
    public string BillingCountry { get; set; } = string.Empty;
    
    public DateTime OrderDate { get; set; }
    public DateTime? ShippedDate { get; set; }
    public DateTime? DeliveredDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    public List<OrderItemDto> OrderItems { get; set; } = new();
}

public class CreateOrderDto
{
    [Required]
    public int CustomerId { get; set; }
    
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
    
    [Required]
    [MinLength(1)]
    public List<CreateOrderItemDto> OrderItems { get; set; } = new();
}

public class UpdateOrderDto
{
    [StringLength(20)]
    public string? Status { get; set; }
    
    [StringLength(500)]
    public string? Notes { get; set; }
    
    public DateTime? ShippedDate { get; set; }
    
    public DateTime? DeliveredDate { get; set; }
}

public class OrderItemDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string SKU { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalPrice { get; set; }
}

public class CreateOrderItemDto
{
    [Required]
    public int ProductId { get; set; }
    
    [Required]
    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }
    
    public decimal DiscountAmount { get; set; } = 0;
}

public class OrderSummaryDto
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public int CustomerId { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public DateTime OrderDate { get; set; }
    public int ItemCount { get; set; }
}

public class OrderStatusUpdateDto
{
    [Required]
    [StringLength(20)]
    public string Status { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? Notes { get; set; }
}

public class OrderReportDto
{
    public int TotalOrders { get; set; }
    public decimal TotalRevenue { get; set; }
    public int PendingOrders { get; set; }
    public int ProcessingOrders { get; set; }
    public int ShippedOrders { get; set; }
    public int DeliveredOrders { get; set; }
    public int CancelledOrders { get; set; }
    public decimal AverageOrderValue { get; set; }
    public List<OrderSummaryDto> RecentOrders { get; set; } = new();
}
