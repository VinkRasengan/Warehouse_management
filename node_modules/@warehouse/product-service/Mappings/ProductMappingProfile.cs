using AutoMapper;
using ProductService.DTOs;
using ProductService.Models;

namespace ProductService.Mappings;

public class ProductMappingProfile : Profile
{
    public ProductMappingProfile()
    {
        // Product mappings
        CreateMap<Product, ProductDto>();

        CreateMap<CreateProductDto, Product>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true));

        // ProductAttribute mappings - simplified for MongoDB embedded documents
        CreateMap<ProductAttribute, ProductAttributeDto>();

        CreateMap<CreateProductAttributeDto, ProductAttribute>()
            .ForMember(dest => dest.Type, opt => opt.MapFrom(src => "text")); // Default type
    }
}
