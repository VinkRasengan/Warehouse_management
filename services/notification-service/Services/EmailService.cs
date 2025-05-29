using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace NotificationService.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<bool> SendEmailAsync(string to, string subject, string body, bool isHtml = false)
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(
                    _configuration["Email:FromName"] ?? "Warehouse Management",
                    _configuration["Email:FromAddress"] ?? "noreply@warehouse.com"));
                message.To.Add(new MailboxAddress("", to));
                message.Subject = subject;

                var bodyBuilder = new BodyBuilder();
                if (isHtml)
                    bodyBuilder.HtmlBody = body;
                else
                    bodyBuilder.TextBody = body;

                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                await client.ConnectAsync(
                    _configuration["Email:SmtpHost"] ?? "localhost",
                    int.Parse(_configuration["Email:SmtpPort"] ?? "587"),
                    SecureSocketOptions.StartTls);

                var username = _configuration["Email:Username"];
                var password = _configuration["Email:Password"];
                if (!string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(password))
                {
                    await client.AuthenticateAsync(username, password);
                }

                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation("Email sent successfully to {Recipient}", to);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Recipient}", to);
                return false;
            }
        }

        public async Task<bool> SendEmailWithAttachmentAsync(string to, string subject, string body, List<EmailAttachment> attachments, bool isHtml = false)
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(
                    _configuration["Email:FromName"] ?? "Warehouse Management",
                    _configuration["Email:FromAddress"] ?? "noreply@warehouse.com"));
                message.To.Add(new MailboxAddress("", to));
                message.Subject = subject;

                var bodyBuilder = new BodyBuilder();
                if (isHtml)
                    bodyBuilder.HtmlBody = body;
                else
                    bodyBuilder.TextBody = body;

                // Add attachments
                foreach (var attachment in attachments)
                {
                    bodyBuilder.Attachments.Add(attachment.FileName, attachment.Content, ContentType.Parse(attachment.ContentType));
                }

                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                await client.ConnectAsync(
                    _configuration["Email:SmtpHost"] ?? "localhost",
                    int.Parse(_configuration["Email:SmtpPort"] ?? "587"),
                    SecureSocketOptions.StartTls);

                var username = _configuration["Email:Username"];
                var password = _configuration["Email:Password"];
                if (!string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(password))
                {
                    await client.AuthenticateAsync(username, password);
                }

                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                _logger.LogInformation("Email with attachments sent successfully to {Recipient}", to);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email with attachments to {Recipient}", to);
                return false;
            }
        }

        public async Task<bool> SendBulkEmailAsync(List<string> recipients, string subject, string body, bool isHtml = false)
        {
            var tasks = recipients.Select(recipient => SendEmailAsync(recipient, subject, body, isHtml));
            var results = await Task.WhenAll(tasks);
            
            var successCount = results.Count(r => r);
            _logger.LogInformation("Bulk email sent: {SuccessCount}/{TotalCount} successful", successCount, recipients.Count);
            
            return successCount == recipients.Count;
        }
    }
}
