using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WellTrackAPI.Data;
using WellTrackAPI.Models;
using WellTrackAPI.Models.DTOs;

namespace WellTrackAPI.Controllers
{
    [Route("api/[controller]")]
    public class StepsController : BaseApiController
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<StepsController> _logger;

        public StepsController(ApplicationDbContext context, IMapper mapper, ILogger<StepsController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var steps = await _context.StepsEntries
                .AsNoTracking()
                .Where(s => s.UserId == UserId)
                .OrderByDescending(s => s.Date)
                .ToListAsync(cancellationToken);

            return Ok(_mapper.Map<IEnumerable<StepsEntryDto>>(steps));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var entry = await _context.StepsEntries
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == UserId, cancellationToken);

            if (entry == null) return NotFound();

            return Ok(_mapper.Map<StepsEntryDto>(entry));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateStepsEntryDto dto, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var entry = _mapper.Map<StepsEntry>(dto);
            entry.UserId = UserId;

            _context.StepsEntries.Add(entry);
            await _context.SaveChangesAsync(cancellationToken);

            return CreatedAtAction(nameof(GetById), new { id = entry.Id }, _mapper.Map<StepsEntryDto>(entry));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateStepsEntryDto dto, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var entry = await _context.StepsEntries.FirstOrDefaultAsync(s => s.Id == id && s.UserId == UserId, cancellationToken);
            if (entry == null) return NotFound();

            _mapper.Map(dto, entry);

            await _context.SaveChangesAsync(cancellationToken);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            var entry = await _context.StepsEntries.FirstOrDefaultAsync(s => s.Id == id && s.UserId == UserId, cancellationToken);
            if (entry == null) return NotFound();

            _context.StepsEntries.Remove(entry);
            await _context.SaveChangesAsync(cancellationToken);
            return NoContent();
        }
    }
}
