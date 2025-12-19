using WellTrackAPI.DTOs;

namespace WellTrackAPI.Services
{
    public interface IFoodService
    {
        Task<object> GetTodayAsync(string userId);
        Task<FoodEntryDTO> AddFoodAsync(FoodEntryDTO dto, string userId);
        Task<FoodEntryDTO> UpdateFoodAsync(int id, FoodEntryDTO dto, string userId);
        Task<bool> DeleteFoodAsync(int id, string userId);
        Task<string> SearchFoodAsync(string query);
    }
}
