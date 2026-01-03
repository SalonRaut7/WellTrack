using WellTrackAPI.DTOs;

namespace WellTrackAPI.Services;

public interface IHydrationAnalyticsService
{
    Task<List<ChartPointDTO>> GetHydrationChartAsync(
        string userId,
        string range
    );
}
