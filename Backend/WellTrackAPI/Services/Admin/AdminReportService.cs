using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using WellTrackAPI.Data;
using WellTrackAPI.DTOs;

namespace WellTrackAPI.Services.Admin
{
    public class AdminReportService : IAdminReportService
    {
        private readonly ApplicationDbContext _db;
        private readonly ILogger<AdminReportService> _logger;

        public AdminReportService(
            ApplicationDbContext db,
            ILogger<AdminReportService> logger)
        {
            _db = db;
            _logger = logger;
        }

        public async Task<AdminReportsDTO> GetReportsAsync()
        {
            _logger.LogInformation("Generating admin reports");

            return new AdminReportsDTO
            {
                TotalUsers = await _db.Users.CountAsync(),
                TotalMoodEntries = await _db.MoodEntries.CountAsync(),
                TotalSleepRecords = await _db.SleepEntries.CountAsync(),
                TotalStepsRecords = await _db.StepEntries.CountAsync(),
                TotalHydrationRecords = await _db.HydrationEntries.CountAsync(),
                TotalHabitEntries = await _db.HabitEntries.CountAsync(),
                TotalFoodEntries = await _db.FoodEntries.CountAsync()
            };
        }
    }
}