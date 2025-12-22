using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WellTrackAPI.DTOs;
using WellTrackAPI.Services;

namespace WellTrackAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly IProfileService _profileService;

        public ProfileController(IProfileService profileService)
        {
            _profileService = profileService;
        }

        private string UserId =>
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException();

        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            var profile = await _profileService.GetMeAsync(UserId);
            return Ok(profile);
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UserProfileDTO dto)
        {
            await _profileService.UpdateProfileAsync(UserId, dto);
            return Ok(new { message = "Profile updated" });
        }

        [HttpPost("photo")]
        public async Task<IActionResult> UploadPhoto([FromForm] IFormFile file)
        {
            var url = await _profileService.UploadPhotoAsync(UserId, file);
            return Ok(new { profileImageUrl = url });
        }

        [HttpDelete("photo")]
        public async Task<IActionResult> DeletePhoto()
        {
            await _profileService.DeletePhotoAsync(UserId);
            return Ok(new { message = "Profile photo removed" });
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO dto)
        {
            await _profileService.ChangePasswordAsync(UserId, dto);
            return Ok(new { message = "Password changed successfully" });
        }
    }
}
