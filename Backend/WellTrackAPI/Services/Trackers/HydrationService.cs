using Microsoft.Extensions.Logging;
using WellTrackAPI.Application.Services;
using WellTrackAPI.Data;
using WellTrackAPI.DTOs;
using WellTrackAPI.ExceptionHandling;
using WellTrackAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace WellTrackAPI.Services.Trackers
{
    public class HydrationService : IHydrationService
    {
        private readonly IGenericTrackerService<HydrationDTO, HydrationEntry> _genericService;
        private readonly ILogger<HydrationService> _logger;
        private readonly ApplicationDbContext _db;

        public HydrationService(
            IGenericTrackerService<HydrationDTO, HydrationEntry> genericService,
            ILogger<HydrationService> logger,
            ApplicationDbContext db)
        {
            _genericService = genericService;
            _logger = logger;
            _db = db;
        }

        public async Task<IEnumerable<HydrationEntry>> GetAllAsync(string userId)
        {
            return await _genericService.GetAllAsync(userId);
        }

        public async Task<HydrationEntry> GetByIdAsync(int id, string userId)
        {
            return await _genericService.GetByIdAsync(id, userId);
        }

        public async Task<HydrationEntry> CreateAsync(HydrationDTO dto, string userId)
        {
            _logger.LogInformation("Creating hydration entry for UserId {UserId}", userId);

            double waterIntakeLiters = dto.WaterIntakeLiters;
            int waterIntakeMl = (int)Math.Round(waterIntakeLiters * 1000);

            if (waterIntakeMl <= 0)
            {
                throw new ValidationException("Water intake must be greater than 0 ml.");
            }

            var user = await _db.Users.FindAsync(userId);
            if (user == null)
            {
                throw new NotFoundException("User not found");
            }

            int dailyGoalMl = user.DailyWaterGoalMl > 0 ? user.DailyWaterGoalMl : 3000;

            var today = DateTime.UtcNow.Date;
            double todayTotalLiters = await _db.HydrationEntries
                .Where(h => h.UserId == userId && h.Date.Date == today)
                .SumAsync(h => h.WaterIntakeLiters);

            int todayTotalMl = (int)Math.Round(todayTotalLiters * 1000);

            if (todayTotalMl + waterIntakeMl > dailyGoalMl)
            {
                int remainingMl = dailyGoalMl - todayTotalMl;
                throw new ValidationException($"Daily limit exceeded. You can log up to {remainingMl} ml more today.");
            }

            var entry = await _genericService.CreateAsync(dto, userId);

            _logger.LogInformation(
                "Hydration entry created. EntryId {EntryId}, UserId {UserId}",
                entry.Id, userId);

            return entry;
        }

        public async Task<bool> UpdateAsync(int id, HydrationDTO dto, string userId)
        {
            _logger.LogInformation(
                "Updating hydration entry {EntryId} for UserId {UserId}",
                id, userId);

            _ = await GetByIdAsync(id, userId);

            double waterIntakeLiters = dto.WaterIntakeLiters;
            int waterIntakeMl = (int)Math.Round(waterIntakeLiters * 1000);

            if (waterIntakeMl <= 0)
            {
                throw new ValidationException("Water intake must be greater than 0 ml.");
            }

            var user = await _db.Users.FindAsync(userId);
            if (user == null)
            {
                throw new NotFoundException("User not found");
            }

            int dailyGoalMl = user.DailyWaterGoalMl > 0 ? user.DailyWaterGoalMl : 3000;

            var today = DateTime.UtcNow.Date;
            double todayTotalLiters = await _db.HydrationEntries
                .Where(h => h.UserId == userId && h.Date.Date == today && h.Id != id)
                .SumAsync(h => h.WaterIntakeLiters);

            int todayTotalMl = (int)Math.Round(todayTotalLiters * 1000);

            if (todayTotalMl + waterIntakeMl > dailyGoalMl)
            {
                int remainingMl = dailyGoalMl - todayTotalMl;
                throw new ValidationException($"Daily limit exceeded. You can log up to {remainingMl} ml more today.");
            }

            var result = await _genericService.UpdateAsync(id, dto, userId);

            _logger.LogInformation(
                "Hydration entry updated. EntryId {EntryId}, UserId {UserId}",
                id, userId);

            return result;
        }

        public async Task<bool> DeleteAsync(int id, string userId)
        {
            _logger.LogWarning(
                "Deleting hydration entry {EntryId} for UserId {UserId}",
                id, userId);

            var result = await _genericService.DeleteAsync(id, userId);

            _logger.LogInformation(
                "Hydration entry deleted. EntryId {EntryId}, UserId {UserId}",
                id, userId);

            return result;
        }

        public async Task<DailyHydrationSummaryDTO> GetDailySummaryAsync(string userId)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null)
            {
                throw new NotFoundException("User not found");
            }

            var today = DateTime.UtcNow.Date;
            double todayTotalLiters = await _db.HydrationEntries
                .Where(h => h.UserId == userId && h.Date.Date == today)
                .SumAsync(h => h.WaterIntakeLiters);

            int dailyGoalMl = user.DailyWaterGoalMl > 0 ? user.DailyWaterGoalMl : 3000;
            int todayTotalMl = (int)Math.Round(todayTotalLiters * 1000);
            int remainingMl = Math.Max(0, dailyGoalMl - todayTotalMl);

            return new DailyHydrationSummaryDTO
            {
                TodayTotalLiters = todayTotalLiters,
                DailyGoalMl = dailyGoalMl,
                RemainingMl = remainingMl
            };
        }

        public async Task<int> GetDailyGoalAsync(string userId)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null)
            {
                throw new NotFoundException("User not found");
            }

            return user.DailyWaterGoalMl > 0 ? user.DailyWaterGoalMl : 3000;
        }

        public async Task<bool> SetDailyGoalAsync(string userId, int goalMl)
        {
            if (goalMl < 100 || goalMl > 6000)
            {
                throw new ValidationException("Daily goal must be between 100 ml and 6000 ml.");
            }

            var user = await _db.Users.FindAsync(userId);
            if (user == null)
            {
                throw new NotFoundException("User not found");
            }

            user.DailyWaterGoalMl = goalMl;
            await _db.SaveChangesAsync();

            _logger.LogInformation(
                "Daily hydration goal updated for UserId {UserId} to {GoalMl} ml",
                userId, goalMl);

            return true;
        }
        public async Task AddRangeAsync(IEnumerable<HydrationDTO> dtos, string userId)
        {
            foreach (var dto in dtos)
            {
                await CreateAsync(dto, userId);
            }
        }
    }
}
