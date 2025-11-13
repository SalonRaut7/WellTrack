using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WellTrackAPI.Data;
using WellTrackAPI.Models;
using WellTrackAPI.Models.DTOs;

namespace WellTrackAPI.Controllers
{
    [Route("api/[controller]")]
    public class SleepController : BaseApiController
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<SleepController> _logger;

        public SleepController(ApplicationDbContext context, IMapper mapper, ILogger<SleepController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var sleeps = await _context.SleepEntries
                .AsNoTracking()
                .Where(s => s.UserId == UserId)
                .OrderByDescending(s => s.Date)
                .ToListAsync(cancellationToken);

            return Ok(_mapper.Map<IEnumerable<SleepEntryDto>>(sleeps));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var entry = await _context.SleepEntries
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == UserId, cancellationToken);

            if (entry == null) return NotFound();

            return Ok(_mapper.Map<SleepEntryDto>(entry));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSleepEntryDto dto, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var entry = _mapper.Map<SleepEntry>(dto);
            entry.UserId = UserId;

            _context.SleepEntries.Add(entry);
            await _context.SaveChangesAsync(cancellationToken);

            return CreatedAtAction(nameof(GetById), new { id = entry.Id }, _mapper.Map<SleepEntryDto>(entry));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateSleepEntryDto dto, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var entry = await _context.SleepEntries.FirstOrDefaultAsync(s => s.Id == id && s.UserId == UserId, cancellationToken);
            if (entry == null) return NotFound();

            _mapper.Map(dto, entry);

            await _context.SaveChangesAsync(cancellationToken);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            var entry = await _context.SleepEntries.FirstOrDefaultAsync(s => s.Id == id && s.UserId == UserId, cancellationToken);
            if (entry == null) return NotFound();

            _context.SleepEntries.Remove(entry);
            await _context.SaveChangesAsync(cancellationToken);
            return NoContent();
        }
    }
}
