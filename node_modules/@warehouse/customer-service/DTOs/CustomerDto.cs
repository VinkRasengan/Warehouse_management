using System.ComponentModel.DataAnnotations;

namespace CustomerService.DTOs;

public class CustomerDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? PostalCode { get; set; }
    public string? Country { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public bool IsActive { get; set; }
    public int LoyaltyPoints { get; set; }
    public string CustomerType { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateCustomerDto
{
    [Required]
    [StringLength(100)]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string LastName { get; set; } = string.Empty;
    
    [Required]
    [EmailAddress]
    [StringLength(200)]
    public string Email { get; set; } = string.Empty;
    
    [StringLength(20)]
    public string? Phone { get; set; }
    
    [StringLength(200)]
    public string? Address { get; set; }
    
    [StringLength(100)]
    public string? City { get; set; }
    
    [StringLength(20)]
    public string? PostalCode { get; set; }
    
    [StringLength(100)]
    public string? Country { get; set; }
    
    public DateTime? DateOfBirth { get; set; }
    
    [StringLength(10)]
    public string? Gender { get; set; }
}

public class UpdateCustomerDto
{
    [StringLength(100)]
    public string? FirstName { get; set; }
    
    [StringLength(100)]
    public string? LastName { get; set; }
    
    [EmailAddress]
    [StringLength(200)]
    public string? Email { get; set; }
    
    [StringLength(20)]
    public string? Phone { get; set; }
    
    [StringLength(200)]
    public string? Address { get; set; }
    
    [StringLength(100)]
    public string? City { get; set; }
    
    [StringLength(20)]
    public string? PostalCode { get; set; }
    
    [StringLength(100)]
    public string? Country { get; set; }
    
    public DateTime? DateOfBirth { get; set; }
    
    [StringLength(10)]
    public string? Gender { get; set; }
    
    public bool? IsActive { get; set; }
    
    [StringLength(20)]
    public string? CustomerType { get; set; }
}

public class CustomerSummaryDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string CustomerType { get; set; } = string.Empty;
    public int LoyaltyPoints { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class LoyaltyPointsDto
{
    [Required]
    public int CustomerId { get; set; }
    
    [Required]
    public int Points { get; set; }
    
    [Required]
    [StringLength(20)]
    public string Action { get; set; } = string.Empty; // ADD, SUBTRACT, SET
    
    [StringLength(200)]
    public string? Reason { get; set; }
}

public class CustomerReportDto
{
    public int TotalCustomers { get; set; }
    public int ActiveCustomers { get; set; }
    public int InactiveCustomers { get; set; }
    public int RegularCustomers { get; set; }
    public int PremiumCustomers { get; set; }
    public int VipCustomers { get; set; }
    public int TotalLoyaltyPoints { get; set; }
    public List<CustomerSummaryDto> TopCustomers { get; set; } = new();
    public List<CustomerSummaryDto> RecentCustomers { get; set; } = new();
}
