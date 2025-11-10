using Microsoft.AspNetCore.Mvc;
using WellTrackAPI.Data;
using WellTrackAPI.Models;
using WellTrackAPI.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace WellTrackAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HabitsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public HabitsController(ApplicationDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var habits = await _context.HabitEntries
                .Select(h => new HabitEntryDto
                {
                    Id = h.Id,
                    HabitName = h.HabitName,
                    Completed = h.Completed
                }).ToListAsync();

            return Ok(habits);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var habit = await _context.HabitEntries.FindAsync(id);
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

            var habit = new HabitEntry
            {
                HabitName = dto.HabitName,
                Completed = false,
                Date = DateTime.Now
            };

            _context.HabitEntries.Add(habit);
            await _context.SaveChangesAsync();

            var result = new HabitEntryDto
            {
                Id = habit.Id,
                HabitName = habit.HabitName,
                Completed = habit.Completed
            };

            return CreatedAtAction(nameof(GetById), new { id = habit.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateHabitEntryDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var habit = await _context.HabitEntries.FindAsync(id);
            if (habit == null) return NotFound();

            habit.HabitName = dto.HabitName;
            habit.Completed = dto.Completed;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var habit = await _context.HabitEntries.FindAsync(id);
            if (habit == null) return NotFound();

            _context.HabitEntries.Remove(habit);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
