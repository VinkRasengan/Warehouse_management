using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

namespace OrderService.Services;

public class RabbitMQService : IRabbitMQService, IDisposable
{
    private readonly IConnection _connection;
    private readonly IModel _channel;
    private readonly ILogger<RabbitMQService> _logger;

    public RabbitMQService(IConfiguration configuration, ILogger<RabbitMQService> logger)
    {
        _logger = logger;
        
        var connectionString = configuration["RabbitMQ__ConnectionString"] ?? "amqp://admin:password@localhost:5672";
        
        try
        {
            var factory = new ConnectionFactory() { Uri = new Uri(connectionString) };
            _connection = factory.CreateConnection();
            _channel = _connection.CreateModel();
            _channel.ExchangeDeclare(exchange: "warehouse_events", type: ExchangeType.Topic, durable: true);
            _logger.LogInformation("RabbitMQ connection established");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to establish RabbitMQ connection");
            throw;
        }
    }

    public async Task PublishAsync(string eventName, object data)
    {
        try
        {
            var message = JsonSerializer.Serialize(data);
            var body = Encoding.UTF8.GetBytes(message);
            var properties = _channel.CreateBasicProperties();
            properties.Persistent = true;

            _channel.BasicPublish(exchange: "warehouse_events", routingKey: eventName, basicProperties: properties, body: body);
            _logger.LogInformation("Published event: {EventName}", eventName);
            await Task.CompletedTask;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to publish event: {EventName}", eventName);
            throw;
        }
    }

    public void Dispose()
    {
        _channel?.Close();
        _connection?.Close();
        _channel?.Dispose();
        _connection?.Dispose();
    }
}
