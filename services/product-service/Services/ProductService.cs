using AutoMapper;
using MongoDB.Driver;
using ProductService.Data;
using ProductService.DTOs;
using ProductService.Models;

namespace ProductService.Services;

public class ProductService : IProductService
{
    private readonly IMongoRepository<Product> _repository;
    private readonly IMapper _mapper;
    private readonly ILogger<ProductService> _logger;
    private readonly IRabbitMQService _rabbitMQService;

    public ProductService(
        IMongoRepository<Product> repository,
        IMapper mapper,
        ILogger<ProductService> logger,
        IRabbitMQService rabbitMQService)
    {
        _repository = repository;
        _mapper = mapper;
        _logger = logger;
        _rabbitMQService = rabbitMQService;
    }

    public async Task<IEnumerable<ProductDto>> GetAllProductsAsync()
    {
        var products = await _repository.FindAsync(p => p.IsActive);
        return _mapper.Map<IEnumerable<ProductDto>>(products);
    }

    public async Task<ProductDto?> GetProductByIdAsync(string id)
    {
        var product = await _repository.GetByIdAsync(id);
        if (product == null || !product.IsActive)
            return null;

        return _mapper.Map<ProductDto>(product);
    }

    public async Task<ProductDto?> GetProductBySkuAsync(string sku)
    {
        var products = await _repository.FindAsync(p => p.SKU == sku && p.IsActive);
        var product = products.FirstOrDefault();
        return product != null ? _mapper.Map<ProductDto>(product) : null;
    }

    public async Task<ProductDto> CreateProductAsync(CreateProductDto createProductDto)
    {
        var product = _mapper.Map<Product>(createProductDto);
        product.CreatedAt = DateTime.UtcNow;
        product.UpdatedAt = DateTime.UtcNow;

        await _repository.CreateAsync(product);

        _logger.LogInformation("Product created with ID: {ProductId}", product.Id);

        // Publish event
        await _rabbitMQService.PublishAsync("product.created", new { ProductId = product.Id, SKU = product.SKU });

        return _mapper.Map<ProductDto>(product);
    }

    public async Task<ProductDto?> UpdateProductAsync(string id, UpdateProductDto updateProductDto)
    {
        var product = await _repository.GetByIdAsync(id);

        if (product == null || !product.IsActive)
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
            // Replace existing attributes
            product.Attributes = updateProductDto.Attributes.Select(attr => new ProductAttribute
            {
                Name = attr.Name,
                Value = attr.Value,
                Type = "text"
            }).ToList();
        }

        await _repository.UpdateAsync(id, product);

        _logger.LogInformation("Product updated with ID: {ProductId}", product.Id);

        // Publish event
        await _rabbitMQService.PublishAsync("product.updated", new { ProductId = product.Id, SKU = product.SKU });

        return _mapper.Map<ProductDto>(product);
    }

    public async Task<bool> DeleteProductAsync(string id)
    {
        var product = await _repository.GetByIdAsync(id);
        if (product == null)
            return false;

        // Soft delete
        product.IsActive = false;
        product.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(id, product);

        _logger.LogInformation("Product soft deleted with ID: {ProductId}", product.Id);

        // Publish event
        await _rabbitMQService.PublishAsync("product.deleted", new { ProductId = product.Id, SKU = product.SKU });

        return true;
    }

    public async Task<IEnumerable<ProductDto>> SearchProductsAsync(string searchTerm)
    {
        var products = await _repository.FindAsync(p => p.IsActive &&
                       (p.Name.Contains(searchTerm) ||
                        p.Description.Contains(searchTerm) ||
                        p.SKU.Contains(searchTerm)));

        return _mapper.Map<IEnumerable<ProductDto>>(products);
    }

    public async Task<IEnumerable<ProductDto>> GetProductsByCategoryAsync(string category)
    {
        var products = await _repository.FindAsync(p => p.IsActive && p.Category == category);

        return _mapper.Map<IEnumerable<ProductDto>>(products);
    }
}
