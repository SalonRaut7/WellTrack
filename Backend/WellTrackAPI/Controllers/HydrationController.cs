using Microsoft.AspNetCore.Mvc;
using WellTrackAPI.Data;
using WellTrackAPI.Models;
using WellTrackAPI.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace WellTrackAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HydrationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public HydrationController(ApplicationDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var entries = await _context.HydrationEntries
                .Select(h => new HydrationEntryDto
                {
                    Id = h.Id,
                    WaterIntakeLiters = h.WaterIntakeLiters,
                    Date = h.Date
                }).ToListAsync();

            return Ok(entries);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var entry = await _context.HydrationEntries.FindAsync(id);
            if (entry == null) return NotFound();

            return Ok(new HydrationEntryDto
            {
                Id = entry.Id,
                WaterIntakeLiters = entry.WaterIntakeLiters,
                Date = entry.Date
            });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateHydrationEntryDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var entry = new HydrationEntry
            {
                WaterIntakeLiters = dto.WaterIntakeLiters,
                Date = DateTime.Now
            };

            _context.HydrationEntries.Add(entry);
            await _context.SaveChangesAsync();

            var result = new HydrationEntryDto
            {
                Id = entry.Id,
                WaterIntakeLiters = entry.WaterIntakeLiters,
                Date = entry.Date
            };

            return CreatedAtAction(nameof(GetById), new { id = entry.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateHydrationEntryDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var entry = await _context.HydrationEntries.FindAsync(id);
            if (entry == null) return NotFound();

            entry.WaterIntakeLiters = dto.WaterIntakeLiters;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var entry = await _context.HydrationEntries.FindAsync(id);
            if (entry == null) return NotFound();

            _context.HydrationEntries.Remove(entry);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
