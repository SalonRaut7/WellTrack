using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WellTrackAPI.DTOs;
using WellTrackAPI.Models;
using WellTrackAPI.Services;

namespace WellTrackAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IImageService _imageService;

        public ProfileController(UserManager<ApplicationUser> userManager, IImageService imageService)
        {
            _userManager = userManager;
            _imageService = imageService;
        }

        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            var userId = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound();
            
            double? bmi = null;
            if (user.Weight.HasValue && user.Height.HasValue && user.Height.Value > 0)
            {
                var heightMeters = user.Height.Value / 100.0;
                bmi = Math.Round(user.Weight.Value / (heightMeters * heightMeters), 2);
            }

            return Ok(new
            {
                id = user.Id,
                email = user.Email,
                name = user.Name,
                age = user.Age,
                gender = user.Gender,
                weight = user.Weight,
                height = user.Height,
                bmi,
                goals = user.Goals,
                bio = user.Bio,
                profileImageUrl = user.ProfileImageUrl
            });
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UserProfileDTO dto)
        {
            var userId = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound();

            user.Name = dto.Name ?? user.Name;
            user.Age = dto.Age ?? user.Age;
            user.Gender = dto.Gender ?? user.Gender;
            user.Weight = dto.Weight ?? user.Weight;
            user.Height = dto.Height ?? user.Height;
            user.Goals = dto.Goals ?? user.Goals;
            user.Bio = dto.Bio ?? user.Bio;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
            }

            return Ok(new { message = "Profile updated" });
        }

        [HttpPost("photo")]
        public async Task<IActionResult> UploadPhoto([FromForm] IFormFile file)
        {
            var userId = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();
            if (file == null) return BadRequest(new { message = "No file provided" });

            var uploadUrl = await _imageService.UploadProfileImageAsync(file, userId);
            if (uploadUrl == null) return StatusCode(500, new { message = "Upload failed" });

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound();

            user.ProfileImageUrl = uploadUrl;
            await _userManager.UpdateAsync(user);

            return Ok(new { profileImageUrl = uploadUrl });
        }

        [HttpDelete("photo")]
        public async Task<IActionResult> DeletePhoto()
        {
            var userId = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound();

            user.ProfileImageUrl = null;
            await _userManager.UpdateAsync(user);

            return Ok(new { message = "Profile photo removed" });
        }
        
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO dto)
        {
            var userId = User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound();

            var result = await _userManager.ChangePasswordAsync(user, dto.OldPassword, dto.NewPassword);

            if (!result.Succeeded)
            {
                return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
            }

            return Ok(new { message = "Password changed successfully" });
        }

    } 
}
