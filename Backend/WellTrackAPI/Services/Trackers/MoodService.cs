using Microsoft.Extensions.Logging;
using WellTrackAPI.Application.Services;
using WellTrackAPI.DTOs;
using WellTrackAPI.Models;

namespace WellTrackAPI.Services.Trackers
{
    /// <summary>
    /// Mood-specific service that wraps GenericTrackerService.
    /// Maintains mood-specific logging messages for backward compatibility.
    /// </summary>
    public class MoodService : IMoodService
    {
        private readonly IGenericTrackerService<MoodDTO, MoodEntry> _genericService;
        private readonly ILogger<MoodService> _logger;

        public MoodService(
            IGenericTrackerService<MoodDTO, MoodEntry> genericService,
            ILogger<MoodService> logger)
        {
            _genericService = genericService;
            _logger = logger;
        }

        public async Task<IEnumerable<MoodEntry>> GetAllAsync(string userId)
        {
            return await _genericService.GetAllAsync(userId);
        }

        public async Task<MoodEntry> GetByIdAsync(int id, string userId)
        {
            return await _genericService.GetByIdAsync(id, userId);
        }

        public async Task<MoodEntry> CreateAsync(MoodDTO dto, string userId)
        {
            _logger.LogInformation("Creating mood entry for UserId {UserId}", userId);
            var entry = await _genericService.CreateAsync(dto, userId);
            _logger.LogInformation("Mood entry created. EntryId {EntryId}, UserId {UserId}", entry.Id, userId);
            return entry;
        }

        public async Task<bool> UpdateAsync(int id, MoodDTO dto, string userId)
        {
            _logger.LogInformation("Updating mood entry {EntryId} for UserId {UserId}", id, userId);
            var result = await _genericService.UpdateAsync(id, dto, userId);
            _logger.LogInformation("Mood entry updated. EntryId {EntryId}, UserId {UserId}", id, userId);
            return result;
        }

        public async Task<bool> DeleteAsync(int id, string userId)
        {
            _logger.LogWarning("Deleting mood entry {EntryId} for UserId {UserId}", id, userId);
            var result = await _genericService.DeleteAsync(id, userId);
            _logger.LogInformation("Mood entry deleted. EntryId {EntryId}, UserId {UserId}", id, userId);
            return result;
        }
        public async Task AddRangeAsync(IEnumerable<MoodDTO> dtos, string userId)
        {
            foreach (var dto in dtos)
            {
                await CreateAsync(dto, userId);
            }
        }
    }
}
