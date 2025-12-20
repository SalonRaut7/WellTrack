using AutoMapper;
using Microsoft.EntityFrameworkCore;
using WellTrackAPI.Data;
using WellTrackAPI.DTOs;
using WellTrackAPI.Models;
using Microsoft.Extensions.Logging;
using WellTrackAPI.ExceptionHandling;

namespace WellTrackAPI.Services
{
    public class SleepService : ISleepService
    {
        private readonly ApplicationDbContext _db;
        private readonly IMapper _mapper;
        private readonly ILogger<SleepService> _logger;
        public SleepService(ApplicationDbContext db, IMapper mapper, ILogger<SleepService> logger) { _db = db; _mapper = mapper; _logger = logger; }

        public async Task<IEnumerable<SleepEntry>> GetAllAsync(string userId) =>
            await _db.SleepEntries.Where(s => s.UserId == userId).OrderByDescending(s => s.Date).ToListAsync();

        public async Task<SleepEntry> GetByIdAsync(int id, string userId) =>
            await _db.SleepEntries
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId)
            ?? throw new NotFoundException("Sleep entry not found");
            
        public async Task<SleepEntry> CreateAsync(SleepDTO dto, string userId)
        {
            _logger.LogInformation("Creating sleep entry for UserId {UserId}", userId);
            var entry = _mapper.Map<SleepEntry>(dto);
            entry.UserId = userId;
            entry.Date = dto.Date ?? DateTime.UtcNow;

            // calculate hours (handle cross-midnight)
            entry.Hours = CalculateHours(dto.BedTime, dto.WakeUpTime);

            _db.SleepEntries.Add(entry);
            await _db.SaveChangesAsync();
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

            await _db.SaveChangesAsync();
            _logger.LogInformation("Sleep entry updated. EntryId {EntryId}, UserId {UserId}", id, userId);
            return true;
        }

        public async Task<bool> DeleteAsync(int id, string userId)
        {
            var entry = await GetByIdAsync(id, userId);
            _logger.LogWarning("Deleting sleep entry {EntryId} for UserId {UserId}", id, userId);
            _db.SleepEntries.Remove(entry);
            await _db.SaveChangesAsync();
            _logger.LogInformation("Sleep entry deleted. EntryId {EntryId}, UserId {UserId}", id, userId);
            return true;
        }

        private double CalculateHours(DateTime bed, DateTime wake)
        {
            // If wake <= bed, assume next day
            if (wake <= bed) wake = wake.AddDays(1);
            return Math.Round((wake - bed).TotalHours, 2);
        }
    }
}
