using WellTrackAPI.DTOs;
using WellTrackAPI.Models;

namespace WellTrackAPI.Services
{
    public interface ISleepService
    {
        Task<IEnumerable<SleepEntry>> GetAllAsync(string userId);
        Task<SleepEntry> GetByIdAsync(int id, string userId);
        Task<SleepEntry> CreateAsync(SleepDTO dto, string userId);
        Task<bool> UpdateAsync(int id, SleepDTO dto, string userId);
        Task<bool> DeleteAsync(int id, string userId);
    }
}
