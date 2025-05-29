using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductService.DTOs;
using ProductService.Services;

namespace ProductService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(IProductService productService, ILogger<ProductsController> logger)
    {
        _productService = productService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts()
    {
        try
        {
            var products = await _productService.GetAllProductsAsync();
            return Ok(products);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting products");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetProduct(int id)
    {
        try
        {
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null)
                return NotFound();

            return Ok(product);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting product with ID: {ProductId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("sku/{sku}")]
    public async Task<ActionResult<ProductDto>> GetProductBySku(string sku)
    {
        try
        {
            var product = await _productService.GetProductBySkuAsync(sku);
            if (product == null)
                return NotFound();

            return Ok(product);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting product with SKU: {SKU}", sku);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> SearchProducts([FromQuery] string term)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(term))
                return BadRequest("Search term is required");

            var products = await _productService.SearchProductsAsync(term);
            return Ok(products);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching products with term: {SearchTerm}", term);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("category/{category}")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetProductsByCategory(string category)
    {
        try
        {
            var products = await _productService.GetProductsByCategoryAsync(category);
            return Ok(products);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting products by category: {Category}", category);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost]
    public async Task<ActionResult<ProductDto>> CreateProduct(CreateProductDto createProductDto)
    {
        try
        {
            var product = await _productService.CreateProductAsync(createProductDto);
            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating product");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ProductDto>> UpdateProduct(int id, UpdateProductDto updateProductDto)
    {
        try
        {
            var product = await _productService.UpdateProductAsync(id, updateProductDto);
            if (product == null)
                return NotFound();

            return Ok(product);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating product with ID: {ProductId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        try
        {
            var result = await _productService.DeleteProductAsync(id);
            if (!result)
                return NotFound();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting product with ID: {ProductId}", id);
            return StatusCode(500, "Internal server error");
        }
    }
}
