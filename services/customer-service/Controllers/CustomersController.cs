using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CustomerService.DTOs;
using CustomerService.Services;

namespace CustomerService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CustomersController : ControllerBase
    {
        private readonly ICustomerService _customerService;
        private readonly ILogger<CustomersController> _logger;

        public CustomersController(ICustomerService customerService, ILogger<CustomersController> logger)
        {
            _customerService = customerService;
            _logger = logger;
        }

        /// <summary>
        /// Get all customers
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CustomerDto>>> GetCustomers()
        {
            try
            {
                var customers = await _customerService.GetAllCustomersAsync();
                return Ok(customers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting customers");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get customer by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<CustomerDto>> GetCustomer(int id)
        {
            try
            {
                var customer = await _customerService.GetCustomerByIdAsync(id);
                if (customer == null)
                    return NotFound($"Customer with ID {id} not found");

                return Ok(customer);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting customer {CustomerId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get customer by email
        /// </summary>
        [HttpGet("email/{email}")]
        public async Task<ActionResult<CustomerDto>> GetCustomerByEmail(string email)
        {
            try
            {
                var customer = await _customerService.GetCustomerByEmailAsync(email);
                if (customer == null)
                    return NotFound($"Customer with email {email} not found");

                return Ok(customer);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting customer by email {Email}", email);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Create a new customer
        /// </summary>
        [HttpPost]
        [AllowAnonymous] // Allow registration without authentication
        public async Task<ActionResult<CustomerDto>> CreateCustomer(CreateCustomerDto createCustomerDto)
        {
            try
            {
                var customer = await _customerService.CreateCustomerAsync(createCustomerDto);
                return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customer);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating customer");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Update customer
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<CustomerDto>> UpdateCustomer(int id, UpdateCustomerDto updateCustomerDto)
        {
            try
            {
                var customer = await _customerService.UpdateCustomerAsync(id, updateCustomerDto);
                return Ok(customer);
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating customer {CustomerId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Delete customer
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            try
            {
                var result = await _customerService.DeleteCustomerAsync(id);
                if (!result)
                    return NotFound($"Customer with ID {id} not found");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting customer {CustomerId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Add loyalty points to customer
        /// </summary>
        [HttpPost("{id}/loyalty/add")]
        public async Task<ActionResult<CustomerDto>> AddLoyaltyPoints(int id, [FromBody] int points)
        {
            try
            {
                var customer = await _customerService.AddLoyaltyPointsAsync(id, points);
                return Ok(customer);
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding loyalty points to customer {CustomerId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Redeem loyalty points from customer
        /// </summary>
        [HttpPost("{id}/loyalty/redeem")]
        public async Task<ActionResult<CustomerDto>> RedeemLoyaltyPoints(int id, [FromBody] int points)
        {
            try
            {
                var customer = await _customerService.RedeemLoyaltyPointsAsync(id, points);
                return Ok(customer);
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error redeeming loyalty points from customer {CustomerId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Get customers by loyalty tier
        /// </summary>
        [HttpGet("loyalty/{tier}")]
        public async Task<ActionResult<IEnumerable<CustomerDto>>> GetCustomersByLoyaltyTier(string tier)
        {
            try
            {
                var customers = await _customerService.GetCustomersByLoyaltyTierAsync(tier);
                return Ok(customers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting customers by loyalty tier {Tier}", tier);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
