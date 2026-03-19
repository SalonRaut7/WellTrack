using WellTrackAPI.Models;

namespace WellTrackAPI.Services
{
    public interface IEmailOtpService
    {
        Task SendEmailVerificationOtpAsync(string userId, string email);
        Task<bool> VerifyEmailOtpAsync(string userId, string code);

        Task SendPasswordResetOtpAsync(string userId, string email);
        Task<bool> VerifyPasswordResetOtpAsync(string userId, string code);
    }
}