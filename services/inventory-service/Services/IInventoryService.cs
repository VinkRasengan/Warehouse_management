using InventoryService.DTOs;

namespace InventoryService.Services;

public interface IInventoryService
{
    Task<IEnumerable<InventoryItemDto>> GetAllInventoryAsync();
    Task<InventoryItemDto?> GetInventoryByIdAsync(int id);
    Task<InventoryItemDto?> GetInventoryByProductIdAsync(int productId);
    Task<InventoryItemDto?> GetInventoryBySkuAsync(string sku);
    Task<InventoryItemDto> CreateInventoryItemAsync(CreateInventoryItemDto createInventoryDto);
    Task<InventoryItemDto?> UpdateInventoryItemAsync(int id, UpdateInventoryItemDto updateInventoryDto);
    Task<bool> DeleteInventoryItemAsync(int id);
    
    // Stock operations
    Task<bool> AdjustStockAsync(StockAdjustmentDto adjustmentDto);
    Task<bool> ReserveStockAsync(StockReservationDto reservationDto);
    Task<bool> ReleaseReservationAsync(int productId, int quantity, string? reference = null);
    Task<bool> CheckStockAvailabilityAsync(int productId, int requiredQuantity);
    
    // Stock movements
    Task<IEnumerable<StockMovementDto>> GetStockMovementsAsync(int inventoryItemId);
    Task<IEnumerable<StockMovementDto>> GetStockMovementsByProductIdAsync(int productId);
    
    // Reports and alerts
    Task<IEnumerable<LowStockAlertDto>> GetLowStockAlertsAsync();
    Task<InventoryReportDto> GetInventoryReportAsync();
    Task<IEnumerable<InventoryItemDto>> GetInventoryByLocationAsync(string location);
}
