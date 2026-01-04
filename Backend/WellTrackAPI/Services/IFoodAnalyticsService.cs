using WellTrackAPI.DTOs;

namespace WellTrackAPI.Services;

public interface IFoodAnalyticsService
{
    Task<FoodChartDTO> GetFoodChartAsync(string userId, string range);
}
