using WellTrackAPI.Models;

namespace WellTrackAPI.Services
{
    public interface IUserRoleService
    {
        Task EnsureUserRoleAssignedAsync(ApplicationUser user);
    }
}