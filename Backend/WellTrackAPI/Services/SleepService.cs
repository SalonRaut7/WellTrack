using AutoMapper;
using Microsoft.EntityFrameworkCore;
using WellTrackAPI.Data;
using WellTrackAPI.DTOs;
using WellTrackAPI.Models;

namespace WellTrackAPI.Services
{
    public class SleepService : ISleepService
    {
        private readonly ApplicationDbContext _db;
        private readonly IMapper _mapper;
        public SleepService(ApplicationDbContext db, IMapper mapper) { _db = db; _mapper = mapper; }

        public async Task<IEnumerable<SleepEntry>> GetAllAsync(string userId) =>
            await _db.SleepEntries.Where(s => s.UserId == userId).OrderByDescending(s => s.Date).ToListAsync();

        public async Task<SleepEntry?> GetByIdAsync(int id, string userId) =>
            await _db.SleepEntries.FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

        public async Task<SleepEntry> CreateAsync(SleepDTO dto, string userId)
        {
            var entry = _mapper.Map<SleepEntry>(dto);
            entry.UserId = userId;
            entry.Date = dto.Date ?? DateTime.UtcNow;

            // calculate hours (handle cross-midnight)
            entry.Hours = CalculateHours(dto.BedTime, dto.WakeUpTime);

            _db.SleepEntries.Add(entry);
            await _db.SaveChangesAsync();
            return entry;
        }

        public async Task<bool> UpdateAsync(int id, SleepDTO dto, string userId)
        {
            var entry = await GetByIdAsync(id, userId);
            if (entry == null) return false;

            entry.BedTime = dto.BedTime;
            entry.WakeUpTime = dto.WakeUpTime;
            entry.Quality = dto.Quality;
            entry.Hours = CalculateHours(dto.BedTime, dto.WakeUpTime);
            if (dto.Date.HasValue) entry.Date = dto.Date.Value;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id, string userId)
        {
            var entry = await GetByIdAsync(id, userId);
            if (entry == null) return false;
            _db.SleepEntries.Remove(entry);
            await _db.SaveChangesAsync();
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
