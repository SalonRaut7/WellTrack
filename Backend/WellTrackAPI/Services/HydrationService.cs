using AutoMapper;
using Microsoft.EntityFrameworkCore;
using WellTrackAPI.Data;
using WellTrackAPI.DTOs;
using WellTrackAPI.Models;
using Microsoft.Extensions.Logging;
using WellTrackAPI.ExceptionHandling;

namespace WellTrackAPI.Services
{
    public class HydrationService : IHydrationService
    {
        private readonly ApplicationDbContext _db;
        private readonly IMapper _mapper;
        private readonly ILogger<HydrationService> _logger;

        public HydrationService(
            ApplicationDbContext db,
            IMapper mapper,
            ILogger<HydrationService> logger)
        {
            _db = db;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<HydrationEntry>> GetAllAsync(string userId) =>
            await _db.HydrationEntries
                .Where(h => h.UserId == userId)
                .OrderByDescending(h => h.Date)
                .ToListAsync();

        public async Task<HydrationEntry> GetByIdAsync(int id, string userId) =>
            await _db.HydrationEntries
                .FirstOrDefaultAsync(h => h.Id == id && h.UserId == userId)
            ?? throw new NotFoundException("Hydration entry not found");

        public async Task<HydrationEntry> CreateAsync(HydrationDTO dto, string userId)
        {
            _logger.LogInformation("Creating hydration entry for UserId {UserId}", userId);

            var entry = _mapper.Map<HydrationEntry>(dto);
            entry.UserId = userId;
            entry.Date = dto.Date ?? DateTime.UtcNow;

            _db.HydrationEntries.Add(entry);
            await _db.SaveChangesAsync();

            _logger.LogInformation(
                "Hydration entry created. EntryId {EntryId}, UserId {UserId}",
                entry.Id, userId);

            return entry;
        }

        public async Task<bool> UpdateAsync(int id, HydrationDTO dto, string userId)
        {
            var entry = await GetByIdAsync(id, userId);

            _logger.LogInformation(
                "Updating hydration entry {EntryId} for UserId {UserId}",
                id, userId);

            entry.WaterIntakeLiters = dto.WaterIntakeLiters;
            if (dto.Date.HasValue)
                entry.Date = dto.Date.Value;

            await _db.SaveChangesAsync();

            _logger.LogInformation(
                "Hydration entry updated. EntryId {EntryId}, UserId {UserId}",
                id, userId);

            return true;
        }

        public async Task<bool> DeleteAsync(int id, string userId)
        {
            var entry = await GetByIdAsync(id, userId);

            _logger.LogWarning(
                "Deleting hydration entry {EntryId} for UserId {UserId}",
                id, userId);

            _db.HydrationEntries.Remove(entry);
            await _db.SaveChangesAsync();

            _logger.LogInformation(
                "Hydration entry deleted. EntryId {EntryId}, UserId {UserId}",
                id, userId);

            return true;
        }
    }
}
