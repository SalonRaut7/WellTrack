using Microsoft.EntityFrameworkCore;
using WellTrackAPI.Data;
using WellTrackAPI.DTOs;

namespace WellTrackAPI.Services;

public class FoodAnalyticsService : IFoodAnalyticsService
{
    private readonly ApplicationDbContext _db;

    public FoodAnalyticsService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<FoodChartDTO> GetFoodChartAsync(string userId, string range)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        DateOnly startDate = range.ToLower() switch
        {
            "month" => today.AddDays(-29),
            _ => today.AddDays(-6)
        };

        var query = _db.FoodEntries
            .Where(f =>
                f.UserId == userId &&
                DateOnly.FromDateTime(f.Date) >= startDate
            );

        var grouped = await query
            .GroupBy(f => DateOnly.FromDateTime(f.Date))
            .Select(g => new
            {
                Date = g.Key,
                Calories = g.Sum(x => x.Calories),
                Protein = g.Sum(x => x.Protein),
                Carbs = g.Sum(x => x.Carbs),
                Fat = g.Sum(x => x.Fat)
            })
            .OrderBy(x => x.Date)
            .ToListAsync();

        return new FoodChartDTO
        {
            Calories = grouped.Select(x => new ChartPointDTO
            {
                Date = x.Date,
                Value = x.Calories
            }).ToList(),

            Protein = grouped.Select(x => new ChartPointDTO
            {
                Date = x.Date,
                Value = x.Protein
            }).ToList(),

            Carbs = grouped.Select(x => new ChartPointDTO
            {
                Date = x.Date,
                Value = x.Carbs
            }).ToList(),

            Fat = grouped.Select(x => new ChartPointDTO
            {
                Date = x.Date,
                Value = x.Fat
            }).ToList()
        };
    }
}
