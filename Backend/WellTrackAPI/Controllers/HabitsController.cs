using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WellTrackAPI.Data;
using WellTrackAPI.Models;
using WellTrackAPI.Models.DTOs;

namespace WellTrackAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // applies to all routes in this controller
    public class HabitsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public HabitsController(ApplicationDbContext context) => _context = context;

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

            var habits = await _context.HabitEntries
                .Where(h => h.UserId == userId)
                .Select(h => new HabitEntryDto
                {
                    Id = h.Id,
                    HabitName = h.HabitName,
                    Completed = h.Completed
                })
                .ToListAsync();

            return Ok(habits);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            int userId = GetUserId();

            var habit = await _context.HabitEntries.FirstOrDefaultAsync(h => h.Id == id && h.UserId == userId);
            if (habit == null) return NotFound();

            return Ok(new HabitEntryDto
            {
                Id = habit.Id,
                HabitName = habit.HabitName,
                Completed = habit.Completed
            });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateHabitEntryDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            int userId = GetUserId();

            var habit = new HabitEntry
            {
                HabitName = dto.HabitName,
                Completed = false,
                Date = DateTime.Now,
                UserId = userId
            };

            _context.HabitEntries.Add(habit);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = habit.Id }, new HabitEntryDto
            {
                Id = habit.Id,
                HabitName = habit.HabitName,
                Completed = habit.Completed
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateHabitEntryDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            int userId = GetUserId();

            var habit = await _context.HabitEntries.FirstOrDefaultAsync(h => h.Id == id && h.UserId == userId);
            if (habit == null) return NotFound();

            habit.HabitName = dto.HabitName;
            habit.Completed = dto.Completed;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            int userId = GetUserId();

            var habit = await _context.HabitEntries.FirstOrDefaultAsync(h => h.Id == id && h.UserId == userId);
            if (habit == null) return NotFound();

            _context.HabitEntries.Remove(habit);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
