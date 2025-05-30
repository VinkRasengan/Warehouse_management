using System.ComponentModel.DataAnnotations;

namespace ProductService.DTOs;

public class ProductDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Category { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<ProductAttributeDto> Attributes { get; set; } = new();
}

public class CreateProductDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;
    
    [Required]
    [StringLength(50)]
    public string SKU { get; set; } = string.Empty;
    
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
    public decimal Price { get; set; }
    
    [Required]
    [StringLength(50)]
    public string Category { get; set; } = string.Empty;
    
    public string? ImageUrl { get; set; }
    
    public List<CreateProductAttributeDto> Attributes { get; set; } = new();
}

public class UpdateProductDto
{
    [StringLength(100)]
    public string? Name { get; set; }
    
    [StringLength(500)]
    public string? Description { get; set; }
    
    [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
    public decimal? Price { get; set; }
    
    [StringLength(50)]
    public string? Category { get; set; }
    
    public string? ImageUrl { get; set; }
    
    public bool? IsActive { get; set; }
    
    public List<CreateProductAttributeDto>? Attributes { get; set; }
}

public class ProductAttributeDto
{
    public string Name { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
}

public class CreateProductAttributeDto
{
    [Required]
    [StringLength(50)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string Value { get; set; } = string.Empty;
}
