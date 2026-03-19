using WellTrackAPI.DTOs;

namespace WellTrackAPI.Services.Admin
{
    public interface IAdminUserService
    {
        Task<IEnumerable<AdminUserDTO>> GetUsersAsync();
        Task<AdminUserDTO> GetUserAsync(string id);

        Task AssignRoleAsync(string userId, string role);
        Task RemoveRoleAsync(string userId, string role);
        Task DeleteUserAsync(string userId);
    }
}