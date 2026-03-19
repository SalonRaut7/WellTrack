using WellTrackAPI.DTOs;

namespace WellTrackAPI.Services.Admin
{
    public interface IAdminEntryService
    {
        Task UpdateMoodAsync(int id, MoodDTO dto);
        Task UpdateSleepAsync(int id, SleepDTO dto);
        Task UpdateStepAsync(int id, StepDTO dto);
        Task UpdateHydrationAsync(int id, HydrationDTO dto);
        Task UpdateHabitAsync(int id, HabitDTO dto);
        Task UpdateFoodAsync(int id, FoodEntryDTO dto);

        Task DeleteMoodAsync(int id);
        Task DeleteSleepAsync(int id);
        Task DeleteStepAsync(int id);
        Task DeleteHydrationAsync(int id);
        Task DeleteHabitAsync(int id);
        Task DeleteFoodAsync(int id);
    }
}