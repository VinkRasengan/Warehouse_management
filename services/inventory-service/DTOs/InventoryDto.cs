using System.ComponentModel.DataAnnotations;

namespace InventoryService.DTOs;

public class InventoryItemDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string SKU { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public int ReservedQuantity { get; set; }
    public int AvailableQuantity { get; set; }
    public int MinimumStock { get; set; }
    public int MaximumStock { get; set; }
    public string Location { get; set; } = string.Empty;
    public bool IsLowStock { get; set; }
    public bool IsOverStock { get; set; }
    public DateTime LastUpdated { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<StockMovementDto> RecentMovements { get; set; } = new();
}

public class CreateInventoryItemDto
{
    [Required]
    public int ProductId { get; set; }
    
    [Required]
    [StringLength(50)]
    public string SKU { get; set; } = string.Empty;
    
    [Required]
    [Range(0, int.MaxValue)]
    public int Quantity { get; set; }
    
    [Range(0, int.MaxValue)]
    public int MinimumStock { get; set; } = 0;
    
    [Range(1, int.MaxValue)]
    public int MaximumStock { get; set; } = 1000;
    
    [Required]
    [StringLength(100)]
    public string Location { get; set; } = string.Empty;
}

public class UpdateInventoryItemDto
{
    [Range(0, int.MaxValue)]
    public int? Quantity { get; set; }
    
    [Range(0, int.MaxValue)]
    public int? MinimumStock { get; set; }
    
    [Range(1, int.MaxValue)]
    public int? MaximumStock { get; set; }
    
    [StringLength(100)]
    public string? Location { get; set; }
}

public class StockAdjustmentDto
{
    [Required]
    public int ProductId { get; set; }
    
    [Required]
    public int Quantity { get; set; }
    
    [Required]
    [StringLength(20)]
    public string MovementType { get; set; } = string.Empty;
    
    [StringLength(200)]
    public string? Reason { get; set; }
    
    [StringLength(50)]
    public string? Reference { get; set; }
    
    [StringLength(100)]
    public string CreatedBy { get; set; } = string.Empty;
}

public class StockReservationDto
{
    [Required]
    public int ProductId { get; set; }
    
    [Required]
    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }
    
    [StringLength(50)]
    public string? Reference { get; set; }
    
    [StringLength(100)]
    public string CreatedBy { get; set; } = string.Empty;
}

public class StockMovementDto
{
    public int Id { get; set; }
    public int InventoryItemId { get; set; }
    public string MovementType { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public int PreviousQuantity { get; set; }
    public int NewQuantity { get; set; }
    public string? Reason { get; set; }
    public string? Reference { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
}

public class LowStockAlertDto
{
    public int ProductId { get; set; }
    public string SKU { get; set; } = string.Empty;
    public int CurrentQuantity { get; set; }
    public int MinimumStock { get; set; }
    public string Location { get; set; } = string.Empty;
    public DateTime AlertDate { get; set; }
}

public class InventoryReportDto
{
    public int TotalItems { get; set; }
    public int LowStockItems { get; set; }
    public int OverStockItems { get; set; }
    public int TotalQuantity { get; set; }
    public int TotalReservedQuantity { get; set; }
    public int TotalAvailableQuantity { get; set; }
    public List<LowStockAlertDto> LowStockAlerts { get; set; } = new();
    public List<InventoryItemDto> TopItems { get; set; } = new();
}
