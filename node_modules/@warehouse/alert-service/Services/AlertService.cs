using AutoMapper;
using Microsoft.EntityFrameworkCore;
using AlertService.Data;
using AlertService.DTOs;
using AlertService.Models;

namespace AlertService.Services
{
    public class AlertService : IAlertService
    {
        private readonly AlertDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<AlertService> _logger;
        private readonly IEmailService _emailService;

        public AlertService(AlertDbContext context, IMapper mapper, ILogger<AlertService> logger, IEmailService emailService)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
            _emailService = emailService;
        }

        public async Task<AlertDto> CreateAlertAsync(CreateAlertDto createAlertDto)
        {
            var alert = _mapper.Map<Alert>(createAlertDto);
            alert.CreatedAt = DateTime.UtcNow;

            _context.Alerts.Add(alert);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Alert created with ID: {AlertId}", alert.Id);

            // Send email notification for high severity alerts
            if (alert.Severity == "HIGH" || alert.Severity == "CRITICAL")
            {
                await _emailService.SendAlertEmailAsync(alert.Title, alert.Message, alert.Severity);
            }

            return _mapper.Map<AlertDto>(alert);
        }

        public async Task<AlertDto?> GetAlertByIdAsync(int id)
        {
            var alert = await _context.Alerts.FindAsync(id);
            return alert != null ? _mapper.Map<AlertDto>(alert) : null;
        }

        public async Task<IEnumerable<AlertDto>> GetAlertsAsync(string? type = null, string? severity = null, bool? isResolved = null)
        {
            var query = _context.Alerts.AsQueryable();

            if (!string.IsNullOrEmpty(type))
                query = query.Where(a => a.Type == type);

            if (!string.IsNullOrEmpty(severity))
                query = query.Where(a => a.Severity == severity);

            if (isResolved.HasValue)
                query = query.Where(a => a.IsResolved == isResolved.Value);

            var alerts = await query.OrderByDescending(a => a.CreatedAt).ToListAsync();
            return _mapper.Map<IEnumerable<AlertDto>>(alerts);
        }

        public async Task<AlertDto> ResolveAlertAsync(int id, string resolvedBy, string? resolution = null)
        {
            var alert = await _context.Alerts.FindAsync(id);
            if (alert == null)
                throw new ArgumentException("Alert not found");

            alert.IsResolved = true;
            alert.ResolvedAt = DateTime.UtcNow;
            alert.ResolvedBy = resolvedBy;
            alert.Resolution = resolution;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Alert {AlertId} resolved by {ResolvedBy}", id, resolvedBy);

            return _mapper.Map<AlertDto>(alert);
        }

        public async Task<bool> DeleteAlertAsync(int id)
        {
            var alert = await _context.Alerts.FindAsync(id);
            if (alert == null)
                return false;

            _context.Alerts.Remove(alert);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Alert deleted: {AlertId}", id);

            return true;
        }

        public async Task<IEnumerable<AlertDto>> GetUnresolvedAlertsAsync()
        {
            var alerts = await _context.Alerts
                .Where(a => !a.IsResolved)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return _mapper.Map<IEnumerable<AlertDto>>(alerts);
        }

        public async Task ProcessInventoryAlertAsync(int productId, string productName, int currentStock, int minimumThreshold)
        {
            var createAlertDto = new CreateAlertDto
            {
                Title = $"Low Inventory Alert - {productName}",
                Message = $"Product {productName} (ID: {productId}) is running low. Current stock: {currentStock}, Minimum threshold: {minimumThreshold}",
                Type = "INVENTORY",
                Severity = "HIGH",
                Source = "InventoryService",
                RelatedEntityType = "Product",
                RelatedEntityId = productId
            };

            await CreateAlertAsync(createAlertDto);
        }

        public async Task ProcessPaymentAlertAsync(int paymentId, string reason)
        {
            var createAlertDto = new CreateAlertDto
            {
                Title = "Payment Failed",
                Message = $"Payment {paymentId} failed. Reason: {reason}",
                Type = "PAYMENT",
                Severity = "MEDIUM",
                Source = "PaymentService",
                RelatedEntityType = "Payment",
                RelatedEntityId = paymentId
            };

            await CreateAlertAsync(createAlertDto);
        }

        public async Task ProcessOrderAlertAsync(int orderId, string alertType, string message)
        {
            var severity = alertType switch
            {
                "ORDER_CANCELLED" => "MEDIUM",
                "ORDER_DELAYED" => "LOW",
                "ORDER_FAILED" => "HIGH",
                _ => "LOW"
            };

            var createAlertDto = new CreateAlertDto
            {
                Title = $"Order Alert - {alertType}",
                Message = $"Order {orderId}: {message}",
                Type = "ORDER",
                Severity = severity,
                Source = "OrderService",
                RelatedEntityType = "Order",
                RelatedEntityId = orderId
            };

            await CreateAlertAsync(createAlertDto);
        }
    }
}
