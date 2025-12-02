using AutoMapper;
using Microsoft.EntityFrameworkCore;
using WellTrackAPI.Data;
using WellTrackAPI.DTOs;
using WellTrackAPI.Models;

namespace WellTrackAPI.Services
{
    public class HydrationService : IHydrationService
    {
        private readonly ApplicationDbContext _db;
        private readonly IMapper _mapper;
        public HydrationService(ApplicationDbContext db, IMapper mapper) { _db = db; _mapper = mapper; }

        public async Task<IEnumerable<HydrationEntry>> GetAllAsync(string userId) =>
            await _db.HydrationEntries.Where(h => h.UserId == userId).OrderByDescending(h => h.Date).ToListAsync();

        public async Task<HydrationEntry?> GetByIdAsync(int id, string userId) =>
            await _db.HydrationEntries.FirstOrDefaultAsync(h => h.Id == id && h.UserId == userId);

        public async Task<HydrationEntry> CreateAsync(HydrationDTO dto, string userId)
        {
            var entry = _mapper.Map<HydrationEntry>(dto);
            entry.UserId = userId;
            entry.Date = dto.Date ?? DateTime.UtcNow;
            _db.HydrationEntries.Add(entry);
            await _db.SaveChangesAsync();
            return entry;
        }

        public async Task<bool> UpdateAsync(int id, HydrationDTO dto, string userId)
        {
            var entry = await GetByIdAsync(id, userId);
            if (entry == null) return false;
            entry.WaterIntakeLiters = dto.WaterIntakeLiters;
            if (dto.Date.HasValue) entry.Date = dto.Date.Value;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id, string userId)
        {
            var entry = await GetByIdAsync(id, userId);
            if (entry == null) return false;
            _db.HydrationEntries.Remove(entry);
            await _db.SaveChangesAsync();
            return true;
        }
    }
}
