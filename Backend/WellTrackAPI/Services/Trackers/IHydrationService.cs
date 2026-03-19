using WellTrackAPI.DTOs;
using WellTrackAPI.Models;

namespace WellTrackAPI.Services.Trackers
{
    public interface IHydrationService
    {
        Task<IEnumerable<HydrationEntry>> GetAllAsync(string userId);
        Task<HydrationEntry> GetByIdAsync(int id, string userId);
        Task<HydrationEntry> CreateAsync(HydrationDTO dto, string userId);
        Task<bool> UpdateAsync(int id, HydrationDTO dto, string userId);
        Task<bool> DeleteAsync(int id, string userId);
    }
}
