namespace NotificationService.Services
{
    public interface ISmsService
    {
        Task<bool> SendSmsAsync(string phoneNumber, string message);
        Task<bool> SendBulkSmsAsync(List<string> phoneNumbers, string message);
        Task<SmsDeliveryStatus> GetDeliveryStatusAsync(string messageId);
    }

    public class SmsDeliveryStatus
    {
        public string MessageId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime? DeliveredAt { get; set; }
        public string? ErrorMessage { get; set; }
    }
}
