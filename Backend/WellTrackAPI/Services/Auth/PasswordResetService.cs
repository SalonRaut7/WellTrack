using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WellTrackAPI.Data;
using WellTrackAPI.ExceptionHandling;
using WellTrackAPI.Models;

namespace WellTrackAPI.Services
{
    public class PasswordResetService : IPasswordResetService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _db;
        private readonly IEmailOtpService _emailOtpService;
        private readonly ILogger<PasswordResetService> _logger;

        public PasswordResetService(
            UserManager<ApplicationUser> userManager,
            ApplicationDbContext db,
            IEmailOtpService emailOtpService,
            ILogger<PasswordResetService> logger)
        {
            _userManager = userManager;
            _db = db;
            _emailOtpService = emailOtpService;
            _logger = logger;
        }

        public async Task SendPasswordResetOtpAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                throw new NotFoundException("User not found");

            await _emailOtpService.SendPasswordResetOtpAsync(user.Id, email);
        }

        public async Task<bool> VerifyPasswordResetOtpAsync(string email, string code)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                throw new NotFoundException("User not found");

            return await _emailOtpService.VerifyPasswordResetOtpAsync(user.Id, code);
        }

        public async Task<bool> ResetPasswordAsync(string email, string code, string newPassword)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                throw new NotFoundException("User not found");

            var otp = await _db.EmailOtps
                .Where(o => o.UserId == user.Id && !o.UsedForReset && o.ExpiresAt >= DateTime.UtcNow)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            if (otp == null || otp.Code != code)
            {
                _logger.LogWarning("Invalid password reset OTP attempt for email {Email}", email);
                return false;
            }

            otp.UsedForReset = true;

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, newPassword);

            await _db.SaveChangesAsync();
            _logger.LogInformation("Password reset successfully for email {Email}", email);

            return result.Succeeded;
        }
    }
}