using AutoMapper;
using Microsoft.EntityFrameworkCore;
using WellTrackAPI.Data;
using WellTrackAPI.DTOs;
using WellTrackAPI.Models;

namespace WellTrackAPI.Services
{
    public class HabitService : IHabitService
    {
        private readonly ApplicationDbContext _db;
        private readonly IMapper _mapper;
        public HabitService(ApplicationDbContext db, IMapper mapper) { _db = db; _mapper = mapper; }

        public async Task<IEnumerable<HabitEntry>> GetAllAsync(string userId) =>
            await _db.HabitEntries.Where(h => h.UserId == userId).OrderByDescending(h => h.Date).ToListAsync();

        public async Task<HabitEntry?> GetByIdAsync(int id, string userId) =>
            await _db.HabitEntries.FirstOrDefaultAsync(h => h.Id == id && h.UserId == userId);

        public async Task<HabitEntry> CreateAsync(HabitDTO dto, string userId)
        {
            var entry = _mapper.Map<HabitEntry>(dto);
            entry.UserId = userId;
            entry.Date = dto.Date ?? DateTime.UtcNow;
            _db.HabitEntries.Add(entry);
            await _db.SaveChangesAsync();
            return entry;
        }

        public async Task<bool> UpdateAsync(int id, HabitDTO dto, string userId)
        {
            var entry = await GetByIdAsync(id, userId);
            if (entry == null) return false;
            entry.Name = dto.Name;
            entry.Completed = dto.Completed;
            if (dto.Date.HasValue) entry.Date = dto.Date.Value;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id, string userId)
        {
            var entry = await GetByIdAsync(id, userId);
            if (entry == null) return false;
            _db.HabitEntries.Remove(entry);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
