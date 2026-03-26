using WellTrackAPI.DTOs;
using WellTrackAPI.Models;

namespace WellTrackAPI.Services.Trackers
{
    public interface IMoodService
    {
        Task<IEnumerable<MoodEntry>> GetAllAsync(string userId);
        Task<MoodEntry> GetByIdAsync(int id, string userId);
        Task<MoodEntry> CreateAsync(MoodDTO dto, string userId);
        Task<bool> UpdateAsync(int id, MoodDTO dto, string userId);
        Task<bool> DeleteAsync(int id, string userId);
        Task AddRangeAsync(IEnumerable<MoodDTO> dtos, string userId);
    }
}
