using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WellTrackAPI.DTOs;
using WellTrackAPI.Services;
using Microsoft.AspNetCore.RateLimiting;

namespace WellTrackAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [EnableRateLimiting("UserPolicy")]
    public class HabitController : ControllerBase
    {
        private readonly IHabitService _service;
        public HabitController(IHabitService service) => _service = service;
        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        [HttpGet] public async Task<IActionResult> GetAll() => Ok(await _service.GetAllAsync(UserId));
        [HttpGet("{id}")] public async Task<IActionResult> Get(int id) => Ok(await _service.GetByIdAsync(id, UserId));
        [HttpPost] public async Task<IActionResult> Create(HabitDTO dto) => Ok(await _service.CreateAsync(dto, UserId));
        [HttpPut("{id}")] public async Task<IActionResult> Update(int id, HabitDTO dto) => Ok(await _service.UpdateAsync(id, dto, UserId));
        [HttpDelete("{id}")] public async Task<IActionResult> Delete(int id) => Ok(await _service.DeleteAsync(id, UserId));
    }
}
