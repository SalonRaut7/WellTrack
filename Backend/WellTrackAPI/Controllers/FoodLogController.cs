using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using AutoMapper;
using System.Security.Claims;
using WellTrackAPI.Data;
using WellTrackAPI.DTOs;
using WellTrackAPI.Models;
using WellTrackAPI.Settings;

namespace WellTrackAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FoodLogController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly string _usdaApiKey;
        private readonly IMapper _mapper;

        public FoodLogController(ApplicationDbContext context, IHttpClientFactory httpClientFactory,
                                 IOptions<UsdaSettings> usdaSettings, IMapper mapper)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _usdaApiKey = usdaSettings.Value.ApiKey;
            _mapper = mapper;
        }

        [HttpGet("today")]
        public IActionResult GetToday()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var todayUtc = DateTime.UtcNow.Date;

            var entries = _context.FoodEntries
                .Where(f => f.UserId == userId && f.Date.Date == todayUtc)
                .ToList();

            var totals = new 
            {
                Calories = entries.Sum(f => f.Calories),
                Protein = entries.Sum(f => f.Protein),
                Carbs = entries.Sum(f => f.Carbs),
                Fat = entries.Sum(f => f.Fat)
            };

            var entriesDto = _mapper.Map<List<FoodEntryDTO>>(entries);

            return Ok(new { entries = entriesDto, totals });
        }

        [HttpPost]
        public async Task<IActionResult> AddFood([FromBody] FoodEntryDTO dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var entry = _mapper.Map<FoodEntry>(dto);
            entry.UserId = userId;
            entry.Date = DateTime.UtcNow; 

            _context.FoodEntries.Add(entry);
            await _context.SaveChangesAsync();

            var entryDto = _mapper.Map<FoodEntryDTO>(entry);
            return Ok(entryDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFood(int id, [FromBody] FoodEntryDTO dto)
        {
            var entry = await _context.FoodEntries.FindAsync(id);
            if (entry == null) return NotFound();

            _mapper.Map(dto, entry);

            await _context.SaveChangesAsync();
            return Ok(_mapper.Map<FoodEntryDTO>(entry));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFood(int id)
        {
            var entry = await _context.FoodEntries.FindAsync(id);
            if (entry == null) return NotFound();

            _context.FoodEntries.Remove(entry);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchFood([FromQuery] string query)
        {
            var client = _httpClientFactory.CreateClient();
            var url = $"https://api.nal.usda.gov/fdc/v1/foods/search?api_key={_usdaApiKey}&query={query}&pageSize=10";

            var response = await client.GetAsync(url);
            if (!response.IsSuccessStatusCode)
                return StatusCode(500, "USDA API error");

            var result = await response.Content.ReadAsStringAsync();
            return Content(result, "application/json");
        }
    }
}
