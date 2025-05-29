using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

namespace PaymentService.Services
{
    public class RabbitMQService : IRabbitMQService, IDisposable
    {
        private readonly IConnection _connection;
        private readonly IModel _channel;
        private readonly ILogger<RabbitMQService> _logger;

        public RabbitMQService(ILogger<RabbitMQService> logger, IConfiguration configuration)
        {
            _logger = logger;
            
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
            _channel.ExchangeDeclare("payment.events", ExchangeType.Topic, true);
            _channel.QueueDeclare("payment.completed", true, false, false, null);
            _channel.QueueDeclare("payment.failed", true, false, false, null);
            _channel.QueueDeclare("payment.refunded", true, false, false, null);

            _channel.QueueBind("payment.completed", "payment.events", "payment.completed");
            _channel.QueueBind("payment.failed", "payment.events", "payment.failed");
            _channel.QueueBind("payment.refunded", "payment.events", "payment.refunded");
        }

        public async Task PublishPaymentCompletedAsync(int orderId, decimal amount, string transactionId)
        {
            var message = new
            {
                OrderId = orderId,
                Amount = amount,
                TransactionId = transactionId,
                Timestamp = DateTime.UtcNow
            };

            await PublishMessageAsync("payment.completed", message);
            _logger.LogInformation("Published payment completed event for order {OrderId}", orderId);
        }

        public async Task PublishPaymentFailedAsync(int orderId, string reason)
        {
            var message = new
            {
                OrderId = orderId,
                Reason = reason,
                Timestamp = DateTime.UtcNow
            };

            await PublishMessageAsync("payment.failed", message);
            _logger.LogInformation("Published payment failed event for order {OrderId}", orderId);
        }

        public async Task PublishRefundCompletedAsync(int orderId, decimal amount, string transactionId)
        {
            var message = new
            {
                OrderId = orderId,
                Amount = amount,
                TransactionId = transactionId,
                Timestamp = DateTime.UtcNow
            };

            await PublishMessageAsync("payment.refunded", message);
            _logger.LogInformation("Published refund completed event for order {OrderId}", orderId);
        }

        private async Task PublishMessageAsync(string routingKey, object message)
        {
            var json = JsonSerializer.Serialize(message);
            var body = Encoding.UTF8.GetBytes(json);

            var properties = _channel.CreateBasicProperties();
            properties.Persistent = true;
            properties.Timestamp = new AmqpTimestamp(DateTimeOffset.UtcNow.ToUnixTimeSeconds());

            await Task.Run(() => _channel.BasicPublish(
                exchange: "payment.events",
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
