using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;
using NotificationService.DTOs;
using NotificationService.Models;

namespace NotificationService.Services
{
    public class RabbitMQService : IRabbitMQService, IDisposable
    {
        private readonly IConnection _connection;
        private readonly IModel _channel;
        private readonly ILogger<RabbitMQService> _logger;
        private readonly IServiceProvider _serviceProvider;

        public RabbitMQService(ILogger<RabbitMQService> logger, IConfiguration configuration, IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
            
            var factory = new ConnectionFactory()
            {
                HostName = configuration["RabbitMQ:HostName"] ?? "localhost",
                Port = int.Parse(configuration["RabbitMQ:Port"] ?? "5672"),
                UserName = configuration["RabbitMQ:UserName"] ?? "guest",
                Password = configuration["RabbitMQ:Password"] ?? "guest"
            };

            _connection = factory.CreateConnection();
            _channel = _connection.CreateModel();

            // Declare exchanges and queues
            _channel.ExchangeDeclare("notification.events", ExchangeType.Topic, true);
            _channel.ExchangeDeclare("warehouse.events", ExchangeType.Topic, true);
            
            // Notification events
            _channel.QueueDeclare("notification.sent", true, false, false, null);
            _channel.QueueDeclare("notification.failed", true, false, false, null);
            
            // Incoming events to process
            _channel.QueueDeclare("order.events", true, false, false, null);
            _channel.QueueDeclare("inventory.events", true, false, false, null);
            _channel.QueueDeclare("payment.events", true, false, false, null);

            // Bind queues
            _channel.QueueBind("notification.sent", "notification.events", "notification.sent");
            _channel.QueueBind("notification.failed", "notification.events", "notification.failed");
            
            _channel.QueueBind("order.events", "warehouse.events", "order.*");
            _channel.QueueBind("inventory.events", "warehouse.events", "inventory.*");
            _channel.QueueBind("payment.events", "warehouse.events", "payment.*");
        }

        public async Task StartListeningAsync()
        {
            await Task.Run(() =>
            {
                // Listen for order events
                var orderConsumer = new EventingBasicConsumer(_channel);
                orderConsumer.Received += async (model, ea) =>
                {
                    await HandleOrderEventAsync(ea);
                };
                _channel.BasicConsume(queue: "order.events", autoAck: false, consumer: orderConsumer);

                // Listen for inventory events
                var inventoryConsumer = new EventingBasicConsumer(_channel);
                inventoryConsumer.Received += async (model, ea) =>
                {
                    await HandleInventoryEventAsync(ea);
                };
                _channel.BasicConsume(queue: "inventory.events", autoAck: false, consumer: inventoryConsumer);

                // Listen for payment events
                var paymentConsumer = new EventingBasicConsumer(_channel);
                paymentConsumer.Received += async (model, ea) =>
                {
                    await HandlePaymentEventAsync(ea);
                };
                _channel.BasicConsume(queue: "payment.events", autoAck: false, consumer: paymentConsumer);

                _logger.LogInformation("Started listening for events");
            });
        }

        public void StopListening()
        {
            _channel?.Close();
            _connection?.Close();
            _logger.LogInformation("Stopped listening for events");
        }

        public async Task PublishNotificationSentAsync(int notificationId, string recipient, string type)
        {
            var message = new
            {
                NotificationId = notificationId,
                Recipient = recipient,
                Type = type,
                Timestamp = DateTime.UtcNow
            };

            await PublishMessageAsync("notification.events", "notification.sent", message);
            _logger.LogInformation("Published notification sent event for notification {NotificationId}", notificationId);
        }

        public async Task PublishNotificationFailedAsync(int notificationId, string recipient, string type, string error)
        {
            var message = new
            {
                NotificationId = notificationId,
                Recipient = recipient,
                Type = type,
                Error = error,
                Timestamp = DateTime.UtcNow
            };

            await PublishMessageAsync("notification.events", "notification.failed", message);
            _logger.LogInformation("Published notification failed event for notification {NotificationId}", notificationId);
        }

        private async Task HandleOrderEventAsync(BasicDeliverEventArgs ea)
        {
            try
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);
                var routingKey = ea.RoutingKey;

                _logger.LogInformation("Received order event: {RoutingKey}, Message: {Message}", routingKey, message);

                using var scope = _serviceProvider.CreateScope();
                var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

                // Handle different order events
                switch (routingKey)
                {
                    case "order.created":
                        await HandleOrderCreatedAsync(message, notificationService);
                        break;
                    case "order.confirmed":
                        await HandleOrderConfirmedAsync(message, notificationService);
                        break;
                    case "order.shipped":
                        await HandleOrderShippedAsync(message, notificationService);
                        break;
                }

                _channel.BasicAck(ea.DeliveryTag, false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling order event");
                _channel.BasicNack(ea.DeliveryTag, false, true);
            }
        }

        private async Task HandleInventoryEventAsync(BasicDeliverEventArgs ea)
        {
            try
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);
                var routingKey = ea.RoutingKey;

                _logger.LogInformation("Received inventory event: {RoutingKey}, Message: {Message}", routingKey, message);

