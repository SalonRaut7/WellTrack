using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WellTrackAPI.Data;
using WellTrackAPI.Models;
using WellTrackAPI.Models.DTOs;

namespace WellTrackAPI.Controllers
{
    [Route("api/[controller]")]
    public class MoodController : BaseApiController
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<MoodController> _logger;

        public MoodController(ApplicationDbContext context, IMapper mapper, ILogger<MoodController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var moods = await _context.MoodEntries
                .AsNoTracking()
                .Where(m => m.UserId == UserId)
                .OrderByDescending(m => m.Date)
                .ToListAsync(cancellationToken);

            var result = _mapper.Map<IEnumerable<MoodEntryDto>>(moods);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var mood = await _context.MoodEntries
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.Id == id && m.UserId == UserId, cancellationToken);

            if (mood == null) return NotFound();

            return Ok(_mapper.Map<MoodEntryDto>(mood));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateMoodEntryDto dto, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var mood = _mapper.Map<MoodEntry>(dto);
            mood.UserId = UserId;

            _context.MoodEntries.Add(mood);
            await _context.SaveChangesAsync(cancellationToken);

            var result = _mapper.Map<MoodEntryDto>(mood);
            return CreatedAtAction(nameof(GetById), new { id = mood.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateMoodEntryDto dto, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var existing = await _context.MoodEntries.FirstOrDefaultAsync(m => m.Id == id && m.UserId == UserId, cancellationToken);
            if (existing == null) return NotFound();

            _mapper.Map(dto, existing);

            await _context.SaveChangesAsync(cancellationToken);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            var existing = await _context.MoodEntries.FirstOrDefaultAsync(m => m.Id == id && m.UserId == UserId, cancellationToken);
            if (existing == null) return NotFound();

            _context.MoodEntries.Remove(existing);
            await _context.SaveChangesAsync(cancellationToken);
            return NoContent();
        }
    }
}
