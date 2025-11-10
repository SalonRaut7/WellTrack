using Microsoft.AspNetCore.Mvc;
using WellTrackAPI.Data;
using WellTrackAPI.Models;
using WellTrackAPI.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace WellTrackAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SleepController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public SleepController(ApplicationDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var sleeps = await _context.SleepEntries
                .Select(s => new SleepEntryDto
                {
                    Id = s.Id,
                    Hours = s.Hours,
                    Quality = s.Quality,
                    Date = s.Date
                }).ToListAsync();

            return Ok(sleeps);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var entry = await _context.SleepEntries.FindAsync(id);
            if (entry == null) return NotFound();

            return Ok(new SleepEntryDto
            {
                Id = entry.Id,
                Hours = entry.Hours,
                Quality = entry.Quality,
                Date = entry.Date
            });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSleepEntryDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var entry = new SleepEntry
            {
                Hours = dto.Hours,
                Quality = dto.Quality,
                Date = DateTime.Now
            };

            _context.SleepEntries.Add(entry);
            await _context.SaveChangesAsync();

            var result = new SleepEntryDto
            {
                Id = entry.Id,
                Hours = entry.Hours,
                Quality = entry.Quality,
                Date = entry.Date
            };

            return CreatedAtAction(nameof(GetById), new { id = entry.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateSleepEntryDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var entry = await _context.SleepEntries.FindAsync(id);
            if (entry == null) return NotFound();

            entry.Hours = dto.Hours;
            entry.Quality = dto.Quality;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entry = await _context.SleepEntries.FindAsync(id);
            if (entry == null) return NotFound();

            _context.SleepEntries.Remove(entry);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
