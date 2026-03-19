using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.RateLimiting;
using WellTrackAPI.DTOs;
using WellTrackAPI.Services;

namespace WellTrackAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    [EnableRateLimiting("AdminPolicy")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly ILogger<AdminController> _logger;

        public AdminController(
            IAdminService adminService,
            ILogger<AdminController> logger)
        {
            _adminService = adminService;
            _logger = logger;
        }


        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            _logger.LogInformation("Admin fetching all users");
            var users = await _adminService.GetUsersAsync();
            return Ok(users);
        }

        [HttpGet("user/{id}")]
        public async Task<IActionResult> GetUser(string id)
        {
            _logger.LogInformation("Admin fetching user {UserId}", id);
            var user = await _adminService.GetUserAsync(id);
            return Ok(user);
        }

        [HttpPost("assign-role")]
        public async Task<IActionResult> AssignRole(string userId, string role)
        {
            _logger.LogInformation("Assigning role {Role} to user {UserId}", role, userId);
            await _adminService.AssignRoleAsync(userId, role);
            return Ok();
        }

        [HttpPost("remove-role")]
        public async Task<IActionResult> RemoveRole(string userId, string role)
        {
            _logger.LogInformation("Removing role {Role} from user {UserId}", role, userId);
            await _adminService.RemoveRoleAsync(userId, role);
            return Ok();
        }

        [HttpDelete("delete-user")]
        public async Task<IActionResult> DeleteUser(string userId)
        {
            _logger.LogWarning("Deleting user {UserId}", userId);
            await _adminService.DeleteUserAsync(userId);
            return Ok(new { message = "User deleted successfully" });
        }


        [HttpGet("reports")]
        public async Task<IActionResult> GetReports()
        {
            _logger.LogInformation("Admin fetching reports");
            var reports = await _adminService.GetReportsAsync();
            return Ok(reports);
        }


        [HttpPut("mood/{id}")]
        public async Task<IActionResult> UpdateMood(int id, MoodDTO dto)
        {
            await _adminService.UpdateMoodAsync(id, dto);
            return Ok();
        }

        [HttpPut("sleep/{id}")]
        public async Task<IActionResult> UpdateSleep(int id, SleepDTO dto)
        {
            await _adminService.UpdateSleepAsync(id, dto);
            return Ok();
        }

        [HttpPut("steps/{id}")]
        public async Task<IActionResult> UpdateStep(int id, StepDTO dto)
        {
            await _adminService.UpdateStepAsync(id, dto);
            return Ok();
        }

        [HttpPut("hydration/{id}")]
        public async Task<IActionResult> UpdateHydration(int id, HydrationDTO dto)
        {
            await _adminService.UpdateHydrationAsync(id, dto);
            return Ok();
        }

        [HttpPut("habits/{id}")]
        public async Task<IActionResult> UpdateHabit(int id, HabitDTO dto)
        {
            await _adminService.UpdateHabitAsync(id, dto);
            return Ok();
        }

        [HttpPut("food/{id}")]
        public async Task<IActionResult> UpdateFood(int id, FoodEntryDTO dto)
        {
            await _adminService.UpdateFoodAsync(id, dto);
            return Ok();
        }

        [HttpDelete("mood/{id}")]
        public async Task<IActionResult> DeleteMood(int id)
        {
            await _adminService.DeleteMoodAsync(id);
            return Ok();
        }

        [HttpDelete("sleep/{id}")]
        public async Task<IActionResult> DeleteSleep(int id)
        {
            await _adminService.DeleteSleepAsync(id);
            return Ok();
        }

        [HttpDelete("steps/{id}")]
        public async Task<IActionResult> DeleteStep(int id)
        {
            await _adminService.DeleteStepAsync(id);
            return Ok();
        }

        [HttpDelete("hydration/{id}")]
        public async Task<IActionResult> DeleteHydration(int id)
        {
            await _adminService.DeleteHydrationAsync(id);
            return Ok();
        }

        [HttpDelete("habits/{id}")]
        public async Task<IActionResult> DeleteHabit(int id)
        {
            await _adminService.DeleteHabitAsync(id);
            return Ok();
        }

        [HttpDelete("food/{id}")]
        public async Task<IActionResult> DeleteFood(int id)
        {
            await _adminService.DeleteFoodAsync(id);
            return Ok();
        }


        [HttpGet("user/{id}/trackers")]
        public async Task<IActionResult> GetUserTrackers(string id)
        {
            _logger.LogInformation("Fetching trackers for user {UserId}", id);
            var trackers = await _adminService.GetUserTrackersAsync(id);
            return Ok(trackers);
        }
    }
}