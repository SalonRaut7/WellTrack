using Microsoft.AspNetCore.Mvc;
using WellTrackAPI.DTOs;
using WellTrackAPI.Services;

namespace WellTrackAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _auth;
        public AuthController(IAuthService auth) => _auth = auth;

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

    }
}
