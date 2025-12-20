using AutoMapper;
using Microsoft.EntityFrameworkCore;
using WellTrackAPI.Data;
using WellTrackAPI.DTOs;
using WellTrackAPI.Models;
using Microsoft.Extensions.Logging;
using WellTrackAPI.ExceptionHandling;

namespace WellTrackAPI.Services
{
    public class StepService : IStepService
    {
        private readonly ApplicationDbContext _db;
        private readonly IMapper _mapper;
        private readonly ILogger<StepService> _logger;
        public StepService(ApplicationDbContext db, IMapper mapper, ILogger<StepService> logger) { _db = db; _mapper = mapper; _logger = logger; }

        public async Task<IEnumerable<StepEntry>> GetAllAsync(string userId) =>
            await _db.StepEntries.Where(s => s.UserId == userId).OrderByDescending(s => s.Date).ToListAsync();

        public async Task<StepEntry> GetByIdAsync(int id, string userId) =>
            await _db.StepEntries
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId)
            ?? throw new NotFoundException("Step entry not found");

        public async Task<StepEntry> CreateAsync(StepDTO dto, string userId)
        {
            _logger.LogInformation("Creating step entry for UserId {UserId}", userId);
            var entry = _mapper.Map<StepEntry>(dto);
            entry.UserId = userId;
            entry.Date = dto.Date ?? DateTime.UtcNow;
            _db.StepEntries.Add(entry);
            await _db.SaveChangesAsync();
            _logger.LogInformation("Step entry created. EntryId {EntryId}, UserId {UserId}", entry.Id, userId);
            return entry;
        }

        public async Task<bool> UpdateAsync(int id, StepDTO dto, string userId)
        {
            var entry = await GetByIdAsync(id, userId);
            _logger.LogInformation("Updating step entry {EntryId} for UserId {UserId}", id, userId);
            entry.StepsCount = dto.StepsCount;
            entry.ActivityType = dto.ActivityType;
            if (dto.Date.HasValue) entry.Date = dto.Date.Value;
            await _db.SaveChangesAsync();
            _logger.LogInformation("Step entry updated. EntryId {EntryId}, UserId {UserId}", id, userId);
            return true;
        }

        public async Task<bool> DeleteAsync(int id, string userId)
        {
            var entry = await GetByIdAsync(id, userId);
            _logger.LogWarning("Deleting step entry {EntryId} for UserId {UserId}", id, userId);
            _db.StepEntries.Remove(entry);
            await _db.SaveChangesAsync();
            _logger.LogInformation("Step entry deleted. EntryId {EntryId}, UserId {UserId}", id, userId);
            return true;
        }
    }
}
