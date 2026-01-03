using Microsoft.EntityFrameworkCore;
using WellTrackAPI.Data;
using WellTrackAPI.DTOs;

namespace WellTrackAPI.Services;

public class SleepAnalyticsService : ISleepAnalyticsService
{
    private readonly ApplicationDbContext _db;

    public SleepAnalyticsService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<ChartPointDTO>> GetSleepChartAsync(string userId, string range)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        DateOnly startDate = range.ToLower() switch
        {
            "month" => today.AddDays(-29),
            _ => today.AddDays(-6) 
        };

        return await _db.SleepEntries
            .Where(s =>
                s.UserId == userId &&
                DateOnly.FromDateTime(s.Date) >= startDate
            )
            .GroupBy(s => DateOnly.FromDateTime(s.Date))
            .Select(g => new ChartPointDTO
            {
                Date = g.Key,
                // average sleep hours per day
                Value = Math.Round(g.Average(x => x.Hours), 2)
            })
            .OrderBy(x => x.Date)
            .ToListAsync();
    }
}
