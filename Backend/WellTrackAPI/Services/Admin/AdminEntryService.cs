using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using WellTrackAPI.Data;
using WellTrackAPI.DTOs;
using WellTrackAPI.ExceptionHandling;

namespace WellTrackAPI.Services.Admin
{
    public class AdminEntryService : IAdminEntryService
    {
        private readonly ApplicationDbContext _db;
        private readonly ILogger<AdminEntryService> _logger;

        public AdminEntryService(
            ApplicationDbContext db,
            ILogger<AdminEntryService> logger)
        {
            _db = db;
            _logger = logger;
        }

        public async Task UpdateMoodAsync(int id, MoodDTO dto)
        {
            var e = await _db.MoodEntries.FindAsync(id)
                ?? throw new NotFoundException("Mood entry not found");

            e.Mood = dto.Mood;
            e.Notes = dto.Notes;
            if (dto.Date.HasValue) e.Date = dto.Date.Value;

            await _db.SaveChangesAsync();
        }

        public async Task UpdateSleepAsync(int id, SleepDTO dto)
        {
            var e = await _db.SleepEntries.FindAsync(id)
                ?? throw new NotFoundException("Sleep entry not found");

            e.BedTime = dto.BedTime;
            e.WakeUpTime = dto.WakeUpTime;
            e.Hours = (dto.WakeUpTime - dto.BedTime).TotalHours;
            e.Quality = dto.Quality;
            if (dto.Date.HasValue) e.Date = dto.Date.Value;

            await _db.SaveChangesAsync();
        }

        public async Task UpdateStepAsync(int id, StepDTO dto)
        {
            var e = await _db.StepEntries.FindAsync(id)
                ?? throw new NotFoundException("Step entry not found");

            e.StepsCount = dto.StepsCount;
            e.ActivityType = dto.ActivityType;
            if (dto.Date.HasValue) e.Date = dto.Date.Value;

            await _db.SaveChangesAsync();
        }

        public async Task UpdateHydrationAsync(int id, HydrationDTO dto)
        {
            var e = await _db.HydrationEntries.FindAsync(id)
                ?? throw new NotFoundException("Hydration entry not found");

            e.WaterIntakeLiters = dto.WaterIntakeLiters;
            if (dto.Date.HasValue) e.Date = dto.Date.Value;

            await _db.SaveChangesAsync();
        }

        public async Task UpdateHabitAsync(int id, HabitDTO dto)
        {
            var e = await _db.HabitEntries.FindAsync(id)
                ?? throw new NotFoundException("Habit entry not found");

            e.Name = dto.Name;
            e.Completed = dto.Completed;
            if (dto.Date.HasValue) e.Date = dto.Date.Value;

            await _db.SaveChangesAsync();
        }

        public async Task UpdateFoodAsync(int id, FoodEntryDTO dto)
        {
            var e = await _db.FoodEntries.FindAsync(id)
                ?? throw new NotFoundException("Food entry not found");

            e.FoodName = dto.FoodName;
            e.Calories = dto.Calories;
            e.Protein = dto.Protein;
            e.Carbs = dto.Carbs;
            e.Fat = dto.Fat;
            e.ServingSize = dto.ServingSize;
            e.MealType = dto.MealType;

            await _db.SaveChangesAsync();
        }

        public async Task DeleteMoodAsync(int id)
        {
            var e = await _db.MoodEntries.FindAsync(id)
                ?? throw new NotFoundException("Mood entry not found");

            _db.MoodEntries.Remove(e);
            await _db.SaveChangesAsync();
        }

        public async Task DeleteSleepAsync(int id)
        {
            var e = await _db.SleepEntries.FindAsync(id)
                ?? throw new NotFoundException("Sleep entry not found");

            _db.SleepEntries.Remove(e);
            await _db.SaveChangesAsync();
        }

        public async Task DeleteStepAsync(int id)
        {
            var e = await _db.StepEntries.FindAsync(id)
                ?? throw new NotFoundException("Step entry not found");

            _db.StepEntries.Remove(e);
            await _db.SaveChangesAsync();
        }

        public async Task DeleteHydrationAsync(int id)
        {
            var e = await _db.HydrationEntries.FindAsync(id)
                ?? throw new NotFoundException("Hydration entry not found");

            _db.HydrationEntries.Remove(e);
            await _db.SaveChangesAsync();
        }

        public async Task DeleteHabitAsync(int id)
        {
            var e = await _db.HabitEntries.FindAsync(id)
                ?? throw new NotFoundException("Habit entry not found");

            _db.HabitEntries.Remove(e);
            await _db.SaveChangesAsync();
        }

        public async Task DeleteFoodAsync(int id)
        {
            var e = await _db.FoodEntries.FindAsync(id)
                ?? throw new NotFoundException("Food entry not found");

            _db.FoodEntries.Remove(e);
            await _db.SaveChangesAsync();
        }
    }
}