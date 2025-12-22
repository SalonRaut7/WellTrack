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
    public class FoodLogController : ControllerBase
    {
        private readonly IFoodService _foodService;

        public FoodLogController(IFoodService foodService)
        {
            _foodService = foodService;
        }

        private string UserId =>
            User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        [HttpGet("today")]
        public async Task<IActionResult> GetToday()
            => Ok(await _foodService.GetTodayAsync(UserId));

        [HttpPost]
        public async Task<IActionResult> AddFood([FromBody] FoodEntryDTO dto)
            => Ok(await _foodService.AddFoodAsync(dto, UserId));

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFood(int id, [FromBody] FoodEntryDTO dto)
            => Ok(await _foodService.UpdateFoodAsync(id, dto, UserId));

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFood(int id)
            => Ok(await _foodService.DeleteFoodAsync(id, UserId));

        [HttpGet("search")]
        public async Task<IActionResult> SearchFood([FromQuery] string query)
            => Content(await _foodService.SearchFoodAsync(query), "application/json");
    }
}
