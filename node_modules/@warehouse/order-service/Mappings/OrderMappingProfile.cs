using AutoMapper;
using OrderService.DTOs;
using OrderService.Models;

namespace OrderService.Mappings;

public class OrderMappingProfile : Profile
{
    public OrderMappingProfile()
    {
        // Order mappings
        CreateMap<Order, OrderDto>()
            .ForMember(dest => dest.OrderItems, opt => opt.MapFrom(src => src.OrderItems));

        CreateMap<CreateOrderDto, Order>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.OrderNumber, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.Ignore())
            .ForMember(dest => dest.TotalAmount, opt => opt.Ignore())
            .ForMember(dest => dest.SubTotal, opt => opt.Ignore())
            .ForMember(dest => dest.TaxAmount, opt => opt.Ignore())
            .ForMember(dest => dest.OrderDate, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.OrderItems, opt => opt.MapFrom(src => src.OrderItems));

        // OrderItem mappings
        CreateMap<OrderItem, OrderItemDto>();
        
        CreateMap<CreateOrderItemDto, OrderItem>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.OrderId, opt => opt.Ignore())
            .ForMember(dest => dest.SKU, opt => opt.Ignore())
            .ForMember(dest => dest.ProductName, opt => opt.Ignore())
            .ForMember(dest => dest.UnitPrice, opt => opt.Ignore())
            .ForMember(dest => dest.TotalPrice, opt => opt.Ignore())
            .ForMember(dest => dest.Order, opt => opt.Ignore());
    }
}
