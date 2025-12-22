using Microsoft.AspNetCore.Http;
using WellTrackAPI.DTOs;

namespace WellTrackAPI.Services
{
    public interface IProfileService
    {
        Task<UserProfileDTO> GetMeAsync(string userId);
        Task UpdateProfileAsync(string userId, UserProfileDTO dto);
        Task<string> UploadPhotoAsync(string userId, IFormFile file);
        Task DeletePhotoAsync(string userId);
        Task ChangePasswordAsync(string userId, ChangePasswordDTO dto);
    }
}
