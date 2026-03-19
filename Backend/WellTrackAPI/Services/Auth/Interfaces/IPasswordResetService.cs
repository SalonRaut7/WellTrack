namespace WellTrackAPI.Services
{
    public interface IPasswordResetService
    {
        Task SendPasswordResetOtpAsync(string email);
        Task<bool> VerifyPasswordResetOtpAsync(string email, string code);
        Task<bool> ResetPasswordAsync(string email, string code, string newPassword);
    }
}