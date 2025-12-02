using WellTrackAPI.DTOs;
using WellTrackAPI.Models;

namespace WellTrackAPI.Services
{
    public interface IStepService
    {
        Task<IEnumerable<StepEntry>> GetAllAsync(string userId);
        Task<StepEntry?> GetByIdAsync(int id, string userId);
        Task<StepEntry> CreateAsync(StepDTO dto, string userId);
        Task<bool> UpdateAsync(int id, StepDTO dto, string userId);
        Task<bool> DeleteAsync(int id, string userId);
    }
}
