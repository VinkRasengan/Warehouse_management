using AutoMapper;
using CustomerService.DTOs;
using CustomerService.Models;

namespace CustomerService.Mappings
{
    public class CustomerMappingProfile : Profile
    {
        public CustomerMappingProfile()
        {
            CreateMap<Customer, CustomerDto>();
            CreateMap<CreateCustomerDto, Customer>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.LoyaltyPoints, opt => opt.Ignore())
                .ForMember(dest => dest.LoyaltyTier, opt => opt.Ignore());
            
            CreateMap<UpdateCustomerDto, Customer>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.LoyaltyPoints, opt => opt.Ignore())
                .ForMember(dest => dest.LoyaltyTier, opt => opt.Ignore());
        }
    }
}
