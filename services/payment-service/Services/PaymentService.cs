using AutoMapper;
using Microsoft.EntityFrameworkCore;
using PaymentService.Data;
using PaymentService.DTOs;
using PaymentService.Models;

namespace PaymentService.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly PaymentDbContext _context;
        private readonly IMapper _mapper;
        private readonly IPaymentProviderService _paymentProviderService;
        private readonly ILogger<PaymentService> _logger;

        public PaymentService(
            PaymentDbContext context,
            IMapper mapper,
            IPaymentProviderService paymentProviderService,
            ILogger<PaymentService> logger)
        {
            _context = context;
            _mapper = mapper;
            _paymentProviderService = paymentProviderService;
            _logger = logger;
        }

        public async Task<PaymentDto> CreatePaymentAsync(CreatePaymentDto createPaymentDto)
        {
            var payment = new Payment
            {
                TransactionId = GenerateTransactionId(),
                OrderId = createPaymentDto.OrderId,
                Amount = createPaymentDto.Amount,
                Currency = createPaymentDto.Currency,
                PaymentMethod = createPaymentDto.PaymentMethod,
                Status = PaymentStatus.Pending,
                CustomerEmail = createPaymentDto.CustomerEmail,
                CustomerPhone = createPaymentDto.CustomerPhone,
                Description = createPaymentDto.Description,
                CreatedAt = DateTime.UtcNow
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Payment created with ID: {PaymentId}", payment.Id);

            return _mapper.Map<PaymentDto>(payment);
        }

        public async Task<PaymentDto?> GetPaymentByIdAsync(int id)
        {
            var payment = await _context.Payments
                .Include(p => p.Transactions)
                .FirstOrDefaultAsync(p => p.Id == id);

            return payment != null ? _mapper.Map<PaymentDto>(payment) : null;
        }

        public async Task<PaymentDto?> GetPaymentByTransactionIdAsync(string transactionId)
        {
            var payment = await _context.Payments
                .Include(p => p.Transactions)
                .FirstOrDefaultAsync(p => p.TransactionId == transactionId);

            return payment != null ? _mapper.Map<PaymentDto>(payment) : null;
        }

        public async Task<IEnumerable<PaymentDto>> GetPaymentsByOrderIdAsync(int orderId)
        {
            var payments = await _context.Payments
                .Include(p => p.Transactions)
                .Where(p => p.OrderId == orderId)
                .ToListAsync();

            return _mapper.Map<IEnumerable<PaymentDto>>(payments);
        }

        public async Task<PaymentDto> ProcessPaymentAsync(ProcessPaymentDto processPaymentDto)
        {
            var payment = await _context.Payments
                .Include(p => p.Transactions)
                .FirstOrDefaultAsync(p => p.Id == processPaymentDto.PaymentId);

            if (payment == null)
                throw new ArgumentException("Payment not found");

            if (payment.Status != PaymentStatus.Pending)
                throw new InvalidOperationException("Payment is not in pending status");

            try
            {
                payment.Status = PaymentStatus.Processing;
                payment.ProcessedAt = DateTime.UtcNow;
                payment.PaymentProviderTransactionId = processPaymentDto.PaymentProviderTransactionId;
                payment.PaymentProviderResponse = processPaymentDto.PaymentProviderResponse;

                // Process payment with provider
                var result = await _paymentProviderService.ProcessPaymentAsync(payment);

                if (result.IsSuccess)
                {
                    payment.Status = PaymentStatus.Completed;
                    payment.CompletedAt = DateTime.UtcNow;
                }
                else
                {
                    payment.Status = PaymentStatus.Failed;
                    payment.FailureReason = result.ErrorMessage;
                }

                await _context.SaveChangesAsync();

                _logger.LogInformation("Payment {PaymentId} processed with status: {Status}", 
                    payment.Id, payment.Status);

                return _mapper.Map<PaymentDto>(payment);
            }
            catch (Exception ex)
            {
                payment.Status = PaymentStatus.Failed;
                payment.FailureReason = ex.Message;
                await _context.SaveChangesAsync();

                _logger.LogError(ex, "Error processing payment {PaymentId}", payment.Id);
                throw;
            }
        }

        public async Task<PaymentDto> RefundPaymentAsync(RefundPaymentDto refundPaymentDto)
        {
            var payment = await _context.Payments
                .Include(p => p.Transactions)
                .FirstOrDefaultAsync(p => p.Id == refundPaymentDto.PaymentId);

            if (payment == null)
                throw new ArgumentException("Payment not found");

            if (payment.Status != PaymentStatus.Completed)
                throw new InvalidOperationException("Payment is not completed");

            var refundAmount = refundPaymentDto.Amount ?? payment.Amount;

            var transaction = new PaymentTransaction
            {
                PaymentId = payment.Id,
                TransactionType = "Refund",
                Amount = refundAmount,
                Status = TransactionStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                Notes = refundPaymentDto.Reason
            };

            _context.PaymentTransactions.Add(transaction);

            // Process refund with provider
            var result = await _paymentProviderService.RefundPaymentAsync(payment, refundAmount);

            if (result.IsSuccess)
            {
                transaction.Status = TransactionStatus.Completed;
                transaction.ProcessedAt = DateTime.UtcNow;
                transaction.ExternalTransactionId = result.TransactionId;

                payment.Status = refundAmount >= payment.Amount 
                    ? PaymentStatus.Refunded 
                    : PaymentStatus.PartiallyRefunded;
            }
            else
            {
                transaction.Status = TransactionStatus.Failed;
                transaction.Notes = result.ErrorMessage;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Refund processed for payment {PaymentId}, amount: {Amount}", 
                payment.Id, refundAmount);

            return _mapper.Map<PaymentDto>(payment);
        }

        public async Task<PaymentDto> UpdatePaymentStatusAsync(int paymentId, PaymentStatus status, string? reason = null)
        {
            var payment = await _context.Payments
                .Include(p => p.Transactions)
                .FirstOrDefaultAsync(p => p.Id == paymentId);

            if (payment == null)
                throw new ArgumentException("Payment not found");

            payment.Status = status;
            if (!string.IsNullOrEmpty(reason))
                payment.FailureReason = reason;

            await _context.SaveChangesAsync();

            return _mapper.Map<PaymentDto>(payment);
        }

        public async Task<IEnumerable<PaymentDto>> GetPaymentsByStatusAsync(PaymentStatus status)
        {
            var payments = await _context.Payments
                .Include(p => p.Transactions)
                .Where(p => p.Status == status)
                .ToListAsync();

            return _mapper.Map<IEnumerable<PaymentDto>>(payments);
        }

        public async Task<IEnumerable<PaymentDto>> GetPaymentsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            var payments = await _context.Payments
                .Include(p => p.Transactions)
                .Where(p => p.CreatedAt >= startDate && p.CreatedAt <= endDate)
                .ToListAsync();

            return _mapper.Map<IEnumerable<PaymentDto>>(payments);
        }

        private string GenerateTransactionId()
        {
            return $"PAY_{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
        }
    }
}
