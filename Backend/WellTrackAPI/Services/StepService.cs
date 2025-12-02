using AutoMapper;
using Microsoft.EntityFrameworkCore;
using WellTrackAPI.Data;
using WellTrackAPI.DTOs;
using WellTrackAPI.Models;

namespace WellTrackAPI.Services
{
    public class StepService : IStepService
    {
        private readonly ApplicationDbContext _db;
        private readonly IMapper _mapper;
        public StepService(ApplicationDbContext db, IMapper mapper) { _db = db; _mapper = mapper; }

        public async Task<IEnumerable<StepEntry>> GetAllAsync(string userId) =>
            await _db.StepEntries.Where(s => s.UserId == userId).OrderByDescending(s => s.Date).ToListAsync();

        public async Task<StepEntry?> GetByIdAsync(int id, string userId) =>
            await _db.StepEntries.FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

        public async Task<StepEntry> CreateAsync(StepDTO dto, string userId)
        {
            var entry = _mapper.Map<StepEntry>(dto);
            entry.UserId = userId;
            entry.Date = dto.Date ?? DateTime.UtcNow;
            _db.StepEntries.Add(entry);
            await _db.SaveChangesAsync();
            return entry;
        }

        public async Task<bool> UpdateAsync(int id, StepDTO dto, string userId)
        {
            var entry = await GetByIdAsync(id, userId);
            if (entry == null) return false;
            entry.StepsCount = dto.StepsCount;
            entry.ActivityType = dto.ActivityType;
            if (dto.Date.HasValue) entry.Date = dto.Date.Value;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id, string userId)
        {
            var entry = await GetByIdAsync(id, userId);
            if (entry == null) return false;
            _db.StepEntries.Remove(entry);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
