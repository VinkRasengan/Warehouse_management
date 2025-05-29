using AutoMapper;
using Microsoft.EntityFrameworkCore;
using CustomerService.Data;
using CustomerService.DTOs;
using CustomerService.Models;

namespace CustomerService.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly CustomerDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<CustomerService> _logger;

        public CustomerService(CustomerDbContext context, IMapper mapper, ILogger<CustomerService> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<CustomerDto> CreateCustomerAsync(CreateCustomerDto createCustomerDto)
        {
            var customer = _mapper.Map<Customer>(createCustomerDto);
            customer.CreatedAt = DateTime.UtcNow;
            customer.LoyaltyPoints = 0;
            customer.LoyaltyTier = "Bronze";

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Customer created with ID: {CustomerId}", customer.Id);

            return _mapper.Map<CustomerDto>(customer);
        }

        public async Task<CustomerDto?> GetCustomerByIdAsync(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            return customer != null ? _mapper.Map<CustomerDto>(customer) : null;
        }

        public async Task<CustomerDto?> GetCustomerByEmailAsync(string email)
        {
            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Email == email);
            return customer != null ? _mapper.Map<CustomerDto>(customer) : null;
        }

        public async Task<IEnumerable<CustomerDto>> GetAllCustomersAsync()
        {
            var customers = await _context.Customers.ToListAsync();
            return _mapper.Map<IEnumerable<CustomerDto>>(customers);
        }

        public async Task<CustomerDto> UpdateCustomerAsync(int id, UpdateCustomerDto updateCustomerDto)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
                throw new ArgumentException("Customer not found");

            _mapper.Map(updateCustomerDto, customer);
            customer.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Customer updated: {CustomerId}", customer.Id);

            return _mapper.Map<CustomerDto>(customer);
        }

        public async Task<bool> DeleteCustomerAsync(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
                return false;

            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Customer deleted: {CustomerId}", id);

            return true;
        }

        public async Task<CustomerDto> AddLoyaltyPointsAsync(int customerId, int points)
        {
            var customer = await _context.Customers.FindAsync(customerId);
            if (customer == null)
                throw new ArgumentException("Customer not found");

            customer.LoyaltyPoints += points;
            customer.UpdatedAt = DateTime.UtcNow;

            // Update loyalty tier based on points
            customer.LoyaltyTier = customer.LoyaltyPoints switch
            {
                >= 10000 => "Platinum",
                >= 5000 => "Gold",
                >= 1000 => "Silver",
                _ => "Bronze"
            };

            await _context.SaveChangesAsync();

            _logger.LogInformation("Added {Points} loyalty points to customer {CustomerId}", points, customerId);

            return _mapper.Map<CustomerDto>(customer);
        }

        public async Task<CustomerDto> RedeemLoyaltyPointsAsync(int customerId, int points)
        {
            var customer = await _context.Customers.FindAsync(customerId);
            if (customer == null)
                throw new ArgumentException("Customer not found");

            if (customer.LoyaltyPoints < points)
                throw new InvalidOperationException("Insufficient loyalty points");

            customer.LoyaltyPoints -= points;
            customer.UpdatedAt = DateTime.UtcNow;

            // Update loyalty tier based on points
            customer.LoyaltyTier = customer.LoyaltyPoints switch
            {
                >= 10000 => "Platinum",
                >= 5000 => "Gold",
                >= 1000 => "Silver",
                _ => "Bronze"
            };

            await _context.SaveChangesAsync();

            _logger.LogInformation("Redeemed {Points} loyalty points from customer {CustomerId}", points, customerId);

            return _mapper.Map<CustomerDto>(customer);
        }

        public async Task<IEnumerable<CustomerDto>> GetCustomersByLoyaltyTierAsync(string tier)
        {
            var customers = await _context.Customers
                .Where(c => c.LoyaltyTier == tier)
                .ToListAsync();

            return _mapper.Map<IEnumerable<CustomerDto>>(customers);
        }
    }
}
