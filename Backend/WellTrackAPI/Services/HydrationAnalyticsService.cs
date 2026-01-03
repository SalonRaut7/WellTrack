using Microsoft.EntityFrameworkCore;
using WellTrackAPI.Data;
using WellTrackAPI.DTOs;

namespace WellTrackAPI.Services;

public class HydrationAnalyticsService : IHydrationAnalyticsService
{
    private readonly ApplicationDbContext _db;

    public HydrationAnalyticsService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<List<ChartPointDTO>> GetHydrationChartAsync(string userId, string range)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        DateOnly startDate = range.ToLower() switch
        {
            "month" => today.AddDays(-29),
            _ => today.AddDays(-6) // default = week
        };

        return await _db.HydrationEntries
            .Where(h =>
                h.UserId == userId &&
                DateOnly.FromDateTime(h.Date) >= startDate
            )
            .GroupBy(h => DateOnly.FromDateTime(h.Date))
            .Select(g => new ChartPointDTO
            {
                Date = g.Key,
                Value = Math.Round(g.Sum(x => x.WaterIntakeLiters), 2)
            })
            .OrderBy(x => x.Date)
            .ToListAsync();
    }
}
