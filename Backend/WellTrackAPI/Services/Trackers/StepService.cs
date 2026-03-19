using Microsoft.Extensions.Logging;
using WellTrackAPI.Application.Services;
using WellTrackAPI.DTOs;
using WellTrackAPI.Models;

namespace WellTrackAPI.Services.Trackers
{
    /// <summary>
    /// Step-specific service that wraps GenericTrackerService.
    /// Maintains step-specific logging messages for backward compatibility.
    /// </summary>
    public class StepService : IStepService
    {
        private readonly IGenericTrackerService<StepDTO, StepEntry> _genericService;
        private readonly ILogger<StepService> _logger;

        public StepService(
            IGenericTrackerService<StepDTO, StepEntry> genericService,
            ILogger<StepService> logger)
        {
            _genericService = genericService;
            _logger = logger;
        }

        public async Task<IEnumerable<StepEntry>> GetAllAsync(string userId)
        {
            return await _genericService.GetAllAsync(userId);
        }

        public async Task<StepEntry> GetByIdAsync(int id, string userId)
        {
            return await _genericService.GetByIdAsync(id, userId);
        }

        public async Task<StepEntry> CreateAsync(StepDTO dto, string userId)
        {
            _logger.LogInformation("Creating step entry for UserId {UserId}", userId);
            var entry = await _genericService.CreateAsync(dto, userId);
            _logger.LogInformation("Step entry created. EntryId {EntryId}, UserId {UserId}", entry.Id, userId);
            return entry;
        }

        public async Task<bool> UpdateAsync(int id, StepDTO dto, string userId)
        {
            _logger.LogInformation("Updating step entry {EntryId} for UserId {UserId}", id, userId);
            var result = await _genericService.UpdateAsync(id, dto, userId);
            _logger.LogInformation("Step entry updated. EntryId {EntryId}, UserId {UserId}", id, userId);
            return result;
        }

        public async Task<bool> DeleteAsync(int id, string userId)
        {
            _logger.LogWarning("Deleting step entry {EntryId} for UserId {UserId}", id, userId);
            var result = await _genericService.DeleteAsync(id, userId);
            _logger.LogInformation("Step entry deleted. EntryId {EntryId}, UserId {UserId}", id, userId);
            return result;
        }
    }
}
