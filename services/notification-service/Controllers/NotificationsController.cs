using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NotificationService.DTOs;
using NotificationService.Models;
using NotificationService.Services;

namespace NotificationService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;
        private readonly ILogger<NotificationsController> _logger;

        public NotificationsController(INotificationService notificationService, ILogger<NotificationsController> logger)
        {
            _notificationService = notificationService;
            _logger = logger;
        }

        [HttpPost]
        public async Task<ActionResult<NotificationDto>> CreateNotification([FromBody] CreateNotificationDto createNotificationDto)
        {
            try
            {
                var notification = await _notificationService.CreateNotificationAsync(createNotificationDto);
                return CreatedAtAction(nameof(GetNotification), new { id = notification.Id }, notification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating notification");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<NotificationDto>> GetNotification(int id)
        {
            var notification = await _notificationService.GetNotificationByIdAsync(id);
            if (notification == null)
                return NotFound();

            return Ok(notification);
        }

        [HttpGet("recipient/{recipient}")]
        public async Task<ActionResult<IEnumerable<NotificationDto>>> GetNotificationsByRecipient(string recipient)
        {
            var notifications = await _notificationService.GetNotificationsByRecipientAsync(recipient);
            return Ok(notifications);
        }

        [HttpGet("status/{status}")]
        public async Task<ActionResult<IEnumerable<NotificationDto>>> GetNotificationsByStatus(NotificationStatus status)
        {
            var notifications = await _notificationService.GetNotificationsByStatusAsync(status);
            return Ok(notifications);
        }

        [HttpGet("type/{type}")]
        public async Task<ActionResult<IEnumerable<NotificationDto>>> GetNotificationsByType(NotificationType type)
        {
            var notifications = await _notificationService.GetNotificationsByTypeAsync(type);
            return Ok(notifications);
        }

        [HttpGet("entity/{entityType}/{entityId}")]
        public async Task<ActionResult<IEnumerable<NotificationDto>>> GetNotificationsByEntity(string entityType, int entityId)
        {
            var notifications = await _notificationService.GetNotificationsByEntityAsync(entityType, entityId);
            return Ok(notifications);
        }

        [HttpPost("{id}/send")]
        public async Task<ActionResult<NotificationDto>> SendNotification(int id)
        {
            try
            {
                var notification = await _notificationService.SendNotificationAsync(id);
                return Ok(notification);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending notification {NotificationId}", id);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPost("bulk")]
        public async Task<ActionResult<List<NotificationDto>>> SendBulkNotification([FromBody] SendBulkNotificationDto bulkNotificationDto)
        {
            try
            {
                var notifications = await _notificationService.SendBulkNotificationAsync(bulkNotificationDto);
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending bulk notification");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult<NotificationDto>> UpdateNotificationStatus(int id, [FromBody] UpdateNotificationStatusDto updateStatusDto)
        {
            try
            {
                var notification = await _notificationService.UpdateNotificationStatusAsync(id, updateStatusDto.Status, updateStatusDto.ErrorMessage);
                return Ok(notification);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating notification status {NotificationId}", id);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPost("schedule")]
        public async Task<ActionResult<NotificationDto>> ScheduleNotification([FromBody] ScheduleNotificationDto scheduleNotificationDto)
        {
            try
            {
                var notification = await _notificationService.ScheduleNotificationAsync(scheduleNotificationDto.Notification, scheduleNotificationDto.ScheduledAt);
                return CreatedAtAction(nameof(GetNotification), new { id = notification.Id }, notification);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error scheduling notification");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("pending")]
        public async Task<ActionResult<IEnumerable<NotificationDto>>> GetPendingNotifications()
        {
            var notifications = await _notificationService.GetPendingNotificationsAsync();
            return Ok(notifications);
        }

        [HttpPost("process-scheduled")]
        public async Task<ActionResult> ProcessScheduledNotifications()
        {
            try
            {
                await _notificationService.ProcessScheduledNotificationsAsync();
                return Ok(new { message = "Scheduled notifications processed successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing scheduled notifications");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPost("{id}/retry")]
        public async Task<ActionResult<NotificationDto>> RetryFailedNotification(int id)
        {
            try
            {
                await _notificationService.RetryFailedNotificationAsync(id);
                var notification = await _notificationService.GetNotificationByIdAsync(id);
                return Ok(notification);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrying notification {NotificationId}", id);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
    }

    public class UpdateNotificationStatusDto
    {
        public NotificationStatus Status { get; set; }
        public string? ErrorMessage { get; set; }
    }

    public class ScheduleNotificationDto
    {
        public CreateNotificationDto Notification { get; set; } = new();
        public DateTime ScheduledAt { get; set; }
    }
}
