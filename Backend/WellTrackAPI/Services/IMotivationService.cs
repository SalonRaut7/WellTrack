using WellTrackAPI.DTOs;

namespace WellTrackAPI.Services;

public interface IMotivationService
{
    Task<DailyMotivationDTO> GetTodayMotivationAsync();
}
