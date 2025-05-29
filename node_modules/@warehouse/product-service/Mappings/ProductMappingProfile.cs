using AutoMapper;
using ProductService.DTOs;
using ProductService.Models;

namespace ProductService.Mappings;

public class ProductMappingProfile : Profile
{
    public ProductMappingProfile()
    {
        // Product mappings
        CreateMap<Product, ProductDto>()
            .ForMember(dest => dest.Attributes, opt => opt.MapFrom(src => src.Attributes));

        CreateMap<CreateProductDto, Product>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.Attributes, opt => opt.MapFrom(src => src.Attributes));

        // ProductAttribute mappings
        CreateMap<ProductAttribute, ProductAttributeDto>();
        
        CreateMap<CreateProductAttributeDto, ProductAttribute>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.ProductId, opt => opt.Ignore())
            .ForMember(dest => dest.Product, opt => opt.Ignore());
    }
}
