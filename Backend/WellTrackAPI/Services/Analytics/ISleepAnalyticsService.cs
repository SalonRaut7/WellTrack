using WellTrackAPI.DTOs;

namespace WellTrackAPI.Services.Analytics;

public interface ISleepAnalyticsService
{
    Task<List<ChartPointDTO>> GetSleepChartAsync(
        string userId,
        string range
    );
}
