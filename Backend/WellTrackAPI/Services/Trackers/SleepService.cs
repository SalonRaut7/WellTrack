using AutoMapper;
using Microsoft.Extensions.Logging;
using WellTrackAPI.DTOs;
using WellTrackAPI.ExceptionHandling;
using WellTrackAPI.Infrastructure.Repositories.Interfaces;
using WellTrackAPI.Models;

namespace WellTrackAPI.Services.Trackers
{
    /// <summary>
    /// Sleep-specific service that uses the generic repository.
    /// Maintains sleep-specific logging messages and hours calculation logic.
    /// </summary>
    public class SleepService : ISleepService
    {
        private readonly IGenericRepository<SleepEntry> _repository;
        private readonly IMapper _mapper;
        private readonly ILogger<SleepService> _logger;

        public SleepService(
            IGenericRepository<SleepEntry> repository,
            IMapper mapper,
            ILogger<SleepService> logger)
        {
            _repository = repository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<SleepEntry>> GetAllAsync(string userId)
        {
            return await _repository.GetAllAsync(userId);
        }

        public async Task<SleepEntry> GetByIdAsync(int id, string userId)
        {
            var entry = await _repository.GetByIdAsync(id, userId);
            if (entry == null)
            {
                throw new NotFoundException("Sleep entry not found");
            }
            return entry;
        }

        public async Task<SleepEntry> CreateAsync(SleepDTO dto, string userId)
        {
            _logger.LogInformation("Creating sleep entry for UserId {UserId}", userId);
            var entry = _mapper.Map<SleepEntry>(dto);
            entry.UserId = userId;
            entry.Date = dto.Date ?? DateTime.UtcNow;

            // Calculate hours (handle cross-midnight)
            entry.Hours = CalculateHours(dto.BedTime, dto.WakeUpTime);

            await _repository.CreateAsync(entry);
            _logger.LogInformation("Sleep entry created. EntryId {EntryId}, UserId {UserId}", entry.Id, userId);
            return entry;
        }

        public async Task<bool> UpdateAsync(int id, SleepDTO dto, string userId)
        {
            var entry = await GetByIdAsync(id, userId);

            _logger.LogInformation("Updating sleep entry {EntryId} for UserId {UserId}", id, userId);
            entry.BedTime = dto.BedTime;
            entry.WakeUpTime = dto.WakeUpTime;
            entry.Quality = dto.Quality;
            entry.Hours = CalculateHours(dto.BedTime, dto.WakeUpTime);
            if (dto.Date.HasValue) entry.Date = dto.Date.Value;

            await _repository.UpdateAsync(entry);

            _logger.LogInformation("Sleep entry updated. EntryId {EntryId}, UserId {UserId}", id, userId);
            return true;
        }

        public async Task<bool> DeleteAsync(int id, string userId)
        {
            var entry = await GetByIdAsync(id, userId);
            _logger.LogWarning("Deleting sleep entry {EntryId} for UserId {UserId}", id, userId);
            await _repository.DeleteAsync(entry);
            _logger.LogInformation("Sleep entry deleted. EntryId {EntryId}, UserId {UserId}", id, userId);
            return true;
        }

        /// <summary>
        /// Helper method to calculate sleep hours.
        /// Handles cross-midnight sleep scenarios.
        /// </summary>
        private double CalculateHours(DateTime bed, DateTime wake)
        {
            // If wake <= bed, assume next day
            if (wake <= bed) wake = wake.AddDays(1);
            return Math.Round((wake - bed).TotalHours, 2);
        }
        public async Task AddRangeAsync(IEnumerable<SleepDTO> dtos, string userId)
        {
            foreach (var dto in dtos)
            {
                await CreateAsync(dto, userId);
            }
        }
    }
}
