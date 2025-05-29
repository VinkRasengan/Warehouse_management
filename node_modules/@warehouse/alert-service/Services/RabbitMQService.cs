using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

namespace AlertService.Services
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
            _channel.ExchangeDeclare("alert.events", ExchangeType.Topic, true);
            _channel.QueueDeclare("alert.created", true, false, false, null);
            _channel.QueueDeclare("alert.resolved", true, false, false, null);

            _channel.QueueBind("alert.created", "alert.events", "alert.created");
            _channel.QueueBind("alert.resolved", "alert.events", "alert.resolved");
        }

        public async Task PublishAlertCreatedAsync(int alertId, string alertType, string severity)
        {
            var message = new
            {
                AlertId = alertId,
                AlertType = alertType,
                Severity = severity,
                Timestamp = DateTime.UtcNow
            };

            await PublishMessageAsync("alert.created", message);
            _logger.LogInformation("Published alert created event for alert {AlertId}", alertId);
        }

        public async Task PublishAlertResolvedAsync(int alertId, string resolvedBy)
        {
            var message = new
            {
                AlertId = alertId,
                ResolvedBy = resolvedBy,
                Timestamp = DateTime.UtcNow
            };

            await PublishMessageAsync("alert.resolved", message);
            _logger.LogInformation("Published alert resolved event for alert {AlertId}", alertId);
        }

        private async Task PublishMessageAsync(string routingKey, object message)
        {
            var json = JsonSerializer.Serialize(message);
            var body = Encoding.UTF8.GetBytes(json);

            var properties = _channel.CreateBasicProperties();
            properties.Persistent = true;
            properties.Timestamp = new AmqpTimestamp(DateTimeOffset.UtcNow.ToUnixTimeSeconds());

            await Task.Run(() => _channel.BasicPublish(
                exchange: "alert.events",
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
