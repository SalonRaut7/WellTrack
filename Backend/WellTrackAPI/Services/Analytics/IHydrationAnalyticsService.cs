using WellTrackAPI.DTOs;

namespace WellTrackAPI.Services.Analytics;

public interface IHydrationAnalyticsService
{
    Task<List<ChartPointDTO>> GetHydrationChartAsync(
        string userId,
        string range
    );
}
