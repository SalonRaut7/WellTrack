using Microsoft.AspNetCore.Mvc;
using WellTrackAPI.Data;
using WellTrackAPI.Models;
using WellTrackAPI.Models.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace WellTrackAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MoodController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public MoodController(ApplicationDbContext context) => _context = context;
        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                throw new UnauthorizedAccessException("Invalid token: user ID not found.");

            return int.Parse(userIdClaim);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            int userId = GetUserId();
            var moods = await _context.MoodEntries
                .Where(m => m.UserId == userId)
                .Select(m => new MoodEntryDto
                {
                    Id = m.Id,
                    Mood = m.Mood,
                    Notes = m.Notes,
                    Date = m.Date
                }).ToListAsync();

            return Ok(moods);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            int userId = GetUserId();
            var mood = await _context.MoodEntries.FirstOrDefaultAsync(m => m.Id == id && m.UserId == userId);
            if (mood == null) return NotFound();

            return Ok(new MoodEntryDto
            {
                Id = mood.Id,
                Mood = mood.Mood,
                Notes = mood.Notes,
                Date = mood.Date
            });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateMoodEntryDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            int userId = GetUserId();

            var mood = new MoodEntry
            {
                Mood = dto.Mood,
                Notes = dto.Notes ?? string.Empty,
                Date = DateTime.Now,
                UserId = userId
            };

            _context.MoodEntries.Add(mood);
            await _context.SaveChangesAsync();

            var result = new MoodEntryDto
            {
                Id = mood.Id,
                Mood = mood.Mood,
                Notes = mood.Notes,
                Date = mood.Date
            };

            return CreatedAtAction(nameof(GetById), new { id = mood.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateMoodEntryDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            int userId = GetUserId();


            var mood = await _context.MoodEntries.FirstOrDefaultAsync(m => m.Id == id && m.UserId == userId);
            if (mood == null) return NotFound();

            mood.Mood = dto.Mood;
            mood.Notes = dto.Notes ?? string.Empty;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            int userId = GetUserId();

            var mood = await _context.MoodEntries.FirstOrDefaultAsync(m => m.Id == id && m.UserId == userId);
            if (mood == null) return NotFound();

            _context.MoodEntries.Remove(mood);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

