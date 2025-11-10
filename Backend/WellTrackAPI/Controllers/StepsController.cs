using Microsoft.AspNetCore.Mvc;
using WellTrackAPI.Data;
using WellTrackAPI.Models;
using WellTrackAPI.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace WellTrackAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StepsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public StepsController(ApplicationDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var steps = await _context.StepsEntries
                .Select(s => new StepsEntryDto
                {
                    Id = s.Id,
                    Steps = s.Steps,
                    ActivityType = s.ActivityType,
                    Date = s.Date
                }).ToListAsync();

            return Ok(steps);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var entry = await _context.StepsEntries.FindAsync(id);
            if (entry == null) return NotFound();

            return Ok(new StepsEntryDto
            {
                Id = entry.Id,
                Steps = entry.Steps,
                ActivityType = entry.ActivityType,
                Date = entry.Date
            });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateStepsEntryDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var entry = new StepsEntry
            {
                Steps = dto.Steps,
                ActivityType = dto.ActivityType,
                Date = DateTime.Now
            };

            _context.StepsEntries.Add(entry);
            await _context.SaveChangesAsync();

            var result = new StepsEntryDto
            {
                Id = entry.Id,
                Steps = entry.Steps,
                ActivityType = entry.ActivityType,
                Date = entry.Date
            };

            return CreatedAtAction(nameof(GetById), new { id = entry.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateStepsEntryDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var entry = await _context.StepsEntries.FindAsync(id);
            if (entry == null) return NotFound();

            entry.Steps = dto.Steps;
            entry.ActivityType = dto.ActivityType;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entry = await _context.StepsEntries.FindAsync(id);
            if (entry == null) return NotFound();

            _context.StepsEntries.Remove(entry);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
