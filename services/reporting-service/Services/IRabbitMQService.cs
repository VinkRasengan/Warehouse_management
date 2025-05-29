namespace ReportingService.Services
{
    public interface IRabbitMQService
    {
        Task PublishReportGeneratedAsync(int reportId, string reportType, string createdBy);
        Task PublishReportScheduledAsync(int scheduleId, string reportType, DateTime nextRunTime);
    }
}
