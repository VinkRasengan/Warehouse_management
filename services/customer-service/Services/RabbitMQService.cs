using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

namespace CustomerService.Services
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
            _channel.ExchangeDeclare("customer.events", ExchangeType.Topic, true);
            _channel.QueueDeclare("customer.created", true, false, false, null);
            _channel.QueueDeclare("customer.updated", true, false, false, null);
            _channel.QueueDeclare("customer.loyalty.changed", true, false, false, null);

            _channel.QueueBind("customer.created", "customer.events", "customer.created");
            _channel.QueueBind("customer.updated", "customer.events", "customer.updated");
            _channel.QueueBind("customer.loyalty.changed", "customer.events", "customer.loyalty.changed");
        }

        public async Task PublishCustomerCreatedAsync(int customerId, string customerEmail)
        {
            var message = new
            {
                CustomerId = customerId,
                CustomerEmail = customerEmail,
                Timestamp = DateTime.UtcNow
            };

            await PublishMessageAsync("customer.created", message);
            _logger.LogInformation("Published customer created event for customer {CustomerId}", customerId);
        }

        public async Task PublishCustomerUpdatedAsync(int customerId, string customerEmail)
        {
            var message = new
            {
                CustomerId = customerId,
                CustomerEmail = customerEmail,
                Timestamp = DateTime.UtcNow
            };

            await PublishMessageAsync("customer.updated", message);
            _logger.LogInformation("Published customer updated event for customer {CustomerId}", customerId);
        }

        public async Task PublishLoyaltyPointsChangedAsync(int customerId, int newPoints, string tier)
        {
            var message = new
            {
                CustomerId = customerId,
                NewPoints = newPoints,
                Tier = tier,
                Timestamp = DateTime.UtcNow
            };

            await PublishMessageAsync("customer.loyalty.changed", message);
            _logger.LogInformation("Published loyalty points changed event for customer {CustomerId}", customerId);
        }

        private async Task PublishMessageAsync(string routingKey, object message)
        {
            var json = JsonSerializer.Serialize(message);
            var body = Encoding.UTF8.GetBytes(json);

            var properties = _channel.CreateBasicProperties();
            properties.Persistent = true;
            properties.Timestamp = new AmqpTimestamp(DateTimeOffset.UtcNow.ToUnixTimeSeconds());

            await Task.Run(() => _channel.BasicPublish(
                exchange: "customer.events",
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
