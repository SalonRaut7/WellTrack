using WellTrackAPI.DTOs;

namespace WellTrackAPI.Services;

public interface IStepAnalyticsService
{
    Task<List<ChartPointDTO>> GetStepsChartAsync(
        string userId,
        string range
    );
}
