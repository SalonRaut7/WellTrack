using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using WellTrackAPI.Data;
using WellTrackAPI.DTOs;
using WellTrackAPI.Models;
using WellTrackAPI.Settings;
using Microsoft.Extensions.Options;
using WellTrackAPI.ExceptionHandling;

namespace WellTrackAPI.Services
{
    public class FoodService : IFoodService
    {
        private readonly ApplicationDbContext _db;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly string _usdaApiKey;
        private readonly IMapper _mapper;
        private readonly ILogger<FoodService> _logger;

        public FoodService(
            ApplicationDbContext db,
            IHttpClientFactory httpClientFactory,
            IOptions<UsdaSettings> usdaSettings,
            IMapper mapper,
            ILogger<FoodService> logger)
        {
            _db = db;
            _httpClientFactory = httpClientFactory;
            _usdaApiKey = usdaSettings.Value.ApiKey;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<object> GetTodayAsync(string userId)
        {
            var todayUtc = DateTime.UtcNow.Date;

            var entries = await _db.FoodEntries
                .Where(f => f.UserId == userId && f.Date.Date == todayUtc)
                .ToListAsync();

            var totals = new
            {
                Calories = entries.Sum(f => f.Calories),
                Protein = entries.Sum(f => f.Protein),
                Carbs = entries.Sum(f => f.Carbs),
                Fat = entries.Sum(f => f.Fat)
            };

            var entriesDto = _mapper.Map<List<FoodEntryDTO>>(entries);

            return new { entries = entriesDto, totals };
        }

        public async Task<FoodEntryDTO> AddFoodAsync(FoodEntryDTO dto, string userId)
        {
            _logger.LogInformation("Adding food entry for UserId {UserId}", userId);

            var entry = _mapper.Map<FoodEntry>(dto);
            entry.UserId = userId;
            entry.Date = DateTime.UtcNow;

            _db.FoodEntries.Add(entry);
            await _db.SaveChangesAsync();

            return _mapper.Map<FoodEntryDTO>(entry);
        }

        public async Task<FoodEntryDTO> UpdateFoodAsync(int id, FoodEntryDTO dto, string userId)
        {
            var entry = await _db.FoodEntries
                .FirstOrDefaultAsync(f => f.Id == id && f.UserId == userId);

            if (entry == null)
                throw new NotFoundException("Food entry not found");

            _mapper.Map(dto, entry);
            await _db.SaveChangesAsync();

            return _mapper.Map<FoodEntryDTO>(entry);
        }

        public async Task<bool> DeleteFoodAsync(int id, string userId)
        {
            var entry = await _db.FoodEntries
                .FirstOrDefaultAsync(f => f.Id == id && f.UserId == userId);

            if (entry == null)
                throw new NotFoundException("Food entry not found");

            _db.FoodEntries.Remove(entry);
            await _db.SaveChangesAsync();

            return true;
        }

        public async Task<string> SearchFoodAsync(string query)
        {
            var client = _httpClientFactory.CreateClient();

            var url =
                $"https://api.nal.usda.gov/fdc/v1/foods/search" +
                $"?api_key={_usdaApiKey}&query={query}&pageSize=10";

            var response = await client.GetAsync(url);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("USDA API error while searching food: {Query}", query);
                throw new Exception("USDA API error");
            }

            return await response.Content.ReadAsStringAsync();
        }
    }
}
