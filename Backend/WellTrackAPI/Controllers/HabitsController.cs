using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WellTrackAPI.Data;
using WellTrackAPI.Models;
using WellTrackAPI.Models.DTOs;

namespace WellTrackAPI.Controllers
{
    [Route("api/[controller]")]
    public class HabitsController : BaseApiController
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<HabitsController> _logger;

        public HabitsController(ApplicationDbContext context, IMapper mapper, ILogger<HabitsController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var habits = await _context.HabitEntries
                .AsNoTracking()
                .Where(h => h.UserId == UserId)
                .OrderByDescending(h => h.Date)
                .ToListAsync(cancellationToken);

            return Ok(_mapper.Map<IEnumerable<HabitEntryDto>>(habits));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var habit = await _context.HabitEntries
                .AsNoTracking()
                .FirstOrDefaultAsync(h => h.Id == id && h.UserId == UserId, cancellationToken);

            if (habit == null) return NotFound();

            return Ok(_mapper.Map<HabitEntryDto>(habit));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateHabitEntryDto dto, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var habit = _mapper.Map<HabitEntry>(dto);
            habit.UserId = UserId;

            _context.HabitEntries.Add(habit);
            await _context.SaveChangesAsync(cancellationToken);

            return CreatedAtAction(nameof(GetById), new { id = habit.Id }, _mapper.Map<HabitEntryDto>(habit));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateHabitEntryDto dto, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var habit = await _context.HabitEntries.FirstOrDefaultAsync(h => h.Id == id && h.UserId == UserId, cancellationToken);
            if (habit == null) return NotFound();

            _mapper.Map(dto, habit);

            await _context.SaveChangesAsync(cancellationToken);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            var habit = await _context.HabitEntries.FirstOrDefaultAsync(h => h.Id == id && h.UserId == UserId, cancellationToken);
            if (habit == null) return NotFound();

            _context.HabitEntries.Remove(habit);
            await _context.SaveChangesAsync(cancellationToken);
            return NoContent();
        }
    }
}
