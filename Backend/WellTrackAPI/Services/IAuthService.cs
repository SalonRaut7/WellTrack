using WellTrackAPI.DTOs;

namespace WellTrackAPI.Services
{
    public interface IAuthService
    {
        Task<(bool Succeeded, string? UserId, IEnumerable<string>? Errors)> RegisterAsync(RegisterModel model, string originIp);
        Task<(string? AccessToken, string? RefreshToken, string? Error)> LoginAsync(LoginModel model, string ipAddress);
        Task<(string? AccessToken, string? Error)> RefreshTokenAsync(string token, string ipAddress);
        Task<bool> RevokeRefreshTokenAsync(string token, string ipAddress);
        Task SendEmailOtpAsync(string userId, string email);
        Task<bool> VerifyEmailOtpAsync(string userId, string code);
        Task SendPasswordResetOtpAsync(string email);
        Task<bool> ResetPasswordAsync(string email, string code, string newPassword);
        Task<bool> VerifyPasswordResetOtpAsync(string email, string code);
    }
}
