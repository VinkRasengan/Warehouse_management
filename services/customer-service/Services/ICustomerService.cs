using CustomerService.DTOs;

namespace CustomerService.Services
{
    public interface ICustomerService
    {
        Task<CustomerDto> CreateCustomerAsync(CreateCustomerDto createCustomerDto);
        Task<CustomerDto?> GetCustomerByIdAsync(int id);
        Task<CustomerDto?> GetCustomerByEmailAsync(string email);
        Task<IEnumerable<CustomerDto>> GetAllCustomersAsync();
        Task<CustomerDto> UpdateCustomerAsync(int id, UpdateCustomerDto updateCustomerDto);
        Task<bool> DeleteCustomerAsync(int id);
        Task<CustomerDto> AddLoyaltyPointsAsync(int customerId, int points);
        Task<CustomerDto> RedeemLoyaltyPointsAsync(int customerId, int points);
        Task<IEnumerable<CustomerDto>> GetCustomersByLoyaltyTierAsync(string tier);
    }
}
