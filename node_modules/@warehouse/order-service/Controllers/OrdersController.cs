using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrderService.DTOs;
using OrderService.Services;

namespace OrderService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(IOrderService orderService, ILogger<OrdersController> logger)
    {
        _orderService = orderService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrderSummaryDto>>> GetOrders()
    {
        try
        {
            var orders = await _orderService.GetAllOrdersAsync();
            return Ok(orders);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting orders");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDto>> GetOrder(int id)
    {
        try
        {
            var order = await _orderService.GetOrderByIdAsync(id);
            if (order == null) return NotFound();
            return Ok(order);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting order with ID: {OrderId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("number/{orderNumber}")]
    public async Task<ActionResult<OrderDto>> GetOrderByNumber(string orderNumber)
    {
        try
        {
            var order = await _orderService.GetOrderByOrderNumberAsync(orderNumber);
            if (order == null) return NotFound();
            return Ok(order);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting order with number: {OrderNumber}", orderNumber);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("customer/{customerId}")]
    public async Task<ActionResult<IEnumerable<OrderSummaryDto>>> GetOrdersByCustomer(int customerId)
    {
        try
        {
            var orders = await _orderService.GetOrdersByCustomerIdAsync(customerId);
            return Ok(orders);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting orders for customer: {CustomerId}", customerId);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("status/{status}")]
    public async Task<ActionResult<IEnumerable<OrderSummaryDto>>> GetOrdersByStatus(string status)
    {
        try
        {
            var orders = await _orderService.GetOrdersByStatusAsync(status);
            return Ok(orders);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting orders by status: {Status}", status);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost]
    public async Task<ActionResult<OrderDto>> CreateOrder(CreateOrderDto createOrderDto)
    {
        try
        {
            var order = await _orderService.CreateOrderAsync(createOrderDto);
            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating order");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<OrderDto>> UpdateOrder(int id, UpdateOrderDto updateOrderDto)
    {
        try
        {
            var order = await _orderService.UpdateOrderAsync(id, updateOrderDto);
            if (order == null) return NotFound();
            return Ok(order);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating order with ID: {OrderId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(int id, OrderStatusUpdateDto statusUpdateDto)
    {
        try
        {
            var result = await _orderService.UpdateOrderStatusAsync(id, statusUpdateDto);
            if (!result) return NotFound();
            return Ok(new { message = "Order status updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating order status for ID: {OrderId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> CancelOrder(int id, [FromBody] CancelOrderRequest request)
    {
        try
        {
            var result = await _orderService.CancelOrderAsync(id, request.Reason);
            if (!result) return NotFound();
            return Ok(new { message = "Order cancelled successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling order with ID: {OrderId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("{id}/confirm")]
    public async Task<IActionResult> ConfirmOrder(int id)
    {
        try
        {
            var result = await _orderService.ConfirmOrderAsync(id);
            if (!result) return NotFound();
            return Ok(new { message = "Order confirmed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error confirming order with ID: {OrderId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("{id}/process")]
    public async Task<IActionResult> ProcessOrder(int id)
    {
        try
        {
            var result = await _orderService.ProcessOrderAsync(id);
            if (!result) return NotFound();
            return Ok(new { message = "Order processing started" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing order with ID: {OrderId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("{id}/ship")]
    public async Task<IActionResult> ShipOrder(int id)
    {
        try
        {
            var result = await _orderService.ShipOrderAsync(id);
            if (!result) return NotFound();
            return Ok(new { message = "Order shipped successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error shipping order with ID: {OrderId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("{id}/deliver")]
    public async Task<IActionResult> DeliverOrder(int id)
    {
        try
        {
            var result = await _orderService.DeliverOrderAsync(id);
            if (!result) return NotFound();
            return Ok(new { message = "Order delivered successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error delivering order with ID: {OrderId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("report")]
    public async Task<ActionResult<OrderReportDto>> GetOrderReport()
    {
        try
        {
            var report = await _orderService.GetOrderReportAsync();
            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating order report");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOrder(int id)
    {
        try
        {
            var result = await _orderService.DeleteOrderAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting order with ID: {OrderId}", id);
            return StatusCode(500, "Internal server error");
        }
    }
}

public class CancelOrderRequest
{
    public string Reason { get; set; } = string.Empty;
}
