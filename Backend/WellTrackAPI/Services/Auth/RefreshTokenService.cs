using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WellTrackAPI.Data;
using WellTrackAPI.ExceptionHandling;
using WellTrackAPI.Models;
using WellTrackAPI.Services.Core;

namespace WellTrackAPI.Services
{
    public class RefreshTokenService : IRefreshTokenService
    {
        private readonly ApplicationDbContext _db;
        private readonly ITokenService _tokenService;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<RefreshTokenService> _logger;

        public RefreshTokenService(
            ApplicationDbContext db,
            ITokenService tokenService,
            UserManager<ApplicationUser> userManager,
            ILogger<RefreshTokenService> logger)
        {
            _db = db;
            _tokenService = tokenService;
            _userManager = userManager;
            _logger = logger;
        }

        public async Task<string> CreateAndSaveRefreshTokenAsync(string userId, string ipAddress)
        {
            var refreshToken = _tokenService.CreateRefreshToken(ipAddress, userId);
            _db.RefreshTokens.Add(refreshToken);
            await _db.SaveChangesAsync();
            return refreshToken.Token;
        }

        public async Task<string> RefreshTokenAsync(string token, string ipAddress)
        {
            var refresh = await _db.RefreshTokens
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Token == token);

            if (refresh == null || !refresh.IsActive)
            {
                _logger.LogWarning("Invalid refresh token attempt from IP {IP}", ipAddress);
                throw new UnauthorizedException("Invalid refresh token");
            }

            refresh.Revoked = DateTime.UtcNow;
            refresh.RevokedByIp = ipAddress;

            var newRefresh = _tokenService.CreateRefreshToken(ipAddress, refresh.UserId);
            refresh.ReplacedByToken = newRefresh.Token;

            _db.RefreshTokens.Add(newRefresh);

            var roles = await _userManager.GetRolesAsync(refresh.User);
            var newAccess = _tokenService.CreateAccessToken(refresh.User, roles);

            await _db.SaveChangesAsync();

            _logger.LogInformation("Refresh token rotated for UserId {UserId}", refresh.UserId);
            return newAccess;
        }

        public async Task<bool> RevokeRefreshTokenAsync(string token, string ipAddress)
        {
            var refresh = await _db.RefreshTokens.FirstOrDefaultAsync(r => r.Token == token);

            if (refresh == null || !refresh.IsActive)
            {
                _logger.LogWarning("Attempt to revoke invalid or inactive refresh token from IP {IP}", ipAddress);
                throw new NotFoundException("Refresh token not found or already inactive");
            }

            refresh.Revoked = DateTime.UtcNow;
            refresh.RevokedByIp = ipAddress;

            await _db.SaveChangesAsync();

            _logger.LogInformation("Refresh token revoked for UserId {UserId} from IP {IP}", refresh.UserId, ipAddress);
            return true;
        }
    }
}