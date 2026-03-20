using AutoMapper;
using WellTrackAPI.DTOs;
using WellTrackAPI.Models;

namespace WellTrackAPI.Mapping
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            // Tracker entities (bidirectional where applicable)
            CreateMap<MoodDTO, MoodEntry>()
                .ForMember(dest => dest.Date, opt => opt.Ignore());
            CreateMap<MoodEntry, MoodDTO>();
            
            CreateMap<SleepDTO, SleepEntry>()
                .ForMember(dest => dest.Hours, opt => opt.Ignore()) // set in service or by logic
                .ForMember(dest => dest.Date, opt => opt.Ignore());
            CreateMap<SleepEntry, SleepDTO>();
            
            CreateMap<HydrationDTO, HydrationEntry>()
                .ForMember(dest => dest.Date, opt => opt.Ignore());
            CreateMap<HydrationEntry, HydrationDTO>();
            
            CreateMap<StepDTO, StepEntry>()
                .ForMember(dest => dest.Date, opt => opt.Ignore());
            CreateMap<StepEntry, StepDTO>();
            
            CreateMap<HabitDTO, HabitEntry>()
                .ForMember(dest => dest.Date, opt => opt.Ignore());
            CreateMap<HabitEntry, HabitDTO>();
            
            // Motivation
            CreateMap<DailyMotivation, DailyMotivationDTO>();

            // Profile
            CreateMap<ApplicationUser, UserProfileDTO>()
                .ForMember(dest => dest.BMI, opt => opt.Ignore());
            
            CreateMap<UserProfileDTO, ApplicationUser>()
                .ForMember(dest => dest.ProfileImageUrl, opt => opt.Ignore());
            
            // Hydration DTOs
            CreateMap<UpdateDailyHydrationGoalDTO, ApplicationUser>()
                .ForMember(dest => dest.DailyWaterGoalMl, opt => opt.MapFrom(src => src.DailyGoalMl))
                .ForAllOtherMembers(opt => opt.Ignore());
            
            // Food
            CreateMap<FoodEntry, FoodEntryDTO>();
            CreateMap<FoodEntryDTO, FoodEntry>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore()) 
                .ForMember(dest => dest.Date, opt => opt.Ignore());
            
            // Admin
            CreateMap<ApplicationUser, AdminUserDTO>();
        }
    }
}
