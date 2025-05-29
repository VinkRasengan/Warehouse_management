using System.ComponentModel.DataAnnotations;

namespace InventoryService.Models;

public class InventoryItem
{
    public int Id { get; set; }

    [Required]
    public int ProductId { get; set; }

    [Required]
    [StringLength(50)]
    public string SKU { get; set; } = string.Empty;

    [Required]
    public int Quantity { get; set; }

    [Required]
    public int ReservedQuantity { get; set; } = 0;

    [Required]
    public int MinimumStock { get; set; } = 0;

    [Required]
    public int MaximumStock { get; set; } = 1000;

    [Required]
    [StringLength(100)]
    public string Location { get; set; } = string.Empty;

    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Computed properties
    public int AvailableQuantity => Quantity - ReservedQuantity;
    public bool IsLowStock => AvailableQuantity <= MinimumStock;
    public bool IsOverStock => Quantity >= MaximumStock;

    // Navigation properties
    public virtual ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();
}

public class StockMovement
{
    public int Id { get; set; }

    public int InventoryItemId { get; set; }

    [Required]
    [StringLength(20)]
    public string MovementType { get; set; } = string.Empty; // IN, OUT, ADJUSTMENT, RESERVED, RELEASED

    [Required]
    public int Quantity { get; set; }

    public int PreviousQuantity { get; set; }

    public int NewQuantity { get; set; }

    [StringLength(200)]
    public string? Reason { get; set; }

    [StringLength(50)]
    public string? Reference { get; set; } // Order ID, Transfer ID, etc.

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [StringLength(100)]
    public string CreatedBy { get; set; } = string.Empty;

    // Navigation properties
    public virtual InventoryItem InventoryItem { get; set; } = null!;
}

public static class MovementTypes
{
    public const string IN = "IN";
    public const string OUT = "OUT";
    public const string ADJUSTMENT = "ADJUSTMENT";
    public const string RESERVED = "RESERVED";
    public const string RELEASED = "RELEASED";
    public const string TRANSFER_IN = "TRANSFER_IN";
    public const string TRANSFER_OUT = "TRANSFER_OUT";
}
