using WellTrackAPI.Models;

namespace WellTrackAPI.Services.Core
{
    public interface ITokenService
    {
        string CreateAccessToken(ApplicationUser user, IEnumerable<string> roles);
        RefreshToken CreateRefreshToken(string ipAddress, string userId);
    }
}