                using var scope = _serviceProvider.CreateScope();
                var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

                if (routingKey == "inventory.low_stock")
                {
                    await HandleLowStockAsync(message, notificationService);
                }

                _channel.BasicAck(ea.DeliveryTag, false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling inventory event");
                _channel.BasicNack(ea.DeliveryTag, false, true);
            }
        }

        private async Task HandlePaymentEventAsync(BasicDeliverEventArgs ea)
        {
            try
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);
                var routingKey = ea.RoutingKey;

                _logger.LogInformation("Received payment event: {RoutingKey}, Message: {Message}", routingKey, message);

                using var scope = _serviceProvider.CreateScope();
                var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

                switch (routingKey)
                {
                    case "payment.completed":
                        await HandlePaymentCompletedAsync(message, notificationService);
                        break;
                    case "payment.failed":
                        await HandlePaymentFailedAsync(message, notificationService);
                        break;
                }

                _channel.BasicAck(ea.DeliveryTag, false);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling payment event");
                _channel.BasicNack(ea.DeliveryTag, false, true);
            }
        }

        private async Task HandleOrderCreatedAsync(string message, INotificationService notificationService)
        {
            var orderData = JsonSerializer.Deserialize<JsonElement>(message);
            
            var notification = new CreateNotificationDto
            {
                Type = NotificationType.Email,
                Recipient = orderData.GetProperty("customerEmail").GetString() ?? "",
                TemplateId = "ORDER_CONFIRMATION",
                TemplateData = new Dictionary<string, object>
                {
                    ["CustomerName"] = orderData.GetProperty("customerName").GetString() ?? "",
                    ["OrderId"] = orderData.GetProperty("orderId").GetInt32(),
                    ["TotalAmount"] = orderData.GetProperty("totalAmount").GetDecimal()
                },
                Priority = 2,
                RelatedEntityType = "Order",
                RelatedEntityId = orderData.GetProperty("orderId").GetInt32()
            };

            await notificationService.CreateNotificationAsync(notification);
        }

        private async Task HandleOrderConfirmedAsync(string message, INotificationService notificationService)
        {
            // Similar implementation for order confirmed
            await Task.CompletedTask;
        }

        private async Task HandleOrderShippedAsync(string message, INotificationService notificationService)
        {
            var orderData = JsonSerializer.Deserialize<JsonElement>(message);
            
            var notification = new CreateNotificationDto
            {
                Type = NotificationType.SMS,
                Recipient = orderData.GetProperty("customerPhone").GetString() ?? "",
                TemplateId = "ORDER_SHIPPED",
                TemplateData = new Dictionary<string, object>
                {
                    ["OrderId"] = orderData.GetProperty("orderId").GetInt32(),
                    ["TrackingNumber"] = orderData.GetProperty("trackingNumber").GetString() ?? ""
                },
                Priority = 2,
                RelatedEntityType = "Order",
                RelatedEntityId = orderData.GetProperty("orderId").GetInt32()
            };

            await notificationService.CreateNotificationAsync(notification);
        }

        private async Task HandleLowStockAsync(string message, INotificationService notificationService)
        {
            var inventoryData = JsonSerializer.Deserialize<JsonElement>(message);
            
            var notification = new CreateNotificationDto
            {
                Type = NotificationType.Email,
                Recipient = "warehouse@company.com", // Admin email
                TemplateId = "LOW_INVENTORY_ALERT",
                TemplateData = new Dictionary<string, object>
                {
                    ["ProductName"] = inventoryData.GetProperty("productName").GetString() ?? "",
                    ["ProductSku"] = inventoryData.GetProperty("productSku").GetString() ?? "",
                    ["CurrentStock"] = inventoryData.GetProperty("currentStock").GetInt32(),
                    ["MinimumThreshold"] = inventoryData.GetProperty("minimumThreshold").GetInt32()
                },
                Priority = 3,
                RelatedEntityType = "Product",
                RelatedEntityId = inventoryData.GetProperty("productId").GetInt32()
            };

            await notificationService.CreateNotificationAsync(notification);
        }

        private async Task HandlePaymentCompletedAsync(string message, INotificationService notificationService)
        {
            // Implementation for payment completed notification
            await Task.CompletedTask;
        }

        private async Task HandlePaymentFailedAsync(string message, INotificationService notificationService)
        {
            // Implementation for payment failed notification
            await Task.CompletedTask;
        }

        private async Task PublishMessageAsync(string exchange, string routingKey, object message)
        {
            var json = JsonSerializer.Serialize(message);
            var body = Encoding.UTF8.GetBytes(json);

            var properties = _channel.CreateBasicProperties();
            properties.Persistent = true;
            properties.Timestamp = new AmqpTimestamp(DateTimeOffset.UtcNow.ToUnixTimeSeconds());

            await Task.Run(() => _channel.BasicPublish(
                exchange: exchange,
                routingKey: routingKey,
                basicProperties: properties,
                body: body));
        }

        public void Dispose()
        {
            _channel?.Close();
            _connection?.Close();
            _channel?.Dispose();
            _connection?.Dispose();
        }
    }
}
