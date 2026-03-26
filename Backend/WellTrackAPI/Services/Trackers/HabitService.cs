using Microsoft.Extensions.Logging;
using WellTrackAPI.Application.Services;
using WellTrackAPI.DTOs;
using WellTrackAPI.Models;

namespace WellTrackAPI.Services.Trackers
{
    /// <summary>
    /// Habit-specific service that wraps GenericTrackerService.
    /// Maintains habit-specific logging messages for backward compatibility.
    /// </summary>
    public class HabitService : IHabitService
    {
        private readonly IGenericTrackerService<HabitDTO, HabitEntry> _genericService;
        private readonly ILogger<HabitService> _logger;

        public HabitService(
            IGenericTrackerService<HabitDTO, HabitEntry> genericService,
            ILogger<HabitService> logger)
        {
            _genericService = genericService;
            _logger = logger;
        }

        public async Task<IEnumerable<HabitEntry>> GetAllAsync(string userId)
        {
            return await _genericService.GetAllAsync(userId);
        }

        public async Task<HabitEntry> GetByIdAsync(int id, string userId)
        {
            return await _genericService.GetByIdAsync(id, userId);
        }

        public async Task<HabitEntry> CreateAsync(HabitDTO dto, string userId)
        {
            _logger.LogInformation(
                "Creating habit entry for UserId {UserId}",
                userId
            );

            var entry = await _genericService.CreateAsync(dto, userId);

            _logger.LogInformation(
                "Habit entry created. HabitId {HabitId}, UserId {UserId}",
                entry.Id,
                userId
            );

            return entry;
        }

        public async Task<bool> UpdateAsync(int id, HabitDTO dto, string userId)
        {
            _logger.LogInformation(
                "Updating habit entry {HabitId} for UserId {UserId}",
                id,
                userId
            );

            var result = await _genericService.UpdateAsync(id, dto, userId);

            _logger.LogInformation(
                "Habit entry updated. HabitId {HabitId}, UserId {UserId}",
                id,
                userId
            );

            return result;
        }

        public async Task<bool> DeleteAsync(int id, string userId)
        {
            _logger.LogWarning(
                "Deleting habit entry {HabitId} for UserId {UserId}",
                id,
                userId
            );

            var result = await _genericService.DeleteAsync(id, userId);

            _logger.LogInformation(
                "Habit entry deleted. HabitId {HabitId}, UserId {UserId}",
                id,
                userId
            );

            return result;
        }
        public async Task AddRangeAsync(IEnumerable<HabitDTO> dtos, string userId)
        {
            foreach (var dto in dtos)
            {
                await CreateAsync(dto, userId);
            }
        }
    }
}
