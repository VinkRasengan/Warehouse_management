using NotificationService.DTOs;
using NotificationService.Models;

namespace NotificationService.Services
{
    public interface INotificationService
    {
        Task<NotificationDto> CreateNotificationAsync(CreateNotificationDto createNotificationDto);
        Task<NotificationDto?> GetNotificationByIdAsync(int id);
        Task<IEnumerable<NotificationDto>> GetNotificationsByRecipientAsync(string recipient);
        Task<IEnumerable<NotificationDto>> GetNotificationsByStatusAsync(NotificationStatus status);
        Task<IEnumerable<NotificationDto>> GetNotificationsByTypeAsync(NotificationType type);
        Task<IEnumerable<NotificationDto>> GetNotificationsByEntityAsync(string entityType, int entityId);
        Task<NotificationDto> SendNotificationAsync(int notificationId);
        Task<List<NotificationDto>> SendBulkNotificationAsync(SendBulkNotificationDto bulkNotificationDto);
        Task<NotificationDto> UpdateNotificationStatusAsync(int notificationId, NotificationStatus status, string? errorMessage = null);
        Task<NotificationDto> ScheduleNotificationAsync(CreateNotificationDto createNotificationDto, DateTime scheduledAt);
        Task<IEnumerable<NotificationDto>> GetPendingNotificationsAsync();
        Task ProcessScheduledNotificationsAsync();
        Task RetryFailedNotificationAsync(int notificationId);
    }
}
