using System.Net;
using System.Net.Mail;
using AlertService.DTOs;

namespace AlertService.Services
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

        public async Task SendAlertEmailAsync(string title, string message, string severity)
        {
            try
            {
                var smtpHost = _configuration["Email:SmtpHost"];
                var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
                var fromAddress = _configuration["Email:FromAddress"];
                var username = _configuration["Email:Username"];
                var password = _configuration["Email:Password"];

                // Default recipients for alerts
                var recipients = new[] { "admin@warehouse.com", "alerts@warehouse.com" };

                using var client = new SmtpClient(smtpHost, smtpPort)
                {
                    Credentials = new NetworkCredential(username, password),
                    EnableSsl = true
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(fromAddress ?? "noreply@warehouse.com", "Warehouse Management System"),
                    Subject = $"[{severity}] {title}",
                    Body = $@"
                        <h2>Alert Notification</h2>
                        <p><strong>Severity:</strong> {severity}</p>
                        <p><strong>Title:</strong> {title}</p>
                        <p><strong>Message:</strong> {message}</p>
                        <p><strong>Time:</strong> {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC</p>
                        <hr>
                        <p><em>This is an automated message from the Warehouse Management System.</em></p>
                    ",
                    IsBodyHtml = true
                };

                foreach (var recipient in recipients)
                {
                    mailMessage.To.Add(recipient);
                }

                await client.SendMailAsync(mailMessage);
                _logger.LogInformation("Alert email sent successfully for: {Title}", title);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send alert email for: {Title}", title);
            }
        }

        public async Task SendAlertDigestAsync(List<string> recipients, List<AlertDto> alerts)
        {
            try
            {
                var smtpHost = _configuration["Email:SmtpHost"];
                var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
                var fromAddress = _configuration["Email:FromAddress"];
                var username = _configuration["Email:Username"];
                var password = _configuration["Email:Password"];

                using var client = new SmtpClient(smtpHost, smtpPort)
                {
                    Credentials = new NetworkCredential(username, password),
                    EnableSsl = true
                };

                var alertsHtml = string.Join("", alerts.Select(a => $@"
                    <tr>
                        <td>{a.Severity}</td>
                        <td>{a.Type}</td>
                        <td>{a.Title}</td>
                        <td>{a.CreatedAt:yyyy-MM-dd HH:mm}</td>
                    </tr>
                "));

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(fromAddress ?? "noreply@warehouse.com", "Warehouse Management System"),
                    Subject = $"Alert Digest - {alerts.Count} alerts",
                    Body = $@"
                        <h2>Alert Digest</h2>
                        <p>Summary of recent alerts:</p>
                        <table border='1' style='border-collapse: collapse; width: 100%;'>
                            <thead>
                                <tr style='background-color: #f2f2f2;'>
                                    <th>Severity</th>
                                    <th>Type</th>
                                    <th>Title</th>
                                    <th>Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alertsHtml}
                            </tbody>
                        </table>
                        <hr>
                        <p><em>This is an automated digest from the Warehouse Management System.</em></p>
                    ",
                    IsBodyHtml = true
                };

                foreach (var recipient in recipients)
                {
                    mailMessage.To.Add(recipient);
                }

                await client.SendMailAsync(mailMessage);
                _logger.LogInformation("Alert digest sent successfully to {RecipientCount} recipients", recipients.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send alert digest");
            }
        }
    }
}
