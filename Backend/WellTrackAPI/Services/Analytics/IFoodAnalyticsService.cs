using WellTrackAPI.DTOs;

namespace WellTrackAPI.Services.Analytics;

public interface IFoodAnalyticsService
{
    Task<FoodChartDTO> GetFoodChartAsync(string userId, string range);
}
