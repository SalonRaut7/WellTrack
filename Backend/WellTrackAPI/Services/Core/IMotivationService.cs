using WellTrackAPI.DTOs;

namespace WellTrackAPI.Services.Core;

public interface IMotivationService
{
    Task<DailyMotivationDTO> GetTodayMotivationAsync();
}
