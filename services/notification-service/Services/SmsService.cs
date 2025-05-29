using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace NotificationService.Services
{
    public class SmsService : ISmsService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<SmsService> _logger;

        public SmsService(IConfiguration configuration, ILogger<SmsService> logger)
        {
            _configuration = configuration;
            _logger = logger;

            // Initialize Twilio
            var accountSid = _configuration["Twilio:AccountSid"];
            var authToken = _configuration["Twilio:AuthToken"];
            
            if (!string.IsNullOrEmpty(accountSid) && !string.IsNullOrEmpty(authToken))
            {
                TwilioClient.Init(accountSid, authToken);
            }
        }

        public async Task<bool> SendSmsAsync(string phoneNumber, string message)
        {
            try
            {
                var fromNumber = _configuration["Twilio:FromNumber"];
                if (string.IsNullOrEmpty(fromNumber))
                {
                    _logger.LogError("Twilio FromNumber not configured");
                    return false;
                }

                var messageResource = await MessageResource.CreateAsync(
                    body: message,
                    from: new PhoneNumber(fromNumber),
                    to: new PhoneNumber(phoneNumber)
                );

                _logger.LogInformation("SMS sent successfully to {PhoneNumber}, SID: {MessageSid}", phoneNumber, messageResource.Sid);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send SMS to {PhoneNumber}", phoneNumber);
                return false;
            }
        }

        public async Task<bool> SendBulkSmsAsync(List<string> phoneNumbers, string message)
        {
            var tasks = phoneNumbers.Select(phoneNumber => SendSmsAsync(phoneNumber, message));
            var results = await Task.WhenAll(tasks);
            
            var successCount = results.Count(r => r);
            _logger.LogInformation("Bulk SMS sent: {SuccessCount}/{TotalCount} successful", successCount, phoneNumbers.Count);
            
            return successCount == phoneNumbers.Count;
        }

        public async Task<SmsDeliveryStatus> GetDeliveryStatusAsync(string messageId)
        {
            try
            {
                var message = await MessageResource.FetchAsync(messageId);
                
                return new SmsDeliveryStatus
                {
                    MessageId = messageId,
                    Status = message.Status.ToString(),
                    DeliveredAt = message.DateSent,
                    ErrorMessage = message.ErrorMessage
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get delivery status for message {MessageId}", messageId);
                return new SmsDeliveryStatus
                {
                    MessageId = messageId,
                    Status = "Unknown",
                    ErrorMessage = ex.Message
                };
            }
        }
    }
}
