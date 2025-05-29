using AutoMapper;
using Microsoft.EntityFrameworkCore;
using ProductService.Data;
using ProductService.DTOs;
using ProductService.Models;

namespace ProductService.Services;

public class ProductService : IProductService
{
    private readonly ProductDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<ProductService> _logger;
    private readonly IRabbitMQService _rabbitMQService;

    public ProductService(
        ProductDbContext context, 
        IMapper mapper, 
        ILogger<ProductService> logger,
        IRabbitMQService rabbitMQService)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
        _rabbitMQService = rabbitMQService;
    }

    public async Task<IEnumerable<ProductDto>> GetAllProductsAsync()
    {
        var products = await _context.Products
            .Include(p => p.Attributes)
            .Where(p => p.IsActive)
            .ToListAsync();

        return _mapper.Map<IEnumerable<ProductDto>>(products);
    }

    public async Task<ProductDto?> GetProductByIdAsync(int id)
    {
        var product = await _context.Products
            .Include(p => p.Attributes)
            .FirstOrDefaultAsync(p => p.Id == id && p.IsActive);

        return product != null ? _mapper.Map<ProductDto>(product) : null;
    }

    public async Task<ProductDto?> GetProductBySkuAsync(string sku)
    {
        var product = await _context.Products
            .Include(p => p.Attributes)
            .FirstOrDefaultAsync(p => p.SKU == sku && p.IsActive);

        return product != null ? _mapper.Map<ProductDto>(product) : null;
    }

    public async Task<ProductDto> CreateProductAsync(CreateProductDto createProductDto)
    {
        var product = _mapper.Map<Product>(createProductDto);
        product.CreatedAt = DateTime.UtcNow;
        product.UpdatedAt = DateTime.UtcNow;

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Product created with ID: {ProductId}", product.Id);

        // Publish event
        await _rabbitMQService.PublishAsync("product.created", new { ProductId = product.Id, SKU = product.SKU });

        return _mapper.Map<ProductDto>(product);
    }

    public async Task<ProductDto?> UpdateProductAsync(int id, UpdateProductDto updateProductDto)
    {
        var product = await _context.Products
            .Include(p => p.Attributes)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            return null;

        // Update properties
        if (!string.IsNullOrEmpty(updateProductDto.Name))
            product.Name = updateProductDto.Name;
        
        if (!string.IsNullOrEmpty(updateProductDto.Description))
            product.Description = updateProductDto.Description;
        
        if (updateProductDto.Price.HasValue)
            product.Price = updateProductDto.Price.Value;
        
        if (!string.IsNullOrEmpty(updateProductDto.Category))
            product.Category = updateProductDto.Category;
        
        if (!string.IsNullOrEmpty(updateProductDto.ImageUrl))
            product.ImageUrl = updateProductDto.ImageUrl;
        
        if (updateProductDto.IsActive.HasValue)
            product.IsActive = updateProductDto.IsActive.Value;

        product.UpdatedAt = DateTime.UtcNow;

        // Update attributes if provided
        if (updateProductDto.Attributes != null)
        {
            // Remove existing attributes
            _context.ProductAttributes.RemoveRange(product.Attributes);
            
            // Add new attributes
            foreach (var attrDto in updateProductDto.Attributes)
            {
                product.Attributes.Add(new ProductAttribute
                {
                    Name = attrDto.Name,
                    Value = attrDto.Value,
                    ProductId = product.Id
                });
            }
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Product updated with ID: {ProductId}", product.Id);

        // Publish event
        await _rabbitMQService.PublishAsync("product.updated", new { ProductId = product.Id, SKU = product.SKU });

        return _mapper.Map<ProductDto>(product);
    }

    public async Task<bool> DeleteProductAsync(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
            return false;

        // Soft delete
        product.IsActive = false;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Product soft deleted with ID: {ProductId}", product.Id);

        // Publish event
        await _rabbitMQService.PublishAsync("product.deleted", new { ProductId = product.Id, SKU = product.SKU });

        return true;
    }

    public async Task<IEnumerable<ProductDto>> SearchProductsAsync(string searchTerm)
    {
        var products = await _context.Products
            .Include(p => p.Attributes)
            .Where(p => p.IsActive && 
                       (p.Name.Contains(searchTerm) || 
                        p.Description.Contains(searchTerm) || 
                        p.SKU.Contains(searchTerm)))
            .ToListAsync();

        return _mapper.Map<IEnumerable<ProductDto>>(products);
    }

    public async Task<IEnumerable<ProductDto>> GetProductsByCategoryAsync(string category)
    {
        var products = await _context.Products
            .Include(p => p.Attributes)
            .Where(p => p.IsActive && p.Category == category)
            .ToListAsync();

        return _mapper.Map<IEnumerable<ProductDto>>(products);
    }
}
