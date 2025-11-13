using AutoMapper;
using WellTrackAPI.Models;
using WellTrackAPI.Models.DTOs;

namespace WellTrackAPI.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Entities -> DTOs
            CreateMap<MoodEntry, MoodEntryDto>();
            CreateMap<SleepEntry, SleepEntryDto>();
            CreateMap<HydrationEntry, HydrationEntryDto>();
            CreateMap<StepsEntry, StepsEntryDto>();
            CreateMap<HabitEntry, HabitEntryDto>();

            // Create DTOs -> Entities (set Date to UTC now)
            CreateMap<CreateMoodEntryDto, MoodEntry>()
                .ForMember(dest => dest.Date, opt => opt.MapFrom(_ => DateTime.UtcNow));
            CreateMap<CreateSleepEntryDto, SleepEntry>()
                .ForMember(dest => dest.Date, opt => opt.MapFrom(_ => DateTime.UtcNow));
            CreateMap<CreateHydrationEntryDto, HydrationEntry>()
                .ForMember(dest => dest.Date, opt => opt.MapFrom(_ => DateTime.UtcNow));
            CreateMap<CreateStepsEntryDto, StepsEntry>()
                .ForMember(dest => dest.Date, opt => opt.MapFrom(_ => DateTime.UtcNow));
            CreateMap<CreateHabitEntryDto, HabitEntry>()
                .ForMember(dest => dest.Date, opt => opt.MapFrom(_ => DateTime.UtcNow));

            // Update DTOs -> Entities (for mapping updates onto existing entities)
            CreateMap<UpdateMoodEntryDto, MoodEntry>()
                .ForMember(dest => dest.Date, opt => opt.Ignore());
            CreateMap<UpdateSleepEntryDto, SleepEntry>()
                .ForMember(dest => dest.Date, opt => opt.Ignore());
            CreateMap<UpdateHydrationEntryDto, HydrationEntry>()
                .ForMember(dest => dest.Date, opt => opt.Ignore());
            CreateMap<UpdateStepsEntryDto, StepsEntry>()
                .ForMember(dest => dest.Date, opt => opt.Ignore());
            CreateMap<UpdateHabitEntryDto, HabitEntry>()
                .ForMember(dest => dest.Date, opt => opt.Ignore());
        }
    }
}
