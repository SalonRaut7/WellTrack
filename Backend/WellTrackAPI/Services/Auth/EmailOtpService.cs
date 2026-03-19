using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using WellTrackAPI.Data;
using WellTrackAPI.ExceptionHandling;
using WellTrackAPI.Models;

namespace WellTrackAPI.Services
{
    public class EmailOtpService : IEmailOtpService
    {
        private readonly ApplicationDbContext _db;
        private readonly IEmailService _emailService;
        private readonly ILogger<EmailOtpService> _logger;

        public EmailOtpService(
            ApplicationDbContext db,
            IEmailService emailService,
            ILogger<EmailOtpService> logger)
        {
            _db = db;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task SendEmailVerificationOtpAsync(string userId, string email)
        {
            var code = RandomNumberGenerator.GetInt32(100000, 999999).ToString();
            var otp = new EmailOtp
            {
                UserId = userId,
                Code = code,
                ExpiresAt = DateTime.UtcNow.AddMinutes(15),
                CreatedAt = DateTime.UtcNow
            };

            _db.EmailOtps.Add(otp);
            await _db.SaveChangesAsync();

            _logger.LogInformation("Sending email OTP to {Email} for UserId {UserId}", email, userId);

            await _emailService.SendEmailAsync(
                email,
                "Your WellTrack OTP",
                $"Your verification code is: <b>{code}</b>. It expires in 15 minutes.");
        }

        public async Task<bool> VerifyEmailOtpAsync(string userId, string code)
        {
            var otp = await _db.EmailOtps
                .Where(o => o.UserId == userId && !o.Used && o.ExpiresAt >= DateTime.UtcNow)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            if (otp == null || otp.Code != code)
            {
                _logger.LogWarning("Invalid email OTP verification attempt for UserId {UserId}", userId);
                throw new ValidationException("Invalid or expired OTP");
            }

            otp.Used = true;
            await _db.SaveChangesAsync();

            _logger.LogInformation("Email OTP verified successfully for UserId {UserId}", userId);
            return true;
        }

        public async Task SendPasswordResetOtpAsync(string userId, string email)
        {
            var code = RandomNumberGenerator.GetInt32(100000, 999999).ToString();
            var otp = new EmailOtp
            {
                UserId = userId,
                Code = code,
                ExpiresAt = DateTime.UtcNow.AddMinutes(15),
                CreatedAt = DateTime.UtcNow,
                Purpose = "PasswordReset"
            };

            _logger.LogInformation("Sending password reset OTP to {Email}", email);

            _db.EmailOtps.Add(otp);
            await _db.SaveChangesAsync();

            await _emailService.SendEmailAsync(
                email,
                "Reset Your Password",
                $"Your reset code is: <b>{code}</b>. It expires in 15 minutes.");
        }

        public async Task<bool> VerifyPasswordResetOtpAsync(string userId, string code)
        {
            var otp = await _db.EmailOtps
                .Where(o => o.UserId == userId && o.Purpose == "PasswordReset" && !o.Used && o.ExpiresAt >= DateTime.UtcNow)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            if (otp == null || otp.Code != code)
            {
                _logger.LogWarning("Invalid password reset OTP verification attempt for UserId {UserId}", userId);
                return false;
            }

            otp.Used = true;
            await _db.SaveChangesAsync();

            _logger.LogInformation("Password reset OTP verified successfully for UserId {UserId}", userId);
            return true;
        }
    }
}