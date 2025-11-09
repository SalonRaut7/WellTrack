// using Microsoft.AspNetCore.Mvc;
// using WellTrackAPI.Data;
// using WellTrackAPI.Models;
// using Microsoft.EntityFrameworkCore;

// namespace WellTrackAPI.Controllers
// {
//     [ApiController]
//     [Route("api/[controller]")]
//     public class MoodController : ControllerBase
//     {
//         private readonly ApplicationDbContext _context;
//         public MoodController(ApplicationDbContext context) => _context = context;

//         [HttpGet]
//         public async Task<IActionResult> GetAll() => Ok(await _context.MoodEntries.ToListAsync());

//         [HttpGet("{id}")]
//         public async Task<IActionResult> GetById(int id)
//         {
//             var mood = await _context.MoodEntries.FindAsync(id);
//             return mood == null ? NotFound() : Ok(mood);
//         }

//         [HttpPost]
//         public async Task<IActionResult> Create(MoodEntry entry)
//         {
//             _context.MoodEntries.Add(entry);
//             await _context.SaveChangesAsync();
//             return CreatedAtAction(nameof(GetById), new { id = entry.Id }, entry);
//         }

//         [HttpPut("{id}")]
//         public async Task<IActionResult> Update(int id, MoodEntry entry)
//         {
//             if (id != entry.Id) return BadRequest();
//             _context.Entry(entry).State = EntityState.Modified;
//             await _context.SaveChangesAsync();
//             return NoContent();
//         }

//         [HttpDelete("{id}")]
//         public async Task<IActionResult> Delete(int id)
//         {
//             var mood = await _context.MoodEntries.FindAsync(id);
//             if (mood == null) return NotFound();
//             _context.MoodEntries.Remove(mood);
//             await _context.SaveChangesAsync();
//             return NoContent();
//         }
//     }
// }

using Microsoft.AspNetCore.Mvc;
using WellTrackAPI.Data;
using WellTrackAPI.Models;
using WellTrackAPI.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace WellTrackAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MoodController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public MoodController(ApplicationDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var moods = await _context.MoodEntries
                .Select(m => new MoodEntryDto
                {
                    Id = m.Id,
                    Mood = m.Mood,
                    Notes = m.Notes,
                    Date = m.Date
                }).ToListAsync();

            return Ok(moods);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var mood = await _context.MoodEntries.FindAsync(id);
            if (mood == null) return NotFound();

            return Ok(new MoodEntryDto
            {
                Id = mood.Id,
                Mood = mood.Mood,
                Notes = mood.Notes,
                Date = mood.Date
            });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateMoodEntryDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var mood = new MoodEntry
            {
                Mood = dto.Mood,
                Notes = dto.Notes ?? string.Empty,
                Date = DateTime.Now
            };

            _context.MoodEntries.Add(mood);
            await _context.SaveChangesAsync();

            var result = new MoodEntryDto
            {
                Id = mood.Id,
                Mood = mood.Mood,
                Notes = mood.Notes,
                Date = mood.Date
            };

            return CreatedAtAction(nameof(GetById), new { id = mood.Id }, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateMoodEntryDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var mood = await _context.MoodEntries.FindAsync(id);
            if (mood == null) return NotFound();

            mood.Mood = dto.Mood;
            mood.Notes = dto.Notes ?? string.Empty;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var mood = await _context.MoodEntries.FindAsync(id);
            if (mood == null) return NotFound();

            _context.MoodEntries.Remove(mood);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}

