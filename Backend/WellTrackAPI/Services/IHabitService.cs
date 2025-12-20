using WellTrackAPI.DTOs;
using WellTrackAPI.Models;

namespace WellTrackAPI.Services
{
    public interface IHabitService
    {
        Task<IEnumerable<HabitEntry>> GetAllAsync(string userId);
        Task<HabitEntry> GetByIdAsync(int id, string userId);
        Task<HabitEntry> CreateAsync(HabitDTO dto, string userId);
        Task<bool> UpdateAsync(int id, HabitDTO dto, string userId);
        Task<bool> DeleteAsync(int id, string userId);
    }
}
