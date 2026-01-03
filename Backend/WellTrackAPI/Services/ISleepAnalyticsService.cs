using WellTrackAPI.DTOs;

namespace WellTrackAPI.Services;

public interface ISleepAnalyticsService
{
    Task<List<ChartPointDTO>> GetSleepChartAsync(
        string userId,
        string range
    );
}
