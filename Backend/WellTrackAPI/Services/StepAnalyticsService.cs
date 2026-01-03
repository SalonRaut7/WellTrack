using Microsoft.EntityFrameworkCore;
using WellTrackAPI.Data;
using WellTrackAPI.DTOs;

namespace WellTrackAPI.Services;

public class StepAnalyticsService : IStepAnalyticsService
{
    private readonly ApplicationDbContext _db;

    public StepAnalyticsService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<ChartPointDTO>> GetStepsChartAsync(string userId, string range)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        DateOnly startDate = range.ToLower() switch
        {
            "month" => today.AddDays(-29),
            _ => today.AddDays(-6) 
        };

        return await _db.StepEntries
            .Where(s =>
                s.UserId == userId &&
                DateOnly.FromDateTime(s.Date) >= startDate
            )
            .GroupBy(s => DateOnly.FromDateTime(s.Date))
            .Select(g => new ChartPointDTO
            {
                Date = g.Key,
                Value = g.Sum(x => x.StepsCount)
            })
            .OrderBy(x => x.Date)
            .ToListAsync();
    }
}
