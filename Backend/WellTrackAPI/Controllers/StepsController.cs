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
    public class StepsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public StepsController(ApplicationDbContext context) => _context = context;

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
            var steps = await _context.StepsEntries
                .Where(s => s.UserId == userId)
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
            int userId = GetUserId();
            var entry = await _context.StepsEntries.FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);
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
            int userId = GetUserId();
            var entry = new StepsEntry
            {
                Steps = dto.Steps,
                ActivityType = dto.ActivityType,
                Date = DateTime.Now,
                UserId = userId
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
            int userId = GetUserId();
            var entry = await _context.StepsEntries.FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);
            if (entry == null) return NotFound();

            entry.Steps = dto.Steps;
            entry.ActivityType = dto.ActivityType;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            int userId = GetUserId();
            var entry = await _context.StepsEntries.FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);
            if (entry == null) return NotFound();

            _context.StepsEntries.Remove(entry);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
