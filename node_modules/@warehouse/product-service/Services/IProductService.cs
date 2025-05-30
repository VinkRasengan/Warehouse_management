using ProductService.DTOs;

namespace ProductService.Services;

public interface IProductService
{
    Task<IEnumerable<ProductDto>> GetAllProductsAsync();
    Task<ProductDto?> GetProductByIdAsync(string id);
    Task<ProductDto?> GetProductBySkuAsync(string sku);
    Task<ProductDto> CreateProductAsync(CreateProductDto createProductDto);
    Task<ProductDto?> UpdateProductAsync(string id, UpdateProductDto updateProductDto);
    Task<bool> DeleteProductAsync(string id);
    Task<IEnumerable<ProductDto>> SearchProductsAsync(string searchTerm);
    Task<IEnumerable<ProductDto>> GetProductsByCategoryAsync(string category);
}
