using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace WellTrackAPI.Services
{
    public interface IImageService
    {
        Task<string?> UploadProfileImageAsync(IFormFile file, string userId);
    }
}