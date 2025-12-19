using AutoMapper;
using WellTrackAPI.DTOs;
using WellTrackAPI.Models;

namespace WellTrackAPI.Mapping
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<MoodDTO, MoodEntry>();
            CreateMap<SleepDTO, SleepEntry>()
                .ForMember(dest => dest.Hours, opt => opt.Ignore()); // set in service
            CreateMap<HydrationDTO, HydrationEntry>();
            CreateMap<StepDTO, StepEntry>();
            CreateMap<HabitDTO, HabitEntry>();

            CreateMap<ApplicationUser, UserProfileDTO>()
                .ForMember(dest => dest.BMI, opt => opt.Ignore());
            
            CreateMap<UserProfileDTO, ApplicationUser>()
                .ForMember(dest => dest.ProfileImageUrl, opt => opt.Ignore());
            
            CreateMap<FoodEntry, FoodEntryDTO>();
            CreateMap<FoodEntryDTO, FoodEntry>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore()) 
                .ForMember(dest => dest.Date, opt => opt.Ignore());
            
            CreateMap<ApplicationUser, AdminUserDTO>();
        }
    }
}
