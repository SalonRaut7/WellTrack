using Microsoft.Extensions.Logging;
using WellTrackAPI.Application.Services;
using WellTrackAPI.DTOs;
using WellTrackAPI.Models;

namespace WellTrackAPI.Services.Trackers
{
    /// <summary>
    /// Hydration-specific service that wraps GenericTrackerService.
    /// Maintains hydration-specific logging messages for backward compatibility.
    /// </summary>
    public class HydrationService : IHydrationService
    {
        private readonly IGenericTrackerService<HydrationDTO, HydrationEntry> _genericService;
        private readonly ILogger<HydrationService> _logger;

        public HydrationService(
            IGenericTrackerService<HydrationDTO, HydrationEntry> genericService,
            ILogger<HydrationService> logger)
        {
            _genericService = genericService;
            _logger = logger;
        }

        public async Task<IEnumerable<HydrationEntry>> GetAllAsync(string userId)
        {
            return await _genericService.GetAllAsync(userId);
        }

        public async Task<HydrationEntry> GetByIdAsync(int id, string userId)
        {
            return await _genericService.GetByIdAsync(id, userId);
        }

        public async Task<HydrationEntry> CreateAsync(HydrationDTO dto, string userId)
        {
            _logger.LogInformation("Creating hydration entry for UserId {UserId}", userId);

            var entry = await _genericService.CreateAsync(dto, userId);

            _logger.LogInformation(
                "Hydration entry created. EntryId {EntryId}, UserId {UserId}",
                entry.Id, userId);

            return entry;
        }

        public async Task<bool> UpdateAsync(int id, HydrationDTO dto, string userId)
        {
            _logger.LogInformation(
                "Updating hydration entry {EntryId} for UserId {UserId}",
                id, userId);

            var result = await _genericService.UpdateAsync(id, dto, userId);

            _logger.LogInformation(
                "Hydration entry updated. EntryId {EntryId}, UserId {UserId}",
                id, userId);

            return result;
        }

        public async Task<bool> DeleteAsync(int id, string userId)
        {
            _logger.LogWarning(
                "Deleting hydration entry {EntryId} for UserId {UserId}",
                id, userId);

            var result = await _genericService.DeleteAsync(id, userId);

            _logger.LogInformation(
                "Hydration entry deleted. EntryId {EntryId}, UserId {UserId}",
                id, userId);

            return result;
        }
    }
}
