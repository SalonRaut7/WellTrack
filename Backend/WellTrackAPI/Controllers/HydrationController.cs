using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WellTrackAPI.Data;
using WellTrackAPI.Models;
using WellTrackAPI.Models.DTOs;

namespace WellTrackAPI.Controllers
{
    [Route("api/[controller]")]
    public class HydrationController : BaseApiController
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        private readonly ILogger<HydrationController> _logger;

        public HydrationController(ApplicationDbContext context, IMapper mapper, ILogger<HydrationController> logger)
        {
            _context = context;
            _mapper = mapper;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var entries = await _context.HydrationEntries
                .AsNoTracking()
                .Where(h => h.UserId == UserId)
                .OrderByDescending(h => h.Date)
                .ToListAsync(cancellationToken);

            return Ok(_mapper.Map<IEnumerable<HydrationEntryDto>>(entries));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var entry = await _context.HydrationEntries
                .AsNoTracking()
                .FirstOrDefaultAsync(h => h.Id == id && h.UserId == UserId, cancellationToken);

            if (entry == null) return NotFound();

            return Ok(_mapper.Map<HydrationEntryDto>(entry));
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateHydrationEntryDto dto, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var entry = _mapper.Map<HydrationEntry>(dto);
            entry.UserId = UserId;

            _context.HydrationEntries.Add(entry);
            await _context.SaveChangesAsync(cancellationToken);

            var result = _mapper.Map<HydrationEntryDto>(entry);
            return CreatedAtAction(nameof(GetById), new { id = entry.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateHydrationEntryDto dto, CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var entry = await _context.HydrationEntries.FirstOrDefaultAsync(h => h.Id == id && h.UserId == UserId, cancellationToken);
            if (entry == null) return NotFound();

            _mapper.Map(dto, entry);

            await _context.SaveChangesAsync(cancellationToken);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            var entry = await _context.HydrationEntries.FirstOrDefaultAsync(h => h.Id == id && h.UserId == UserId, cancellationToken);
            if (entry == null) return NotFound();

            _context.HydrationEntries.Remove(entry);
            await _context.SaveChangesAsync(cancellationToken);
            return NoContent();
        }
    }
}
