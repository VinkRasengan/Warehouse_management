using System.ComponentModel.DataAnnotations;

namespace CustomerService.Models;

public class Customer
{
    public int Id { get; set; }
    
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
    
    public bool IsActive { get; set; } = true;
    
    public int LoyaltyPoints { get; set; } = 0;
    
    [StringLength(20)]
    public string CustomerType { get; set; } = CustomerTypes.REGULAR;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Computed properties
    public string FullName => $"{FirstName} {LastName}";
}

public static class CustomerTypes
{
    public const string REGULAR = "REGULAR";
    public const string PREMIUM = "PREMIUM";
    public const string VIP = "VIP";
}
