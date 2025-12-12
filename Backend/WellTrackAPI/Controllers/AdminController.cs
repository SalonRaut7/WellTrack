// using Microsoft.AspNetCore.Authorization;
// using Microsoft.AspNetCore.Identity;
// using Microsoft.AspNetCore.Mvc;
// using WellTrackAPI.Models;

// namespace WellTrackAPI.Controllers
// {
//     [ApiController]
//     [Route("api/[controller]")]
//     [Authorize(Roles = "Admin")]
//     public class AdminController : ControllerBase
//     {
//         private readonly UserManager<ApplicationUser> _userManager;
//         private readonly RoleManager<IdentityRole> _roleManager;

//         public AdminController(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
//         {
//             _userManager = userManager;
//             _roleManager = roleManager;
//         }

//         [HttpGet("users")]
//         public IActionResult GetUsers()
//         {
//             var users = _userManager.Users.ToList();
//             var result = new List<object>();
//             foreach (var user in users)
//             {
//                 var roles = _userManager.GetRolesAsync(user).Result;
//                 result.Add(new
//                 {
//                     user.Id,
//                     user.Email,
//                     user.Name,
//                     user.UserName,
//                     user.EmailConfirmed,
//                     Roles = roles
//                 });
//             }
//             return Ok(result);
//         }

//         [HttpPost("assign-role")]
//         public async Task<IActionResult> AssignRole([FromQuery] string userId, [FromQuery] string role)
//         {
//             var user = await _userManager.FindByIdAsync(userId);
//             if (user == null) return NotFound();
//             if (!await _roleManager.RoleExistsAsync(role)) await _roleManager.CreateAsync(new IdentityRole(role));
//             await _userManager.AddToRoleAsync(user, role);
//             return Ok();
//         }

//         [HttpPost("remove-role")]
//         public async Task<IActionResult> RemoveRole([FromQuery] string userId, [FromQuery] string role)
//         {
//             var user = await _userManager.FindByIdAsync(userId);
//             if (user == null) return NotFound();
//             await _userManager.RemoveFromRoleAsync(user, role);
//             return Ok();
//         }

//         [HttpDelete("delete-user")]
//         public async Task<IActionResult> DeleteUser([FromQuery] string userId)
//         {
//             var user = await _userManager.FindByIdAsync(userId);
//             if (user == null) return NotFound();
//             await _userManager.DeleteAsync(user);
//             return Ok();
//         }
//     }
// }
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WellTrackAPI.Data;
using WellTrackAPI.DTOs;
using WellTrackAPI.Models;

