using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using InventoryService.Data;
using InventoryService.DTOs;
using InventoryService.Models;
using System.Text.Json;

namespace InventoryService.Services;

public class InventoryService : IInventoryService
{
    private readonly InventoryDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<InventoryService> _logger;
    private readonly IRabbitMQService _rabbitMQService;
    private readonly IDistributedCache _cache;

    public InventoryService(
        InventoryDbContext context,
        IMapper mapper,
        ILogger<InventoryService> logger,
        IRabbitMQService rabbitMQService,
        IDistributedCache cache)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
        _rabbitMQService = rabbitMQService;
        _cache = cache;
    }

    public async Task<IEnumerable<InventoryItemDto>> GetAllInventoryAsync()
    {
        var cacheKey = "inventory:all";
        var cachedData = await _cache.GetStringAsync(cacheKey);
        
        if (!string.IsNullOrEmpty(cachedData))
        {
            return JsonSerializer.Deserialize<IEnumerable<InventoryItemDto>>(cachedData) ?? new List<InventoryItemDto>();
        }

        var items = await _context.InventoryItems
            .Include(i => i.StockMovements.OrderByDescending(m => m.CreatedAt).Take(5))
            .ToListAsync();

        var result = _mapper.Map<IEnumerable<InventoryItemDto>>(items);
        
        // Cache for 5 minutes
        var cacheOptions = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
        };
        await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(result), cacheOptions);

        return result;
    }

    public async Task<InventoryItemDto?> GetInventoryByIdAsync(int id)
    {
        var item = await _context.InventoryItems
            .Include(i => i.StockMovements.OrderByDescending(m => m.CreatedAt).Take(10))
            .FirstOrDefaultAsync(i => i.Id == id);

        return item != null ? _mapper.Map<InventoryItemDto>(item) : null;
    }

    public async Task<InventoryItemDto?> GetInventoryByProductIdAsync(int productId)
    {
        var cacheKey = $"inventory:product:{productId}";
        var cachedData = await _cache.GetStringAsync(cacheKey);
        
        if (!string.IsNullOrEmpty(cachedData))
        {
            return JsonSerializer.Deserialize<InventoryItemDto>(cachedData);
        }

        var item = await _context.InventoryItems
            .Include(i => i.StockMovements.OrderByDescending(m => m.CreatedAt).Take(10))
            .FirstOrDefaultAsync(i => i.ProductId == productId);

        if (item == null) return null;

        var result = _mapper.Map<InventoryItemDto>(item);
        
        // Cache for 2 minutes
        var cacheOptions = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(2)
        };
        await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(result), cacheOptions);

        return result;
    }

    public async Task<InventoryItemDto?> GetInventoryBySkuAsync(string sku)
    {
        var item = await _context.InventoryItems
            .Include(i => i.StockMovements.OrderByDescending(m => m.CreatedAt).Take(10))
            .FirstOrDefaultAsync(i => i.SKU == sku);

        return item != null ? _mapper.Map<InventoryItemDto>(item) : null;
    }

    public async Task<InventoryItemDto> CreateInventoryItemAsync(CreateInventoryItemDto createInventoryDto)
    {
        var inventoryItem = _mapper.Map<InventoryItem>(createInventoryDto);
        inventoryItem.CreatedAt = DateTime.UtcNow;
        inventoryItem.LastUpdated = DateTime.UtcNow;

        _context.InventoryItems.Add(inventoryItem);

        // Create initial stock movement
        var stockMovement = new StockMovement
        {
            InventoryItem = inventoryItem,
            MovementType = MovementTypes.IN,
            Quantity = inventoryItem.Quantity,
            PreviousQuantity = 0,
            NewQuantity = inventoryItem.Quantity,
            Reason = "Initial stock",
            Reference = "INIT",
            CreatedBy = "System",
            CreatedAt = DateTime.UtcNow
        };

        _context.StockMovements.Add(stockMovement);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Inventory item created for ProductId: {ProductId}", inventoryItem.ProductId);

        // Clear cache
        await InvalidateInventoryCache();

        // Publish event
        await _rabbitMQService.PublishAsync("inventory.created", new 
        { 
            ProductId = inventoryItem.ProductId, 
            SKU = inventoryItem.SKU,
            Quantity = inventoryItem.Quantity 
        });

        return _mapper.Map<InventoryItemDto>(inventoryItem);
    }

    public async Task<InventoryItemDto?> UpdateInventoryItemAsync(int id, UpdateInventoryItemDto updateInventoryDto)
    {
        var inventoryItem = await _context.InventoryItems.FindAsync(id);
        if (inventoryItem == null) return null;

        var oldQuantity = inventoryItem.Quantity;

        // Update properties
        if (updateInventoryDto.Quantity.HasValue)
            inventoryItem.Quantity = updateInventoryDto.Quantity.Value;
        
        if (updateInventoryDto.MinimumStock.HasValue)
            inventoryItem.MinimumStock = updateInventoryDto.MinimumStock.Value;
        
        if (updateInventoryDto.MaximumStock.HasValue)
            inventoryItem.MaximumStock = updateInventoryDto.MaximumStock.Value;
        
        if (!string.IsNullOrEmpty(updateInventoryDto.Location))
            inventoryItem.Location = updateInventoryDto.Location;

        inventoryItem.LastUpdated = DateTime.UtcNow;

        // Create stock movement if quantity changed
        if (updateInventoryDto.Quantity.HasValue && oldQuantity != updateInventoryDto.Quantity.Value)
        {
            var movement = new StockMovement
            {
                InventoryItemId = inventoryItem.Id,
                MovementType = MovementTypes.ADJUSTMENT,
                Quantity = Math.Abs(updateInventoryDto.Quantity.Value - oldQuantity),
                PreviousQuantity = oldQuantity,
                NewQuantity = updateInventoryDto.Quantity.Value,
                Reason = "Manual adjustment",
                Reference = "ADJ",
                CreatedBy = "System",
                CreatedAt = DateTime.UtcNow
            };

            _context.StockMovements.Add(movement);
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Inventory item updated for ProductId: {ProductId}", inventoryItem.ProductId);

        // Clear cache
        await InvalidateInventoryCache(inventoryItem.ProductId);

        // Publish event
        await _rabbitMQService.PublishAsync("inventory.updated", new 
        { 
            ProductId = inventoryItem.ProductId, 
            SKU = inventoryItem.SKU,
            OldQuantity = oldQuantity,
            NewQuantity = inventoryItem.Quantity 
        });

        return _mapper.Map<InventoryItemDto>(inventoryItem);
    }

    public async Task<bool> DeleteInventoryItemAsync(int id)
    {
        var inventoryItem = await _context.InventoryItems.FindAsync(id);
        if (inventoryItem == null) return false;

        _context.InventoryItems.Remove(inventoryItem);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Inventory item deleted for ProductId: {ProductId}", inventoryItem.ProductId);

        // Clear cache
        await InvalidateInventoryCache(inventoryItem.ProductId);

        // Publish event
        await _rabbitMQService.PublishAsync("inventory.deleted", new 
        { 
            ProductId = inventoryItem.ProductId, 
            SKU = inventoryItem.SKU 
        });

        return true;
    }

    public async Task<bool> AdjustStockAsync(StockAdjustmentDto adjustmentDto)
    {
        var inventoryItem = await _context.InventoryItems
            .FirstOrDefaultAsync(i => i.ProductId == adjustmentDto.ProductId);

        if (inventoryItem == null) return false;

        var oldQuantity = inventoryItem.Quantity;
        var newQuantity = adjustmentDto.MovementType switch
        {
            MovementTypes.IN => oldQuantity + adjustmentDto.Quantity,
            MovementTypes.OUT => oldQuantity - adjustmentDto.Quantity,
            MovementTypes.ADJUSTMENT => adjustmentDto.Quantity,
            _ => oldQuantity
        };

        if (newQuantity < 0) return false; // Cannot have negative stock

        inventoryItem.Quantity = newQuantity;
        inventoryItem.LastUpdated = DateTime.UtcNow;

        // Create stock movement
        var movement = new StockMovement
        {
            InventoryItemId = inventoryItem.Id,
            MovementType = adjustmentDto.MovementType,
            Quantity = Math.Abs(adjustmentDto.Quantity),
            PreviousQuantity = oldQuantity,
            NewQuantity = newQuantity,
            Reason = adjustmentDto.Reason,
            Reference = adjustmentDto.Reference,
            CreatedBy = adjustmentDto.CreatedBy,
            CreatedAt = DateTime.UtcNow
        };

        _context.StockMovements.Add(movement);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Stock adjusted for ProductId: {ProductId}, Type: {MovementType}, Quantity: {Quantity}", 
            adjustmentDto.ProductId, adjustmentDto.MovementType, adjustmentDto.Quantity);

        // Clear cache
        await InvalidateInventoryCache(inventoryItem.ProductId);

        // Publish event
        await _rabbitMQService.PublishAsync("inventory.stock_adjusted", new 
        { 
            ProductId = inventoryItem.ProductId, 
            SKU = inventoryItem.SKU,
            MovementType = adjustmentDto.MovementType,
            OldQuantity = oldQuantity,
            NewQuantity = newQuantity,
            IsLowStock = inventoryItem.IsLowStock
        });

        return true;
    }

    public async Task<bool> ReserveStockAsync(StockReservationDto reservationDto)
    {
        var inventoryItem = await _context.InventoryItems
            .FirstOrDefaultAsync(i => i.ProductId == reservationDto.ProductId);

        if (inventoryItem == null) return false;
        if (inventoryItem.AvailableQuantity < reservationDto.Quantity) return false;

        inventoryItem.ReservedQuantity += reservationDto.Quantity;
        inventoryItem.LastUpdated = DateTime.UtcNow;

        // Create stock movement
        var movement = new StockMovement
        {
            InventoryItemId = inventoryItem.Id,
            MovementType = MovementTypes.RESERVED,
            Quantity = reservationDto.Quantity,
            PreviousQuantity = inventoryItem.ReservedQuantity - reservationDto.Quantity,
            NewQuantity = inventoryItem.ReservedQuantity,
            Reason = "Stock reservation",
            Reference = reservationDto.Reference,
            CreatedBy = reservationDto.CreatedBy,
            CreatedAt = DateTime.UtcNow
        };

        _context.StockMovements.Add(movement);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Stock reserved for ProductId: {ProductId}, Quantity: {Quantity}", 
            reservationDto.ProductId, reservationDto.Quantity);

        // Clear cache
        await InvalidateInventoryCache(inventoryItem.ProductId);

        // Publish event
        await _rabbitMQService.PublishAsync("inventory.stock_reserved", new 
        { 
            ProductId = inventoryItem.ProductId, 
            SKU = inventoryItem.SKU,
            ReservedQuantity = reservationDto.Quantity,
            AvailableQuantity = inventoryItem.AvailableQuantity
        });

        return true;
    }

    public async Task<bool> ReleaseReservationAsync(int productId, int quantity, string? reference = null)
    {
        var inventoryItem = await _context.InventoryItems
            .FirstOrDefaultAsync(i => i.ProductId == productId);

        if (inventoryItem == null) return false;
        if (inventoryItem.ReservedQuantity < quantity) return false;

        inventoryItem.ReservedQuantity -= quantity;
        inventoryItem.LastUpdated = DateTime.UtcNow;

        // Create stock movement
        var movement = new StockMovement
        {
            InventoryItemId = inventoryItem.Id,
            MovementType = MovementTypes.RELEASED,
            Quantity = quantity,
            PreviousQuantity = inventoryItem.ReservedQuantity + quantity,
            NewQuantity = inventoryItem.ReservedQuantity,
            Reason = "Reservation released",
            Reference = reference,
            CreatedBy = "System",
            CreatedAt = DateTime.UtcNow
        };

        _context.StockMovements.Add(movement);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Reservation released for ProductId: {ProductId}, Quantity: {Quantity}", 
            productId, quantity);

        // Clear cache
        await InvalidateInventoryCache(productId);

        // Publish event
        await _rabbitMQService.PublishAsync("inventory.reservation_released", new 
        { 
            ProductId = productId, 
            SKU = inventoryItem.SKU,
            ReleasedQuantity = quantity,
            AvailableQuantity = inventoryItem.AvailableQuantity
        });

        return true;
    }

    public async Task<bool> CheckStockAvailabilityAsync(int productId, int requiredQuantity)
    {
        var inventoryItem = await _context.InventoryItems
            .FirstOrDefaultAsync(i => i.ProductId == productId);

        return inventoryItem?.AvailableQuantity >= requiredQuantity;
    }

    public async Task<IEnumerable<StockMovementDto>> GetStockMovementsAsync(int inventoryItemId)
    {
        var movements = await _context.StockMovements
            .Where(m => m.InventoryItemId == inventoryItemId)
            .OrderByDescending(m => m.CreatedAt)
            .Take(50)
            .ToListAsync();

        return _mapper.Map<IEnumerable<StockMovementDto>>(movements);
    }

    public async Task<IEnumerable<StockMovementDto>> GetStockMovementsByProductIdAsync(int productId)
    {
        var movements = await _context.StockMovements
            .Include(m => m.InventoryItem)
            .Where(m => m.InventoryItem.ProductId == productId)
            .OrderByDescending(m => m.CreatedAt)
            .Take(50)
            .ToListAsync();

        return _mapper.Map<IEnumerable<StockMovementDto>>(movements);
    }

    public async Task<IEnumerable<LowStockAlertDto>> GetLowStockAlertsAsync()
    {
        var lowStockItems = await _context.InventoryItems
            .Where(i => i.AvailableQuantity <= i.MinimumStock)
            .ToListAsync();

        return lowStockItems.Select(item => new LowStockAlertDto
        {
            ProductId = item.ProductId,
            SKU = item.SKU,
            CurrentQuantity = item.AvailableQuantity,
            MinimumStock = item.MinimumStock,
            Location = item.Location,
            AlertDate = DateTime.UtcNow
        });
    }

    public async Task<InventoryReportDto> GetInventoryReportAsync()
    {
        var items = await _context.InventoryItems.ToListAsync();

        var report = new InventoryReportDto
        {
            TotalItems = items.Count,
            LowStockItems = items.Count(i => i.IsLowStock),
            OverStockItems = items.Count(i => i.IsOverStock),
            TotalQuantity = items.Sum(i => i.Quantity),
            TotalReservedQuantity = items.Sum(i => i.ReservedQuantity),
            TotalAvailableQuantity = items.Sum(i => i.AvailableQuantity),
            LowStockAlerts = (await GetLowStockAlertsAsync()).ToList(),
            TopItems = _mapper.Map<List<InventoryItemDto>>(items.OrderByDescending(i => i.Quantity).Take(10))
        };

        return report;
    }

    public async Task<IEnumerable<InventoryItemDto>> GetInventoryByLocationAsync(string location)
    {
        var items = await _context.InventoryItems
            .Where(i => i.Location.Contains(location))
            .Include(i => i.StockMovements.OrderByDescending(m => m.CreatedAt).Take(5))
            .ToListAsync();

        return _mapper.Map<IEnumerable<InventoryItemDto>>(items);
    }

    private async Task InvalidateInventoryCache(int? productId = null)
    {
        await _cache.RemoveAsync("inventory:all");
        
        if (productId.HasValue)
        {
            await _cache.RemoveAsync($"inventory:product:{productId}");
        }
    }
}
