using AutoMapper;
using Microsoft.EntityFrameworkCore;
using WellTrackAPI.Data;
using WellTrackAPI.DTOs;
using WellTrackAPI.Models;
using WellTrackAPI.ExceptionHandling;
using Microsoft.Extensions.Logging;

namespace WellTrackAPI.Services
{
    public class MoodService : IMoodService
    {
        private readonly ApplicationDbContext _db;
        private readonly IMapper _mapper;
        private readonly ILogger<MoodService> _logger;
        public MoodService(ApplicationDbContext db, IMapper mapper, ILogger<MoodService> logger) { _db = db; _mapper = mapper; _logger = logger; }

        public async Task<IEnumerable<MoodEntry>> GetAllAsync(string userId) =>
            await _db.MoodEntries.Where(m => m.UserId == userId).OrderByDescending(m => m.Date).ToListAsync();

        public async Task<MoodEntry> GetByIdAsync(int id, string userId) =>
            await _db.MoodEntries
                .FirstOrDefaultAsync(m => m.Id == id && m.UserId == userId)
            ?? throw new NotFoundException("Mood entry not found");

        public async Task<MoodEntry> CreateAsync(MoodDTO dto, string userId)
        {
            _logger.LogInformation("Creating mood entry for UserId {UserId}", userId);
            var entry = _mapper.Map<MoodEntry>(dto);
            entry.UserId = userId;
            entry.Date = dto.Date ?? DateTime.UtcNow;
            _db.MoodEntries.Add(entry);
            await _db.SaveChangesAsync();
            _logger.LogInformation("Mood entry created. EntryId {EntryId}, UserId {UserId}", entry.Id, userId);
            return entry;
        }

        public async Task<bool> UpdateAsync(int id, MoodDTO dto, string userId)
        {
            var entry = await GetByIdAsync(id, userId);
            _logger.LogInformation("Updating mood entry {EntryId} for UserId {UserId}", id, userId);
            entry.Mood = dto.Mood;
            entry.Notes = dto.Notes;
            if (dto.Date.HasValue) entry.Date = dto.Date.Value;
            await _db.SaveChangesAsync();
            _logger.LogInformation("Mood entry updated. EntryId {EntryId}, UserId {UserId}", id, userId);
            return true;
        }

        public async Task<bool> DeleteAsync(int id, string userId)
        {
            var entry = await GetByIdAsync(id, userId);
            _logger.LogWarning("Deleting mood entry {EntryId} for UserId {UserId}", id, userId);
            _db.MoodEntries.Remove(entry);
            await _db.SaveChangesAsync();
            _logger.LogInformation("Mood entry deleted. EntryId {EntryId}, UserId {UserId}", id, userId);
            return true;
        }
    }
}
