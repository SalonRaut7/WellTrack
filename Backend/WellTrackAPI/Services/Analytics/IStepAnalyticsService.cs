using WellTrackAPI.DTOs;

namespace WellTrackAPI.Services.Analytics;

public interface IStepAnalyticsService
{
    Task<List<ChartPointDTO>> GetStepsChartAsync(
        string userId,
        string range
    );
}
