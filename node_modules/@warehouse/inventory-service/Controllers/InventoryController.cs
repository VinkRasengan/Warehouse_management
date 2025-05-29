using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using InventoryService.DTOs;
using InventoryService.Services;

namespace InventoryService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InventoryController : ControllerBase
{
    private readonly IInventoryService _inventoryService;
    private readonly ILogger<InventoryController> _logger;

    public InventoryController(IInventoryService inventoryService, ILogger<InventoryController> logger)
    {
        _inventoryService = inventoryService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InventoryItemDto>>> GetInventory()
    {
        try
        {
            var inventory = await _inventoryService.GetAllInventoryAsync();
            return Ok(inventory);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting inventory");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InventoryItemDto>> GetInventoryItem(int id)
    {
        try
        {
            var item = await _inventoryService.GetInventoryByIdAsync(id);
            if (item == null)
                return NotFound();

            return Ok(item);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting inventory item with ID: {InventoryId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("product/{productId}")]
    public async Task<ActionResult<InventoryItemDto>> GetInventoryByProductId(int productId)
    {
        try
        {
            var item = await _inventoryService.GetInventoryByProductIdAsync(productId);
            if (item == null)
                return NotFound();

            return Ok(item);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting inventory for ProductId: {ProductId}", productId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("sku/{sku}")]
    public async Task<ActionResult<InventoryItemDto>> GetInventoryBySku(string sku)
    {
        try
        {
            var item = await _inventoryService.GetInventoryBySkuAsync(sku);
            if (item == null)
                return NotFound();

            return Ok(item);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting inventory for SKU: {SKU}", sku);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("location/{location}")]
    public async Task<ActionResult<IEnumerable<InventoryItemDto>>> GetInventoryByLocation(string location)
    {
        try
        {
            var items = await _inventoryService.GetInventoryByLocationAsync(location);
            return Ok(items);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting inventory for location: {Location}", location);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost]
    public async Task<ActionResult<InventoryItemDto>> CreateInventoryItem(CreateInventoryItemDto createInventoryDto)
    {
        try
        {
            var item = await _inventoryService.CreateInventoryItemAsync(createInventoryDto);
            return CreatedAtAction(nameof(GetInventoryItem), new { id = item.Id }, item);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating inventory item");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<InventoryItemDto>> UpdateInventoryItem(int id, UpdateInventoryItemDto updateInventoryDto)
    {
        try
        {
            var item = await _inventoryService.UpdateInventoryItemAsync(id, updateInventoryDto);
            if (item == null)
                return NotFound();

            return Ok(item);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating inventory item with ID: {InventoryId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteInventoryItem(int id)
    {
        try
        {
            var result = await _inventoryService.DeleteInventoryItemAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting inventory item with ID: {InventoryId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("adjust")]
    public async Task<IActionResult> AdjustStock(StockAdjustmentDto adjustmentDto)
    {
        try
        {
            var result = await _inventoryService.AdjustStockAsync(adjustmentDto);
            if (!result)
                return BadRequest("Unable to adjust stock");

            return Ok(new { message = "Stock adjusted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adjusting stock for ProductId: {ProductId}", adjustmentDto.ProductId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("reserve")]
    public async Task<IActionResult> ReserveStock(StockReservationDto reservationDto)
    {
        try
        {
            var result = await _inventoryService.ReserveStockAsync(reservationDto);
            if (!result)
                return BadRequest("Unable to reserve stock - insufficient quantity available");

            return Ok(new { message = "Stock reserved successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reserving stock for ProductId: {ProductId}", reservationDto.ProductId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("release")]
    public async Task<IActionResult> ReleaseReservation([FromBody] ReleaseReservationRequest request)
    {
        try
        {
            var result = await _inventoryService.ReleaseReservationAsync(request.ProductId, request.Quantity, request.Reference);
            if (!result)
                return BadRequest("Unable to release reservation");

            return Ok(new { message = "Reservation released successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error releasing reservation for ProductId: {ProductId}", request.ProductId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("check-availability/{productId}/{quantity}")]
    public async Task<ActionResult<bool>> CheckStockAvailability(int productId, int quantity)
    {
        try
        {
            var available = await _inventoryService.CheckStockAvailabilityAsync(productId, quantity);
            return Ok(new { productId, quantity, available });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking stock availability for ProductId: {ProductId}", productId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id}/movements")]
    public async Task<ActionResult<IEnumerable<StockMovementDto>>> GetStockMovements(int id)
    {
        try
        {
            var movements = await _inventoryService.GetStockMovementsAsync(id);
            return Ok(movements);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting stock movements for inventory ID: {InventoryId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("product/{productId}/movements")]
    public async Task<ActionResult<IEnumerable<StockMovementDto>>> GetStockMovementsByProductId(int productId)
    {
        try
        {
            var movements = await _inventoryService.GetStockMovementsByProductIdAsync(productId);
            return Ok(movements);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting stock movements for ProductId: {ProductId}", productId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("alerts/low-stock")]
    public async Task<ActionResult<IEnumerable<LowStockAlertDto>>> GetLowStockAlerts()
    {
        try
        {
            var alerts = await _inventoryService.GetLowStockAlertsAsync();
            return Ok(alerts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting low stock alerts");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("report")]
    public async Task<ActionResult<InventoryReportDto>> GetInventoryReport()
    {
        try
        {
            var report = await _inventoryService.GetInventoryReportAsync();
            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating inventory report");
            return StatusCode(500, "Internal server error");
        }
    }
}

public class ReleaseReservationRequest
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public string? Reference { get; set; }
}
