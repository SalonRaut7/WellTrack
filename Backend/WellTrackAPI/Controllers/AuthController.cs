using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WellTrackAPI.DTOs;
using WellTrackAPI.DTOs.Auth;
using WellTrackAPI.Models;
using WellTrackAPI.Services;
using Microsoft.Extensions.Logging;
using WellTrackAPI.ExceptionHandling;
using Microsoft.AspNetCore.RateLimiting;

namespace WellTrackAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _auth;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IAuthService auth,
            UserManager<ApplicationUser> userManager,
            ILogger<AuthController> logger)
        {
            _auth = auth;
            _userManager = userManager;
            _logger = logger;
        }

        private string ClientIp =>
            HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";


        [EnableRateLimiting("AuthPolicy")]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            _logger.LogInformation(
                "Register request for email {Email} from IP {IP}",
                model.Email,
                ClientIp
            );

            var (succeeded, userId, _) =
                await _auth.RegisterAsync(model, ClientIp);

            return Ok(new
            {
                userId,
                message = "Registered. Check email for OTP to verify."
            });
        }

        [EnableRateLimiting("AuthPolicy")]
        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail(
            [FromQuery] string userId,
            [FromQuery] string code)
        {
            await _auth.VerifyEmailOtpAsync(userId, code);

            return Ok(new { message = "Email verified" });
        }

        [EnableRateLimiting("AuthPolicy")]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            _logger.LogInformation(
                "Login attempt for email {Email} from IP {IP}",
                model.Email,
                ClientIp
            );

            var (access, refresh, _) =
                await _auth.LoginAsync(model, ClientIp);

            return Ok(new { access, refresh });
        }

        [EnableRateLimiting("TokenPolicy")]
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh(
            [FromBody] RefreshTokenDto dto)
        {
            var (access, _) =
                await _auth.RefreshTokenAsync(dto.RefreshToken, ClientIp);

            return Ok(new { access });
        }

        [EnableRateLimiting("TokenPolicy")]
        [HttpPost("revoke")]
        public async Task<IActionResult> Revoke(
            [FromBody] RefreshTokenDto dto)
        {
            await _auth.RevokeRefreshTokenAsync(dto.RefreshToken, ClientIp);

            return Ok(new { message = "Revoked" });
        }

        [EnableRateLimiting("AuthPolicy")]
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(
            [FromBody] EmailDto dto)
        {
            _logger.LogInformation(
                "Forgot-password requested for {Email}",
                dto.Email
            );

            await _auth.SendPasswordResetOtpAsync(dto.Email);

            return Ok(new { message = "OTP sent to email." });
        }

        [EnableRateLimiting("AuthPolicy")]
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            await _auth.ResetPasswordAsync(dto.Email, dto.Code, dto.NewPassword);

            return Ok(new { message = "Password reset successful." });
        }

        [EnableRateLimiting("AuthPolicy")]
        [HttpPost("verify-reset-otp")]
        public async Task<IActionResult> VerifyResetOtp(
            [FromBody] VerifyResetOtpDto dto)
        {
            var ok = await _auth.VerifyPasswordResetOtpAsync(dto.Email, dto.Code);

            if (!ok)
                return BadRequest(new { message = "Invalid or expired OTP." });

            return Ok(new { message = "OTP verified successfully." });
        }

        [EnableRateLimiting("AuthPolicy")]
        [HttpPost("resend-otp")]
        public async Task<IActionResult> ResendOtp(
            [FromBody] EmailDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email)
                ?? throw new NotFoundException("User not found"); 

            await _auth.SendEmailOtpAsync(user.Id, user.Email!);

            return Ok(new { message = "OTP resent successfully." });
        }

        [EnableRateLimiting("AuthPolicy")]
        [HttpPost("resend-reset-otp")]
        public async Task<IActionResult> ResendResetOtp(
            [FromBody] EmailDto dto)
        {
            await _auth.SendPasswordResetOtpAsync(dto.Email);

            return Ok(new { message = "Password reset OTP resent successfully." });
        }
        
        [Authorize]
        [EnableRateLimiting("UserPolicy")]
        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException();

            var user = await _userManager.FindByIdAsync(userId)
                ?? throw new NotFoundException("User not found");

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
