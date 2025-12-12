using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using WellTrackAPI.DTOs;
using WellTrackAPI.Models;
using WellTrackAPI.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace WellTrackAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _auth;
        private readonly UserManager<ApplicationUser> _userManager;
        
        public AuthController(IAuthService auth, UserManager<ApplicationUser> userManager)
        {
            _auth = auth;
            _userManager = userManager;
        }


        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var (succeeded,userId, errors) = await _auth.RegisterAsync(model, ip);
            if (!succeeded) return BadRequest(new { errors });
            return Ok(new { userId, message = "Registered. Check email for OTP to verify." });
        }

        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromQuery] string userId, [FromQuery] string code)
        {
            var ok = await _auth.VerifyEmailOtpAsync(userId, code);
            if (!ok) return BadRequest(new { message = "Invalid or expired code." });
            return Ok(new { message = "Email verified" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var (access, refresh, error) = await _auth.LoginAsync(model, ip);
            if (error != null) return BadRequest(new { message = error });
            return Ok(new { access, refresh });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] string refreshToken)
        {
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var (access, error) = await _auth.RefreshTokenAsync(refreshToken, ip);
            if (error != null) return BadRequest(new { message = error });
            return Ok(new { access });
        }

        [HttpPost("revoke")]
        public async Task<IActionResult> Revoke([FromBody] string refreshToken)
        {
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var ok = await _auth.RevokeRefreshTokenAsync(refreshToken, ip);
            if (!ok) return BadRequest(new { message = "Token not found or already revoked." });
            return Ok(new { message = "Revoked" });
        }
        
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                return NotFound(new { message = "Email is not registered." });

            await _auth.SendPasswordResetOtpAsync(email);
            return Ok(new { message = "OTP sent to email." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromQuery] string email, [FromQuery] string code, [FromQuery] string newPassword)
        {
            var ok = await _auth.ResetPasswordAsync(email, code, newPassword);
            if (!ok) return BadRequest(new { message = "Invalid code or email." });
            return Ok(new { message = "Password reset successful." });
        }

        [HttpPost("resend-otp")]
        public async Task<IActionResult> ResendOtp([FromBody] string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                return NotFound(new { message = "Email is not registered." });

            await _auth.SendEmailOtpAsync(user.Id, user.Email!);
            return Ok(new { message = "OTP resent successfully." });
        }

        [HttpPost("resend-reset-otp")]
        public async Task<IActionResult> ResendResetOtp([FromBody] string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                return NotFound(new { message = "Email is not registered." });

            await _auth.SendPasswordResetOtpAsync(email); // same as forgot-password
            return Ok(new { message = "Password reset OTP resent successfully." });
        }

        [HttpPost("verify-reset-otp")]
        public async Task<IActionResult> VerifyResetOtp([FromQuery] string email, [FromQuery] string code)
        {
            var ok = await _auth.VerifyPasswordResetOtpAsync(email, code);
            if (!ok) return BadRequest(new { message = "Invalid or expired OTP." });
            return Ok(new { message = "OTP verified successfully." });
        }
        
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            var userId = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound();

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                id = user.Id,
                email = user.Email,
                roles
            });
        }
    }
}
