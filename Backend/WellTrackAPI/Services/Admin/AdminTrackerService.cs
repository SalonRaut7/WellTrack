using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using WellTrackAPI.Data;

namespace WellTrackAPI.Services.Admin
{
    public class AdminTrackerService : IAdminTrackerService
    {
        private readonly ApplicationDbContext _db;
        private readonly ILogger<AdminTrackerService> _logger;

        public AdminTrackerService(
            ApplicationDbContext db,
            ILogger<AdminTrackerService> logger)
        {
            _db = db;
            _logger = logger;
        }

        public async Task<object> GetUserTrackersAsync(string userId)
        {
            _logger.LogInformation("Fetching trackers for user {UserId}", userId);

            return new
            {
                Mood = await _db.MoodEntries.Where(x => x.UserId == userId).ToListAsync(),
                Sleep = await _db.SleepEntries.Where(x => x.UserId == userId).ToListAsync(),
                Steps = await _db.StepEntries.Where(x => x.UserId == userId).ToListAsync(),
                Hydration = await _db.HydrationEntries.Where(x => x.UserId == userId).ToListAsync(),
                Habits = await _db.HabitEntries.Where(x => x.UserId == userId).ToListAsync(),
                Food = await _db.FoodEntries.Where(x => x.UserId == userId).ToListAsync()
            };
        }
    }
}