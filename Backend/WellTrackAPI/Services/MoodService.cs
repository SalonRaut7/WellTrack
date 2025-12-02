using AutoMapper;
using Microsoft.EntityFrameworkCore;
using WellTrackAPI.Data;
using WellTrackAPI.DTOs;
using WellTrackAPI.Models;

namespace WellTrackAPI.Services
{
    public class MoodService : IMoodService
    {
        private readonly ApplicationDbContext _db;
        private readonly IMapper _mapper;
        public MoodService(ApplicationDbContext db, IMapper mapper) { _db = db; _mapper = mapper; }

        public async Task<IEnumerable<MoodEntry>> GetAllAsync(string userId) =>
            await _db.MoodEntries.Where(m => m.UserId == userId).OrderByDescending(m => m.Date).ToListAsync();

        public async Task<MoodEntry?> GetByIdAsync(int id, string userId) =>
            await _db.MoodEntries.FirstOrDefaultAsync(m => m.Id == id && m.UserId == userId);

        public async Task<MoodEntry> CreateAsync(MoodDTO dto, string userId)
        {
            var entry = _mapper.Map<MoodEntry>(dto);
            entry.UserId = userId;
            entry.Date = dto.Date ?? DateTime.UtcNow;
            _db.MoodEntries.Add(entry);
            await _db.SaveChangesAsync();
            return entry;
        }

        public async Task<bool> UpdateAsync(int id, MoodDTO dto, string userId)
        {
            var entry = await GetByIdAsync(id, userId);
            if (entry == null) return false;
            entry.Mood = dto.Mood;
            entry.Notes = dto.Notes;
            if (dto.Date.HasValue) entry.Date = dto.Date.Value;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id, string userId)
        {
            var entry = await GetByIdAsync(id, userId);
            if (entry == null) return false;
            _db.MoodEntries.Remove(entry);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
