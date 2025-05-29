using AutoMapper;
using InventoryService.DTOs;
using InventoryService.Models;

namespace InventoryService.Mappings;

public class InventoryMappingProfile : Profile
{
    public InventoryMappingProfile()
    {
        // InventoryItem mappings
        CreateMap<InventoryItem, InventoryItemDto>()
            .ForMember(dest => dest.AvailableQuantity, opt => opt.MapFrom(src => src.AvailableQuantity))
            .ForMember(dest => dest.IsLowStock, opt => opt.MapFrom(src => src.IsLowStock))
            .ForMember(dest => dest.IsOverStock, opt => opt.MapFrom(src => src.IsOverStock))
            .ForMember(dest => dest.RecentMovements, opt => opt.MapFrom(src => src.StockMovements));

        CreateMap<CreateInventoryItemDto, InventoryItem>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.ReservedQuantity, opt => opt.MapFrom(src => 0))
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.LastUpdated, opt => opt.Ignore())
            .ForMember(dest => dest.StockMovements, opt => opt.Ignore());

        // StockMovement mappings
        CreateMap<StockMovement, StockMovementDto>();
    }
}
