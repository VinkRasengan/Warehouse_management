using AutoMapper;
using PaymentService.DTOs;
using PaymentService.Models;

namespace PaymentService.Mappings
{
    public class PaymentMappingProfile : Profile
    {
        public PaymentMappingProfile()
        {
            CreateMap<Payment, PaymentDto>()
                .ForMember(dest => dest.Transactions, opt => opt.MapFrom(src => src.Transactions));

            CreateMap<PaymentTransaction, PaymentTransactionDto>();

            CreateMap<CreatePaymentDto, Payment>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.TransactionId, opt => opt.Ignore())
                .ForMember(dest => dest.Status, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.ProcessedAt, opt => opt.Ignore())
                .ForMember(dest => dest.CompletedAt, opt => opt.Ignore())
                .ForMember(dest => dest.PaymentProviderId, opt => opt.Ignore())
                .ForMember(dest => dest.PaymentProviderTransactionId, opt => opt.Ignore())
                .ForMember(dest => dest.PaymentProviderResponse, opt => opt.Ignore())
                .ForMember(dest => dest.FailureReason, opt => opt.Ignore())
                .ForMember(dest => dest.Transactions, opt => opt.Ignore());
        }
    }
}
