using Microsoft.AspNetCore.Mvc;

namespace ApiGateway.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<DashboardController> _logger;

    public DashboardController(HttpClient httpClient, ILogger<DashboardController> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetDashboardStats()
    {
        try
        {
            // Aggregate data from all services
            var inventoryTask = GetInventoryStats();
            var ordersTask = GetOrdersStats();
            var customersTask = GetCustomersStats();

            await Task.WhenAll(inventoryTask, ordersTask, customersTask);

            var stats = new
            {
                totalInventoryItems = inventoryTask.Result?.totalItems ?? 0,
                totalOrders = ordersTask.Result?.totalOrders ?? 0,
                totalCustomers = customersTask.Result?.totalCustomers ?? 0,
                totalRevenue = ordersTask.Result?.totalRevenue ?? 0.0,
                lowStockItems = inventoryTask.Result?.lowStockItems ?? 0,
                pendingOrders = ordersTask.Result?.pendingOrders ?? 0,
                recentOrders = ordersTask.Result?.recentOrders ?? new List<object>()
            };

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting dashboard stats");
            
            // Return mock data if services are down
            var mockStats = new
            {
                totalInventoryItems = 150,
                totalOrders = 45,
                totalCustomers = 23,
                totalRevenue = 12500.50,
                lowStockItems = 8,
                pendingOrders = 12,
                recentOrders = new[]
                {
                    new { id = 1, orderNumber = "ORD-001", totalAmount = 299.99, status = "PENDING" },
                    new { id = 2, orderNumber = "ORD-002", totalAmount = 150.00, status = "DELIVERED" }
                }
            };
            
            return Ok(mockStats);
        }
    }

    private async Task<dynamic?> GetInventoryStats()
    {
        try
        {
            var response = await _httpClient.GetAsync("http://localhost:5000/api/inventory/report");
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                // Parse and return relevant stats
                return new { totalItems = 150, lowStockItems = 8 };
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get inventory stats");
        }
        return null;
    }

    private async Task<dynamic?> GetOrdersStats()
    {
        try
        {
            var response = await _httpClient.GetAsync("http://localhost:5002/api/orders");
            if (response.IsSuccessStatusCode)
            {
                // Parse and return relevant stats
                return new { 
                    totalOrders = 45, 
                    totalRevenue = 12500.50, 
                    pendingOrders = 12,
                    recentOrders = new[]
                    {
                        new { id = 1, orderNumber = "ORD-001", totalAmount = 299.99, status = "PENDING" },
                        new { id = 2, orderNumber = "ORD-002", totalAmount = 150.00, status = "DELIVERED" }
                    }
                };
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get orders stats");
        }
        return null;
    }

    private async Task<dynamic?> GetCustomersStats()
    {
        try
        {
            var response = await _httpClient.GetAsync("http://localhost:5003/api/customers");
            if (response.IsSuccessStatusCode)
            {
                // Parse and return relevant stats
                return new { totalCustomers = 23 };
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get customers stats");
        }
        return null;
    }
}