namespace WellTrackAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ApplicationDbContext _db;

        public AdminController(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            ApplicationDbContext db)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _db = db;
        }

        [HttpGet("users")]
        public IActionResult GetUsers()
        {
            var users = _userManager.Users.ToList();
            var result = new List<object>();

            foreach (var user in users)
            {
                var roles = _userManager.GetRolesAsync(user).Result;
                result.Add(new
                {
                    user.Id,
                    user.Email,
                    user.Name,
                    user.UserName,
                    user.EmailConfirmed,
                    Roles = roles
                });
            }
            return Ok(result);
        }

        [HttpGet("user/{id}")]
        public async Task<IActionResult> GetUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                user.Id,
                user.Email,
                user.Name,
                user.UserName,
                user.EmailConfirmed,
                Roles = roles
            });
        }

        [HttpPost("assign-role")]
        public async Task<IActionResult> AssignRole([FromQuery] string userId, [FromQuery] string role)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound();

            if (!await _roleManager.RoleExistsAsync(role))
                await _roleManager.CreateAsync(new IdentityRole(role));

            await _userManager.AddToRoleAsync(user, role);
            return Ok();
        }

        [HttpPost("remove-role")]
        public async Task<IActionResult> RemoveRole([FromQuery] string userId, [FromQuery] string role)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound();
            await _userManager.RemoveFromRoleAsync(user, role);
            return Ok();
        }

        [HttpDelete("delete-user")]
        public async Task<IActionResult> DeleteUser([FromQuery] string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound(new { message = "User not found" });
            await _userManager.DeleteAsync(user);
            return Ok(new { message = "User deleted successfully" });
        }

        [HttpGet("reports")]
        public async Task<IActionResult> GetReports()
        {
            return Ok(new
            {
                TotalUsers = await _db.Users.CountAsync(),
                TotalMoodEntries = await _db.MoodEntries.CountAsync(),
                TotalSleepRecords = await _db.SleepEntries.CountAsync(),
                TotalStepsRecords = await _db.StepEntries.CountAsync(),
                TotalHydrationRecords = await _db.HydrationEntries.CountAsync(),
                TotalHabitEntries = await _db.HabitEntries.CountAsync()
            });
        }

        [HttpPut("mood/{id}")]
        public async Task<IActionResult> UpdateMood(int id, [FromBody] MoodDTO dto)
        {
            var existing = await _db.MoodEntries.FindAsync(id);
            if (existing == null) return NotFound();
            existing.Mood = dto.Mood;
            existing.Notes = dto.Notes;
            if (dto.Date.HasValue) existing.Date = dto.Date.Value;
            await _db.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpPut("sleep/{id}")]
        public async Task<IActionResult> UpdateSleep(int id, [FromBody] SleepDTO dto)
        {
            var existing = await _db.SleepEntries.FindAsync(id);
            if (existing == null) return NotFound();
            existing.BedTime = dto.BedTime;
            existing.WakeUpTime = dto.WakeUpTime;
            existing.Hours = (dto.WakeUpTime - dto.BedTime).TotalHours;
            existing.Quality = dto.Quality;
            if (dto.Date.HasValue) existing.Date = dto.Date.Value;
            await _db.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpPut("steps/{id}")]
        public async Task<IActionResult> UpdateStep(int id, [FromBody] StepDTO dto)
        {
            var existing = await _db.StepEntries.FindAsync(id);
            if (existing == null) return NotFound();
            existing.StepsCount = dto.StepsCount;
            existing.ActivityType = dto.ActivityType;
            if (dto.Date.HasValue) existing.Date = dto.Date.Value;
            await _db.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpPut("hydration/{id}")]
        public async Task<IActionResult> UpdateHydration(int id, [FromBody] HydrationDTO dto)
        {
            var existing = await _db.HydrationEntries.FindAsync(id);
            if (existing == null) return NotFound();
            existing.WaterIntakeLiters = dto.WaterIntakeLiters;
            if (dto.Date.HasValue) existing.Date = dto.Date.Value;
            await _db.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpPut("habits/{id}")]
        public async Task<IActionResult> UpdateHabit(int id, [FromBody] HabitDTO dto)
        {
            var existing = await _db.HabitEntries.FindAsync(id);
            if (existing == null) return NotFound();
            existing.Name = dto.Name;
            existing.Completed = dto.Completed;
            if (dto.Date.HasValue) existing.Date = dto.Date.Value;
            await _db.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpDelete("mood/{id}")]
        public async Task<IActionResult> DeleteMood(int id)
        {
            var existing = await _db.MoodEntries.FindAsync(id);
            if (existing == null) return NotFound();
            _db.MoodEntries.Remove(existing);
            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("sleep/{id}")]
        public async Task<IActionResult> DeleteSleep(int id)
        {
            var existing = await _db.SleepEntries.FindAsync(id);
            if (existing == null) return NotFound();
            _db.SleepEntries.Remove(existing);
            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("steps/{id}")]
        public async Task<IActionResult> DeleteStep(int id)
        {
            var existing = await _db.StepEntries.FindAsync(id);
            if (existing == null) return NotFound();
            _db.StepEntries.Remove(existing);
            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("hydration/{id}")]
        public async Task<IActionResult> DeleteHydration(int id)
        {
            var existing = await _db.HydrationEntries.FindAsync(id);
            if (existing == null) return NotFound();
            _db.HydrationEntries.Remove(existing);
            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("habits/{id}")]
        public async Task<IActionResult> DeleteHabit(int id)
        {
            var existing = await _db.HabitEntries.FindAsync(id);
            if (existing == null) return NotFound();
            _db.HabitEntries.Remove(existing);
            await _db.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("user/{id}/trackers")]
        public async Task<IActionResult> GetUserTrackers(string id)
        {
            var mood = await _db.MoodEntries.Where(x => x.UserId == id).ToListAsync();
            var sleep = await _db.SleepEntries.Where(x => x.UserId == id).ToListAsync();
            var steps = await _db.StepEntries.Where(x => x.UserId == id).ToListAsync();
            var hydration = await _db.HydrationEntries.Where(x => x.UserId == id).ToListAsync();
            var habits = await _db.HabitEntries.Where(x => x.UserId == id).ToListAsync();

            return Ok(new
            {
                Mood = mood,
                Sleep = sleep,
                Steps = steps,
                Hydration = hydration,
                Habits = habits
            });
        }

    }
}
