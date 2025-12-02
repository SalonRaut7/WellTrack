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
        }
    }
}
