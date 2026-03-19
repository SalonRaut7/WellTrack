namespace WellTrackAPI.Services
{
    public interface IRefreshTokenService
    {
        Task<string> CreateAndSaveRefreshTokenAsync(string userId, string ipAddress);
        Task<string> RefreshTokenAsync(string token, string ipAddress);
        Task<bool> RevokeRefreshTokenAsync(string token, string ipAddress);
    }
}