using System.Linq.Expressions;
using ProductService.Models;

namespace ProductService.Data;

public class InMemoryProductRepository : IMongoRepository<Product>
{
    private readonly List<Product> _products = new();
    private int _nextId = 3;

    public InMemoryProductRepository()
    {
        // Add some sample data
        _products.AddRange(new[]
        {
            new Product
            {
                Id = "1",
                Name = "Sample Product 1",
                Description = "This is a sample product for testing",
                SKU = "SAMPLE001",
                Price = 99.99m,
                Category = "Electronics",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Attributes = new List<ProductAttribute>
                {
                    new() { Name = "Color", Value = "Blue", Type = "text" },
                    new() { Name = "Size", Value = "Medium", Type = "text" }
                }
            },
            new Product
            {
                Id = "2",
                Name = "Sample Product 2",
                Description = "Another sample product for testing",
                SKU = "SAMPLE002",
                Price = 149.99m,
                Category = "Clothing",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Attributes = new List<ProductAttribute>
                {
                    new() { Name = "Material", Value = "Cotton", Type = "text" },
                    new() { Name = "Brand", Value = "SampleBrand", Type = "text" }
                }
            }
        });
    }

    public Task<IEnumerable<Product>> GetAllAsync()
    {
        return Task.FromResult(_products.AsEnumerable());
    }

    public Task<Product?> GetByIdAsync(string id)
    {
        var product = _products.FirstOrDefault(p => p.Id == id);
        return Task.FromResult(product);
    }

    public Task<IEnumerable<Product>> FindAsync(Expression<Func<Product, bool>> predicate)
    {
        var products = _products.AsQueryable().Where(predicate);
        return Task.FromResult(products.AsEnumerable());
    }

    public Task<Product> CreateAsync(Product entity)
    {
        entity.Id = (_nextId++).ToString();
        entity.CreatedAt = DateTime.UtcNow;
        entity.UpdatedAt = DateTime.UtcNow;
        _products.Add(entity);
        return Task.FromResult(entity);
    }

    public Task<bool> UpdateAsync(string id, Product entity)
    {
        var existingProduct = _products.FirstOrDefault(p => p.Id == id);
        if (existingProduct != null)
        {
            var index = _products.IndexOf(existingProduct);
            entity.Id = id;
            entity.UpdatedAt = DateTime.UtcNow;
            _products[index] = entity;
            return Task.FromResult(true);
        }
        return Task.FromResult(false);
    }

    public Task<bool> DeleteAsync(string id)
    {
        var product = _products.FirstOrDefault(p => p.Id == id);
        if (product != null)
        {
            _products.Remove(product);
            return Task.FromResult(true);
        }
        return Task.FromResult(false);
    }

    public Task<long> CountAsync()
    {
        return Task.FromResult((long)_products.Count);
    }

    public Task<long> CountAsync(Expression<Func<Product, bool>> predicate)
    {
        var count = _products.AsQueryable().Where(predicate).Count();
        return Task.FromResult((long)count);
    }

    public Task<IEnumerable<Product>> GetPagedAsync(int page, int pageSize)
    {
        var products = _products.Skip((page - 1) * pageSize).Take(pageSize);
        return Task.FromResult(products.AsEnumerable());
    }

    public Task<IEnumerable<Product>> GetPagedAsync(Expression<Func<Product, bool>> predicate, int page, int pageSize)
    {
        var products = _products.AsQueryable().Where(predicate).Skip((page - 1) * pageSize).Take(pageSize);
        return Task.FromResult(products.AsEnumerable());
    }
}
