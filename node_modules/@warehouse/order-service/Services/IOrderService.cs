using OrderService.DTOs;

namespace OrderService.Services;

public interface IOrderService
{
    Task<IEnumerable<OrderSummaryDto>> GetAllOrdersAsync();
    Task<OrderDto?> GetOrderByIdAsync(int id);
    Task<OrderDto?> GetOrderByOrderNumberAsync(string orderNumber);
    Task<IEnumerable<OrderSummaryDto>> GetOrdersByCustomerIdAsync(int customerId);
    Task<IEnumerable<OrderSummaryDto>> GetOrdersByStatusAsync(string status);
    Task<OrderDto> CreateOrderAsync(CreateOrderDto createOrderDto);
    Task<OrderDto?> UpdateOrderAsync(int id, UpdateOrderDto updateOrderDto);
    Task<bool> UpdateOrderStatusAsync(int id, OrderStatusUpdateDto statusUpdateDto);
    Task<bool> CancelOrderAsync(int id, string reason);
    Task<bool> DeleteOrderAsync(int id);
    
    // Order processing
    Task<bool> ConfirmOrderAsync(int id);
    Task<bool> ProcessOrderAsync(int id);
    Task<bool> ShipOrderAsync(int id);
    Task<bool> DeliverOrderAsync(int id);
    
    // Reports
    Task<OrderReportDto> GetOrderReportAsync();
    Task<IEnumerable<OrderSummaryDto>> GetOrdersByDateRangeAsync(DateTime startDate, DateTime endDate);
}
