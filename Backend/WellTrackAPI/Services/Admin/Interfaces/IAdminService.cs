using WellTrackAPI.DTOs;

namespace WellTrackAPI.Services
{
    public interface IAdminService
    {
        Task<IEnumerable<AdminUserDTO>> GetUsersAsync();
        Task<AdminUserDTO> GetUserAsync(string id);

        Task AssignRoleAsync(string userId, string role);
        Task RemoveRoleAsync(string userId, string role);
        Task DeleteUserAsync(string userId);

        Task<AdminReportsDTO> GetReportsAsync();

        Task<object> GetUserTrackersAsync(string userId);

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
