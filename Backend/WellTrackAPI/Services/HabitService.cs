using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using WellTrackAPI.Data;
using WellTrackAPI.DTOs;
using WellTrackAPI.ExceptionHandling;
using WellTrackAPI.Models;

namespace WellTrackAPI.Services
{
    public class HabitService : IHabitService
    {
        private readonly ApplicationDbContext _db;
        private readonly IMapper _mapper;
        private readonly ILogger<HabitService> _logger;

        public HabitService(
            ApplicationDbContext db,
            IMapper mapper,
            ILogger<HabitService> logger)
        {
            _db = db;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<HabitEntry>> GetAllAsync(string userId)
        {
            return await _db.HabitEntries
                .Where(h => h.UserId == userId)
                .OrderByDescending(h => h.Date)
                .ToListAsync();
        }

        public async Task<HabitEntry> GetByIdAsync(int id, string userId)
        {
            return await _db.HabitEntries
                .FirstOrDefaultAsync(h => h.Id == id && h.UserId == userId)
                ?? throw new NotFoundException("Habit entry not found");
        }

        public async Task<HabitEntry> CreateAsync(HabitDTO dto, string userId)
        {
            _logger.LogInformation(
                "Creating habit entry for UserId {UserId}",
                userId
            );

            var entry = _mapper.Map<HabitEntry>(dto);
            entry.UserId = userId;
            entry.Date = dto.Date ?? DateTime.UtcNow;

            _db.HabitEntries.Add(entry);
            await _db.SaveChangesAsync();

            _logger.LogInformation(
                "Habit entry created. HabitId {HabitId}, UserId {UserId}",
                entry.Id,
                userId
            );

            return entry;
        }

        public async Task<bool> UpdateAsync(int id, HabitDTO dto, string userId)
        {
            var entry = await GetByIdAsync(id, userId);

            _logger.LogInformation(
                "Updating habit entry {HabitId} for UserId {UserId}",
                id,
                userId
            );

            entry.Name = dto.Name;
            entry.Completed = dto.Completed;

            if (dto.Date.HasValue)
                entry.Date = dto.Date.Value;

            await _db.SaveChangesAsync();

            _logger.LogInformation(
                "Habit entry updated. HabitId {HabitId}, UserId {UserId}",
                id,
                userId
            );

            return true;
        }

        public async Task<bool> DeleteAsync(int id, string userId)
        {
            var entry = await GetByIdAsync(id, userId);

            _logger.LogWarning(
                "Deleting habit entry {HabitId} for UserId {UserId}",
                id,
                userId
            );

            _db.HabitEntries.Remove(entry);
            await _db.SaveChangesAsync();

            _logger.LogInformation(
                "Habit entry deleted. HabitId {HabitId}, UserId {UserId}",
                id,
                userId
            );

            return true;
        }
    }
}
