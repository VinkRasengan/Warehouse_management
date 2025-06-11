using AutoMapper;
using Microsoft.EntityFrameworkCore;
using OrderService.Data;
using OrderService.DTOs;
using OrderService.Models;

namespace OrderService.Services;

public class OrderService : IOrderService
{
    private readonly OrderDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<OrderService> _logger;
    private readonly IRabbitMQService _rabbitMQService;

    public OrderService(OrderDbContext context, IMapper mapper, ILogger<OrderService> logger, IRabbitMQService rabbitMQService)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
        _rabbitMQService = rabbitMQService;
    }

    public async Task<IEnumerable<OrderSummaryDto>> GetAllOrdersAsync()
    {
        var orders = await _context.Orders
            .Include(o => o.OrderItems)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return orders.Select(o => new OrderSummaryDto
        {
            Id = o.Id,
            OrderNumber = o.OrderNumber,
            CustomerId = o.CustomerId,
            Status = o.Status,
            TotalAmount = o.TotalAmount,
            OrderDate = o.OrderDate,
            ItemCount = o.OrderItems.Count
        });
    }

    public async Task<OrderDto?> GetOrderByIdAsync(int id)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == id);

        return order != null ? _mapper.Map<OrderDto>(order) : null;
    }

    public async Task<OrderDto?> GetOrderByOrderNumberAsync(string orderNumber)
    {
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);

        return order != null ? _mapper.Map<OrderDto>(order) : null;
    }

    public async Task<IEnumerable<OrderSummaryDto>> GetOrdersByCustomerIdAsync(int customerId)
    {
        var orders = await _context.Orders
            .Include(o => o.OrderItems)
            .Where(o => o.CustomerId == customerId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return orders.Select(o => new OrderSummaryDto
        {
            Id = o.Id,
            OrderNumber = o.OrderNumber,
            CustomerId = o.CustomerId,
            Status = o.Status,
            TotalAmount = o.TotalAmount,
            OrderDate = o.OrderDate,
            ItemCount = o.OrderItems.Count
        });
    }

    public async Task<IEnumerable<OrderSummaryDto>> GetOrdersByStatusAsync(string status)
    {
        var orders = await _context.Orders
            .Include(o => o.OrderItems)
            .Where(o => o.Status == status)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return orders.Select(o => new OrderSummaryDto
        {
            Id = o.Id,
            OrderNumber = o.OrderNumber,
            CustomerId = o.CustomerId,
            Status = o.Status,
            TotalAmount = o.TotalAmount,
            OrderDate = o.OrderDate,
            ItemCount = o.OrderItems.Count
        });
    }

    public async Task<OrderDto> CreateOrderAsync(CreateOrderDto createOrderDto)
    {
        var order = _mapper.Map<Order>(createOrderDto);
        order.OrderNumber = await GenerateOrderNumberAsync();
        order.Status = OrderStatus.PENDING;
        order.OrderDate = DateTime.UtcNow;
        order.CreatedAt = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;

        // Calculate totals (simplified)
        order.SubTotal = order.OrderItems.Sum(item => item.TotalPrice);
        order.TaxAmount = order.SubTotal * 0.1m; // 10% tax
        order.TotalAmount = order.SubTotal + order.TaxAmount + order.ShippingAmount - order.DiscountAmount;

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Order created: {OrderNumber}", order.OrderNumber);

        await _rabbitMQService.PublishAsync("order.created", new { OrderId = order.Id, OrderNumber = order.OrderNumber });

        return _mapper.Map<OrderDto>(order);
    }

    public async Task<OrderDto?> UpdateOrderAsync(int id, UpdateOrderDto updateOrderDto)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) return null;

        if (!string.IsNullOrEmpty(updateOrderDto.Status))
            order.Status = updateOrderDto.Status;

        if (!string.IsNullOrEmpty(updateOrderDto.Notes))
            order.Notes = updateOrderDto.Notes;

        if (updateOrderDto.ShippedDate.HasValue)
            order.ShippedDate = updateOrderDto.ShippedDate;

        if (updateOrderDto.DeliveredDate.HasValue)
            order.DeliveredDate = updateOrderDto.DeliveredDate;

        order.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Order updated: {OrderNumber}", order.OrderNumber);

        return _mapper.Map<OrderDto>(order);
    }

    public async Task<bool> UpdateOrderStatusAsync(int id, OrderStatusUpdateDto statusUpdateDto)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) return false;

        var oldStatus = order.Status;
        order.Status = statusUpdateDto.Status;
        order.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrEmpty(statusUpdateDto.Notes))
            order.Notes = statusUpdateDto.Notes;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Order status updated: {OrderNumber} from {OldStatus} to {NewStatus}", 
            order.OrderNumber, oldStatus, statusUpdateDto.Status);

        await _rabbitMQService.PublishAsync("order.status_changed", new 
        { 
            OrderId = order.Id, 
            OrderNumber = order.OrderNumber, 
            OldStatus = oldStatus, 
            NewStatus = statusUpdateDto.Status 
        });

        return true;
    }

    public async Task<bool> CancelOrderAsync(int id, string reason)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) return false;

        order.Status = OrderStatus.CANCELLED;
        order.Notes = $"Cancelled: {reason}";
        order.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Order cancelled: {OrderNumber}", order.OrderNumber);

        await _rabbitMQService.PublishAsync("order.cancelled", new { OrderId = order.Id, OrderNumber = order.OrderNumber, Reason = reason });

        return true;
    }

    public async Task<bool> DeleteOrderAsync(int id)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) return false;

        _context.Orders.Remove(order);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Order deleted: {OrderNumber}", order.OrderNumber);

        return true;
    }

    public async Task<bool> ConfirmOrderAsync(int id)
    {
        return await UpdateOrderStatusAsync(id, new OrderStatusUpdateDto { Status = OrderStatus.CONFIRMED });
    }

    public async Task<bool> ProcessOrderAsync(int id)
    {
        return await UpdateOrderStatusAsync(id, new OrderStatusUpdateDto { Status = OrderStatus.PROCESSING });
    }

    public async Task<bool> ShipOrderAsync(int id)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) return false;

        order.Status = OrderStatus.SHIPPED;
        order.ShippedDate = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeliverOrderAsync(int id)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) return false;

        order.Status = OrderStatus.DELIVERED;
        order.DeliveredDate = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<OrderReportDto> GetOrderReportAsync()
    {
        var orders = await _context.Orders.ToListAsync();

        return new OrderReportDto
        {
            TotalOrders = orders.Count,
            TotalRevenue = orders.Sum(o => o.TotalAmount),
            PendingOrders = orders.Count(o => o.Status == OrderStatus.PENDING),
            ProcessingOrders = orders.Count(o => o.Status == OrderStatus.PROCESSING),
            ShippedOrders = orders.Count(o => o.Status == OrderStatus.SHIPPED),
            DeliveredOrders = orders.Count(o => o.Status == OrderStatus.DELIVERED),
            CancelledOrders = orders.Count(o => o.Status == OrderStatus.CANCELLED),
            AverageOrderValue = orders.Any() ? orders.Average(o => o.TotalAmount) : 0,
            RecentOrders = orders.OrderByDescending(o => o.CreatedAt).Take(10).Select(o => new OrderSummaryDto
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                CustomerId = o.CustomerId,
                Status = o.Status,
                TotalAmount = o.TotalAmount,
                OrderDate = o.OrderDate,
                ItemCount = o.OrderItems.Count
            }).ToList()
        };
    }

    public async Task<IEnumerable<OrderSummaryDto>> GetOrdersByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        var orders = await _context.Orders
            .Include(o => o.OrderItems)
            .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return orders.Select(o => new OrderSummaryDto
        {
            Id = o.Id,
            OrderNumber = o.OrderNumber,
            CustomerId = o.CustomerId,
            Status = o.Status,
            TotalAmount = o.TotalAmount,
            OrderDate = o.OrderDate,
            ItemCount = o.OrderItems.Count
        });
    }

    private async Task<string> GenerateOrderNumberAsync()
    {
        var lastOrder = await _context.Orders
            .OrderByDescending(o => o.Id)
            .FirstOrDefaultAsync();

        var nextNumber = (lastOrder?.Id ?? 0) + 1;
        return $"ORD-{nextNumber:D6}";
    }
}
