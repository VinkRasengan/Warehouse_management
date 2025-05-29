using System.ComponentModel.DataAnnotations;

namespace ProductService.Models;

public class Product
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    [StringLength(50)]
    public string SKU { get; set; } = string.Empty;
    
    [Required]
    public decimal Price { get; set; }
    
    [Required]
    [StringLength(50)]
    public string Category { get; set; } = string.Empty;
    
    public string? ImageUrl { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual ICollection<ProductAttribute> Attributes { get; set; } = new List<ProductAttribute>();
}

public class ProductAttribute
{
    public int Id { get; set; }
    
    public int ProductId { get; set; }
    
    [Required]
    [StringLength(50)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string Value { get; set; } = string.Empty;
    
    // Navigation properties
    public virtual Product Product { get; set; } = null!;
}
