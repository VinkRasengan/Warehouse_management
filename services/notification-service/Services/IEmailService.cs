namespace NotificationService.Services
{
    public interface IEmailService
    {
        Task<bool> SendEmailAsync(string to, string subject, string body, bool isHtml = false);
        Task<bool> SendEmailWithAttachmentAsync(string to, string subject, string body, List<EmailAttachment> attachments, bool isHtml = false);
        Task<bool> SendBulkEmailAsync(List<string> recipients, string subject, string body, bool isHtml = false);
    }

    public class EmailAttachment
    {
        public string FileName { get; set; } = string.Empty;
        public byte[] Content { get; set; } = Array.Empty<byte>();
        public string ContentType { get; set; } = "application/octet-stream";
    }
}
