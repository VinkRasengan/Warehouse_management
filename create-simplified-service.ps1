# Create simplified inventory service without RabbitMQ and Redis dependencies
Write-Host "Creating simplified Inventory Service" -ForegroundColor Blue

Push-Location "services/inventory-service"

# Backup original files
if (-not (Test-Path "Services/InventoryService.cs.original")) {
    Copy-Item "Services/InventoryService.cs" "Services/InventoryService.cs.original" -Force
    Write-Host "Original InventoryService.cs backed up" -ForegroundColor Green
}

if (-not (Test-Path "Program.cs.original")) {
    Copy-Item "Program.cs" "Program.cs.original" -Force
    Write-Host "Original Program.cs backed up" -ForegroundColor Green
}

# Create simplified InventoryService without RabbitMQ and Redis
$simplifiedService = @"
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using InventoryService.Data;
using InventoryService.DTOs;
using InventoryService.Models;

namespace InventoryService.Services;

public class InventoryService : IInventoryService
{
    private readonly InventoryDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<InventoryService> _logger;

    public InventoryService(
        InventoryDbContext context,
        IMapper mapper,
        ILogger<InventoryService> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<IEnumerable<InventoryItemDto>> GetAllInventoryAsync()
    {
        var items = await _context.InventoryItems
            .Include(i => i.StockMovements.OrderByDescending(m => m.CreatedAt).Take(5))
            .ToListAsync();

        return _mapper.Map<IEnumerable<InventoryItemDto>>(items);
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
        var item = await _context.InventoryItems
            .Include(i => i.StockMovements.OrderByDescending(m => m.CreatedAt).Take(10))
            .FirstOrDefaultAsync(i => i.ProductId == productId);

        return item != null ? _mapper.Map<InventoryItemDto>(item) : null;
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

        return _mapper.Map<InventoryItemDto>(inventoryItem);
    }

    public async Task<bool> DeleteInventoryItemAsync(int id)
    {
        var inventoryItem = await _context.InventoryItems.FindAsync(id);
        if (inventoryItem == null) return false;

        _context.InventoryItems.Remove(inventoryItem);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Inventory item deleted for ProductId: {ProductId}", inventoryItem.ProductId);

        return true;
    }

    // Implement other required methods with simplified logic...
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

        if (newQuantity < 0) return false;

        inventoryItem.Quantity = newQuantity;
        inventoryItem.LastUpdated = DateTime.UtcNow;

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

        _logger.LogInformation("Stock adjusted for ProductId: {ProductId}", adjustmentDto.ProductId);

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

        await _context.SaveChangesAsync();
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

        await _context.SaveChangesAsync();
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
}
"@

# Write simplified service
Set-Content -Path "Services/InventoryService.cs" -Value $simplifiedService -Encoding UTF8
Write-Host "Created simplified InventoryService.cs" -ForegroundColor Green

Write-Host "Files backed up and simplified versions created" -ForegroundColor Green
Write-Host "You can now test the service without RabbitMQ/Redis dependencies" -ForegroundColor White

Pop-Location
