using AutoMapper;
using NotificationService.DTOs;
using NotificationService.Models;
using System.Text.Json;

namespace NotificationService.Mappings
{
    public class NotificationMappingProfile : Profile
    {
        public NotificationMappingProfile()
        {
            CreateMap<Notification, NotificationDto>()
                .ForMember(dest => dest.Metadata, opt => opt.MapFrom(src => 
                    string.IsNullOrEmpty(src.Metadata) ? null : JsonSerializer.Deserialize<Dictionary<string, object>>(src.Metadata)));

            CreateMap<NotificationTemplate, NotificationTemplateDto>()
                .ForMember(dest => dest.Variables, opt => opt.MapFrom(src => 
                    string.IsNullOrEmpty(src.Variables) ? null : JsonSerializer.Deserialize<List<string>>(src.Variables)));

            CreateMap<CreateNotificationDto, Notification>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Status, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.SentAt, opt => opt.Ignore())
                .ForMember(dest => dest.DeliveredAt, opt => opt.Ignore())
                .ForMember(dest => dest.ErrorMessage, opt => opt.Ignore())
                .ForMember(dest => dest.RetryCount, opt => opt.Ignore())
                .ForMember(dest => dest.ExternalId, opt => opt.Ignore())
                .ForMember(dest => dest.TemplateData, opt => opt.MapFrom(src => 
                    src.TemplateData != null ? JsonSerializer.Serialize(src.TemplateData) : null))
                .ForMember(dest => dest.Metadata, opt => opt.MapFrom(src => 
                    src.Metadata != null ? JsonSerializer.Serialize(src.Metadata) : null));

            CreateMap<CreateNotificationTemplateDto, NotificationTemplate>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true))
                .ForMember(dest => dest.Variables, opt => opt.MapFrom(src => 
                    src.Variables != null ? JsonSerializer.Serialize(src.Variables) : null));
        }
    }
}
