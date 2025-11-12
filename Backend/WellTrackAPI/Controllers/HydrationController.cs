using Microsoft.AspNetCore.Mvc;
using WellTrackAPI.Data;
using WellTrackAPI.Models;
using WellTrackAPI.Models.DTOs;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace WellTrackAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // applies to all routes in this controller
    public class HydrationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public HydrationController(ApplicationDbContext context) => _context = context;

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
            var entries = await _context.HydrationEntries
                .Where(h => h.UserId == userId)
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
            int userId = GetUserId();
            var entry = await _context.HydrationEntries.FirstOrDefaultAsync(h => h.Id == id && h.UserId == userId);
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
            int userId = GetUserId();
            var entry = new HydrationEntry
            {
                WaterIntakeLiters = dto.WaterIntakeLiters,
                Date = DateTime.Now,
                UserId = userId
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
            int userId = GetUserId();
            var entry = await _context.HydrationEntries.FirstOrDefaultAsync(h => h.Id == id && h.UserId == userId);
            if (entry == null) return NotFound();

            entry.WaterIntakeLiters = dto.WaterIntakeLiters;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            int userId = GetUserId();
            var entry = await _context.HydrationEntries.FirstOrDefaultAsync(h => h.Id == id && h.UserId == userId);
            if (entry == null) return NotFound();

            _context.HydrationEntries.Remove(entry);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
