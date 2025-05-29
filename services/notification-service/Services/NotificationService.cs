using AutoMapper;
using Microsoft.EntityFrameworkCore;
using NotificationService.Data;
using NotificationService.DTOs;
using NotificationService.Models;
using System.Text.Json;

namespace NotificationService.Services
{
    public class NotificationService : INotificationService
    {
        private readonly NotificationDbContext _context;
        private readonly IMapper _mapper;
        private readonly IEmailService _emailService;
        private readonly ISmsService _smsService;
        private readonly IPushNotificationService _pushNotificationService;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            NotificationDbContext context,
            IMapper mapper,
            IEmailService emailService,
            ISmsService smsService,
            IPushNotificationService pushNotificationService,
            ILogger<NotificationService> logger)
        {
            _context = context;
            _mapper = mapper;
            _emailService = emailService;
            _smsService = smsService;
            _pushNotificationService = pushNotificationService;
            _logger = logger;
        }

        public async Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto createNotificationDto)
        {
            var notification = new Notification
            {
                Type = createNotificationDto.Type,
                Recipient = createNotificationDto.Recipient,
                Subject = createNotificationDto.Subject,
                Message = createNotificationDto.Message,
                TemplateId = createNotificationDto.TemplateId,
                TemplateData = createNotificationDto.TemplateData != null ? JsonSerializer.Serialize(createNotificationDto.TemplateData) : null,
                Status = createNotificationDto.ScheduledAt.HasValue ? NotificationStatus.Scheduled : NotificationStatus.Pending,
                Priority = createNotificationDto.Priority,
                ScheduledAt = createNotificationDto.ScheduledAt,
                RelatedEntityType = createNotificationDto.RelatedEntityType,
                RelatedEntityId = createNotificationDto.RelatedEntityId,
                Metadata = createNotificationDto.Metadata != null ? JsonSerializer.Serialize(createNotificationDto.Metadata) : null,
                CreatedAt = DateTime.UtcNow
            };

            // Process template if provided
            if (!string.IsNullOrEmpty(createNotificationDto.TemplateId))
            {
                await ProcessTemplateAsync(notification, createNotificationDto.TemplateData);
            }

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Notification created with ID: {NotificationId}", notification.Id);

            return _mapper.Map<NotificationDto>(notification);
        }

        public async Task<NotificationDto?> GetNotificationByIdAsync(int id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            return notification != null ? _mapper.Map<NotificationDto>(notification) : null;
        }

        public async Task<IEnumerable<NotificationDto>> GetNotificationsByRecipientAsync(string recipient)
        {
            var notifications = await _context.Notifications
                .Where(n => n.Recipient == recipient)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return _mapper.Map<IEnumerable<NotificationDto>>(notifications);
        }

        public async Task<IEnumerable<NotificationDto>> GetNotificationsByStatusAsync(NotificationStatus status)
        {
            var notifications = await _context.Notifications
                .Where(n => n.Status == status)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return _mapper.Map<IEnumerable<NotificationDto>>(notifications);
        }

        public async Task<IEnumerable<NotificationDto>> GetNotificationsByTypeAsync(NotificationType type)
        {
            var notifications = await _context.Notifications
                .Where(n => n.Type == type)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return _mapper.Map<IEnumerable<NotificationDto>>(notifications);
        }

        public async Task<IEnumerable<NotificationDto>> GetNotificationsByEntityAsync(string entityType, int entityId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.RelatedEntityType == entityType && n.RelatedEntityId == entityId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return _mapper.Map<IEnumerable<NotificationDto>>(notifications);
        }

        public async Task<NotificationDto> SendNotificationAsync(int notificationId)
        {
            var notification = await _context.Notifications.FindAsync(notificationId);
            if (notification == null)
                throw new ArgumentException("Notification not found");

            if (notification.Status != NotificationStatus.Pending && notification.Status != NotificationStatus.Scheduled)
                throw new InvalidOperationException("Notification is not in a sendable state");

            notification.Status = NotificationStatus.Sending;
            await _context.SaveChangesAsync();

            bool success = false;
            try
            {
                success = notification.Type switch
                {
                    NotificationType.Email => await _emailService.SendEmailAsync(notification.Recipient, notification.Subject, notification.Message, true),
                    NotificationType.SMS => await _smsService.SendSmsAsync(notification.Recipient, notification.Message),
                    NotificationType.Push => await _pushNotificationService.SendPushNotificationAsync(notification.Recipient, notification.Subject, notification.Message),
                    _ => false
                };

                if (success)
                {
                    notification.Status = NotificationStatus.Sent;
                    notification.SentAt = DateTime.UtcNow;
                }
                else
                {
                    notification.Status = NotificationStatus.Failed;
                    notification.ErrorMessage = "Failed to send notification";
                    notification.RetryCount++;
                }
            }
            catch (Exception ex)
            {
                notification.Status = NotificationStatus.Failed;
                notification.ErrorMessage = ex.Message;
                notification.RetryCount++;
                _logger.LogError(ex, "Error sending notification {NotificationId}", notificationId);
            }

            await _context.SaveChangesAsync();
            return _mapper.Map<NotificationDto>(notification);
        }

        public async Task<List<NotificationDto>> SendBulkNotificationAsync(SendBulkNotificationDto bulkNotificationDto)
        {
            var notifications = new List<Notification>();

            foreach (var recipient in bulkNotificationDto.Recipients)
            {
                var notification = new Notification
                {
                    Type = bulkNotificationDto.Type,
                    Recipient = recipient,
                    Subject = bulkNotificationDto.Subject,
                    Message = bulkNotificationDto.Message,
                    TemplateId = bulkNotificationDto.TemplateId,
                    TemplateData = bulkNotificationDto.TemplateData != null ? JsonSerializer.Serialize(bulkNotificationDto.TemplateData) : null,
                    Status = bulkNotificationDto.ScheduledAt.HasValue ? NotificationStatus.Scheduled : NotificationStatus.Pending,
                    Priority = bulkNotificationDto.Priority,
                    ScheduledAt = bulkNotificationDto.ScheduledAt,
                    CreatedAt = DateTime.UtcNow
                };

                // Process template if provided
                if (!string.IsNullOrEmpty(bulkNotificationDto.TemplateId))
                {
                    await ProcessTemplateAsync(notification, bulkNotificationDto.TemplateData);
                }

                notifications.Add(notification);
            }

            _context.Notifications.AddRange(notifications);
            await _context.SaveChangesAsync();

            // Send notifications if not scheduled
            if (!bulkNotificationDto.ScheduledAt.HasValue)
            {
                var sendTasks = notifications.Select(n => SendNotificationAsync(n.Id));
                await Task.WhenAll(sendTasks);
            }

            return _mapper.Map<List<NotificationDto>>(notifications);
        }

        public async Task<NotificationDto> UpdateNotificationStatusAsync(int notificationId, NotificationStatus status, string? errorMessage = null)
        {
            var notification = await _context.Notifications.FindAsync(notificationId);
            if (notification == null)
                throw new ArgumentException("Notification not found");

            notification.Status = status;
            if (!string.IsNullOrEmpty(errorMessage))
                notification.ErrorMessage = errorMessage;

            if (status == NotificationStatus.Sent)
                notification.SentAt = DateTime.UtcNow;
            else if (status == NotificationStatus.Delivered)
                notification.DeliveredAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return _mapper.Map<NotificationDto>(notification);
        }

        public async Task<NotificationDto> ScheduleNotificationAsync(CreateNotificationDto createNotificationDto, DateTime scheduledAt)
        {
            createNotificationDto.ScheduledAt = scheduledAt;
            return await CreateNotificationAsync(createNotificationDto);
        }

        public async Task<IEnumerable<NotificationDto>> GetPendingNotificationsAsync()
        {
            var notifications = await _context.Notifications
                .Where(n => n.Status == NotificationStatus.Pending || 
                           (n.Status == NotificationStatus.Scheduled && n.ScheduledAt <= DateTime.UtcNow))
                .OrderBy(n => n.Priority)
                .ThenBy(n => n.CreatedAt)
                .ToListAsync();

            return _mapper.Map<IEnumerable<NotificationDto>>(notifications);
        }

        public async Task ProcessScheduledNotificationsAsync()
        {
            var scheduledNotifications = await _context.Notifications
                .Where(n => n.Status == NotificationStatus.Scheduled && n.ScheduledAt <= DateTime.UtcNow)
                .ToListAsync();

            foreach (var notification in scheduledNotifications)
            {
                try
                {
                    await SendNotificationAsync(notification.Id);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing scheduled notification {NotificationId}", notification.Id);
                }
            }
        }

        public async Task RetryFailedNotificationAsync(int notificationId)
        {
            var notification = await _context.Notifications.FindAsync(notificationId);
            if (notification == null)
                throw new ArgumentException("Notification not found");

            if (notification.Status != NotificationStatus.Failed)
                throw new InvalidOperationException("Notification is not in failed status");

            if (notification.RetryCount >= notification.MaxRetries)
                throw new InvalidOperationException("Maximum retry attempts exceeded");

            notification.Status = NotificationStatus.Pending;
            notification.ErrorMessage = null;
            await _context.SaveChangesAsync();

            await SendNotificationAsync(notificationId);
        }

        private async Task ProcessTemplateAsync(Notification notification, Dictionary<string, object>? templateData)
        {
            var template = await _context.NotificationTemplates
                .FirstOrDefaultAsync(t => t.Code == notification.TemplateId && t.IsActive);

            if (template != null && templateData != null)
            {
                notification.Subject = ProcessTemplate(template.Subject, templateData);
                notification.Message = ProcessTemplate(template.Body, templateData);
            }
        }

        private string ProcessTemplate(string template, Dictionary<string, object> data)
        {
            var result = template;
            foreach (var kvp in data)
            {
                result = result.Replace($"{{{kvp.Key}}}", kvp.Value?.ToString() ?? "");
            }
            return result;
        }
    }
}
