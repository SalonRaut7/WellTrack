using WellTrackAPI.DTOs;
using WellTrackAPI.Models;

namespace WellTrackAPI.Services
{
    public interface IMoodService
    {
        Task<IEnumerable<MoodEntry>> GetAllAsync(string userId);
        Task<MoodEntry?> GetByIdAsync(int id, string userId);
        Task<MoodEntry> CreateAsync(MoodDTO dto, string userId);
        Task<bool> UpdateAsync(int id, MoodDTO dto, string userId);
        Task<bool> DeleteAsync(int id, string userId);
    }
}
