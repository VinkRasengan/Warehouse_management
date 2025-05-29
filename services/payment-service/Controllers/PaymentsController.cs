using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PaymentService.DTOs;
using PaymentService.Models;
using PaymentService.Services;

namespace PaymentService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly ILogger<PaymentsController> _logger;

        public PaymentsController(IPaymentService paymentService, ILogger<PaymentsController> logger)
        {
            _paymentService = paymentService;
            _logger = logger;
        }

        [HttpPost]
        public async Task<ActionResult<PaymentDto>> CreatePayment([FromBody] CreatePaymentDto createPaymentDto)
        {
            try
            {
                var payment = await _paymentService.CreatePaymentAsync(createPaymentDto);
                return CreatedAtAction(nameof(GetPayment), new { id = payment.Id }, payment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating payment");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PaymentDto>> GetPayment(int id)
        {
            var payment = await _paymentService.GetPaymentByIdAsync(id);
            if (payment == null)
                return NotFound();

            return Ok(payment);
        }

        [HttpGet("transaction/{transactionId}")]
        public async Task<ActionResult<PaymentDto>> GetPaymentByTransactionId(string transactionId)
        {
            var payment = await _paymentService.GetPaymentByTransactionIdAsync(transactionId);
            if (payment == null)
                return NotFound();

            return Ok(payment);
        }

        [HttpGet("order/{orderId}")]
        public async Task<ActionResult<IEnumerable<PaymentDto>>> GetPaymentsByOrderId(int orderId)
        {
            var payments = await _paymentService.GetPaymentsByOrderIdAsync(orderId);
            return Ok(payments);
        }

        [HttpPost("{id}/process")]
        public async Task<ActionResult<PaymentDto>> ProcessPayment(int id, [FromBody] ProcessPaymentDto processPaymentDto)
        {
            try
            {
                processPaymentDto.PaymentId = id;
                var payment = await _paymentService.ProcessPaymentAsync(processPaymentDto);
                return Ok(payment);
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
                _logger.LogError(ex, "Error processing payment {PaymentId}", id);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPost("{id}/refund")]
        public async Task<ActionResult<PaymentDto>> RefundPayment(int id, [FromBody] RefundPaymentDto refundPaymentDto)
        {
            try
            {
                refundPaymentDto.PaymentId = id;
                var payment = await _paymentService.RefundPaymentAsync(refundPaymentDto);
                return Ok(payment);
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
                _logger.LogError(ex, "Error refunding payment {PaymentId}", id);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPut("{id}/status")]
        public async Task<ActionResult<PaymentDto>> UpdatePaymentStatus(int id, [FromBody] UpdatePaymentStatusDto updateStatusDto)
        {
            try
            {
                var payment = await _paymentService.UpdatePaymentStatusAsync(id, updateStatusDto.Status, updateStatusDto.Reason);
                return Ok(payment);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating payment status {PaymentId}", id);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpGet("status/{status}")]
        public async Task<ActionResult<IEnumerable<PaymentDto>>> GetPaymentsByStatus(PaymentStatus status)
        {
            var payments = await _paymentService.GetPaymentsByStatusAsync(status);
            return Ok(payments);
        }

        [HttpGet("date-range")]
        public async Task<ActionResult<IEnumerable<PaymentDto>>> GetPaymentsByDateRange(
            [FromQuery] DateTime startDate, 
            [FromQuery] DateTime endDate)
        {
            var payments = await _paymentService.GetPaymentsByDateRangeAsync(startDate, endDate);
            return Ok(payments);
        }
    }

    public class UpdatePaymentStatusDto
    {
        public PaymentStatus Status { get; set; }
        public string? Reason { get; set; }
    }
}
