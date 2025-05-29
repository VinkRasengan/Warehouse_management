using Microsoft.AspNetCore.SignalR;
using NotificationService.Hubs;

namespace NotificationService.Services
{
    public class RealTimeNotificationService : IRealTimeNotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly ILogger<RealTimeNotificationService> _logger;

        public RealTimeNotificationService(
            IHubContext<NotificationHub> hubContext,
            ILogger<RealTimeNotificationService> logger)
        {
            _hubContext = hubContext;
            _logger = logger;
        }

        public async Task SendNotificationToUserAsync(string userId, object notification)
        {
            try
            {
                await _hubContext.Clients.Group($"user_{userId}")
                    .SendAsync("ReceiveNotification", notification);
                
                _logger.LogInformation("Real-time notification sent to user {UserId}", userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending real-time notification to user {UserId}", userId);
            }
        }

        public async Task SendNotificationToGroupAsync(string groupName, object notification)
        {
            try
            {
                await _hubContext.Clients.Group(groupName)
                    .SendAsync("ReceiveNotification", notification);
                
                _logger.LogInformation("Real-time notification sent to group {GroupName}", groupName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending real-time notification to group {GroupName}", groupName);
            }
        }

        public async Task SendNotificationToAllAsync(object notification)
        {
            try
            {
                await _hubContext.Clients.All
                    .SendAsync("ReceiveNotification", notification);
                
                _logger.LogInformation("Real-time notification sent to all users");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending real-time notification to all users");
            }
        }

        public async Task SendOrderNotificationAsync(string customerId, string orderId, string status, string message)
        {
            var notification = new
            {
                Type = "order_update",
                OrderId = orderId,
                Status = status,
                Message = message,
                Timestamp = DateTime.UtcNow,
                Icon = "shopping-cart",
                Color = GetStatusColor(status)
            };

            await SendNotificationToUserAsync(customerId, notification);
        }

        public async Task SendInventoryAlertAsync(string productId, string productName, int currentStock, int minStock)
        {
            var notification = new
            {
                Type = "inventory_alert",
                ProductId = productId,
                ProductName = productName,
                CurrentStock = currentStock,
                MinStock = minStock,
                Message = $"Low stock alert: {productName} has only {currentStock} units left (minimum: {minStock})",
                Timestamp = DateTime.UtcNow,
                Icon = "warning",
                Color = currentStock == 0 ? "error" : "warning"
            };

            // Send to all admin users
            await SendNotificationToGroupAsync("admins", notification);
        }

        public async Task SendSystemAlertAsync(string message, string severity = "info")
        {
            var notification = new
            {
                Type = "system_alert",
                Message = message,
                Severity = severity,
                Timestamp = DateTime.UtcNow,
                Icon = GetSeverityIcon(severity),
                Color = GetSeverityColor(severity)
            };

            await SendNotificationToAllAsync(notification);
        }

        private static string GetStatusColor(string status)
        {
            return status.ToLower() switch
            {
                "pending" => "warning",
                "confirmed" => "info",
                "shipped" => "processing",
                "delivered" => "success",
                "cancelled" => "error",
                _ => "default"
            };
        }

        private static string GetSeverityIcon(string severity)
        {
            return severity.ToLower() switch
            {
                "error" => "exclamation-circle",
                "warning" => "warning",
                "success" => "check-circle",
                "info" => "info-circle",
                _ => "bell"
            };
        }

        private static string GetSeverityColor(string severity)
        {
            return severity.ToLower() switch
            {
                "error" => "error",
                "warning" => "warning",
                "success" => "success",
                "info" => "info",
                _ => "default"
            };
        }
    }
}
