using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

namespace ReportingService.Services
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
            _channel.ExchangeDeclare("reporting.events", ExchangeType.Topic, true);
            _channel.QueueDeclare("report.generated", true, false, false, null);
            _channel.QueueDeclare("report.scheduled", true, false, false, null);

            _channel.QueueBind("report.generated", "reporting.events", "report.generated");
            _channel.QueueBind("report.scheduled", "reporting.events", "report.scheduled");
        }

        public async Task PublishReportGeneratedAsync(int reportId, string reportType, string createdBy)
        {
            var message = new
            {
                ReportId = reportId,
                ReportType = reportType,
                CreatedBy = createdBy,
                Timestamp = DateTime.UtcNow
            };

            await PublishMessageAsync("report.generated", message);
            _logger.LogInformation("Published report generated event for report {ReportId}", reportId);
        }

        public async Task PublishReportScheduledAsync(int scheduleId, string reportType, DateTime nextRunTime)
        {
            var message = new
            {
                ScheduleId = scheduleId,
                ReportType = reportType,
                NextRunTime = nextRunTime,
                Timestamp = DateTime.UtcNow
            };

            await PublishMessageAsync("report.scheduled", message);
            _logger.LogInformation("Published report scheduled event for schedule {ScheduleId}", scheduleId);
        }

        private async Task PublishMessageAsync(string routingKey, object message)
        {
            var json = JsonSerializer.Serialize(message);
            var body = Encoding.UTF8.GetBytes(json);

            var properties = _channel.CreateBasicProperties();
            properties.Persistent = true;
            properties.Timestamp = new AmqpTimestamp(DateTimeOffset.UtcNow.ToUnixTimeSeconds());

            await Task.Run(() => _channel.BasicPublish(
                exchange: "reporting.events",
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
