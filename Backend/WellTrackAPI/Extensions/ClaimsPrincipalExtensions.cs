using System.Security.Claims;

namespace WellTrackAPI.Extensions
{
    public static class ClaimsPrincipalExtensions
    {
        public static int GetUserId(this ClaimsPrincipal user)
        {
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var id))
                throw new UnauthorizedAccessException("Invalid token: user ID not found.");
            return id;
        }

        public static string? GetEmail(this ClaimsPrincipal user)
            => user.FindFirst(ClaimTypes.Email)?.Value;

        public static string? GetUsername(this ClaimsPrincipal user)
            => user.FindFirst(ClaimTypes.Name)?.Value;
    }
}
