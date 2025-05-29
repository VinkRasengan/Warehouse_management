using ProductService.DTOs;

namespace ProductService.Services;

public interface IProductService
{
    Task<IEnumerable<ProductDto>> GetAllProductsAsync();
    Task<ProductDto?> GetProductByIdAsync(int id);
    Task<ProductDto?> GetProductBySkuAsync(string sku);
    Task<ProductDto> CreateProductAsync(CreateProductDto createProductDto);
    Task<ProductDto?> UpdateProductAsync(int id, UpdateProductDto updateProductDto);
    Task<bool> DeleteProductAsync(int id);
    Task<IEnumerable<ProductDto>> SearchProductsAsync(string searchTerm);
    Task<IEnumerable<ProductDto>> GetProductsByCategoryAsync(string category);
}
