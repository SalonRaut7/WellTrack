using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using System.Threading.Tasks;

namespace WellTrackAPI.Services
{
    public class CloudinaryImageService : IImageService
    {
        private readonly Cloudinary _cloudinary;

        public CloudinaryImageService(IConfiguration config)
        {
            var cloudName = config["Cloudinary:CloudName"] ?? throw new InvalidOperationException("Cloudinary:CloudName missing");
            var apiKey = config["Cloudinary:ApiKey"] ?? throw new InvalidOperationException("Cloudinary:ApiKey missing");
            var apiSecret = config["Cloudinary:ApiSecret"] ?? throw new InvalidOperationException("Cloudinary:ApiSecret missing");

            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account) { Api = { Secure = true } };
        }

        public async Task<string?> UploadProfileImageAsync(IFormFile file, string userId)
        {
            if (file == null || file.Length == 0) return null;

            await using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            ms.Position = 0;

            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, ms),
                PublicId = $"welltrack/profiles/{userId}-{Guid.NewGuid()}",
                Overwrite = false,
                Transformation = new Transformation()
                    .Width(512)
                    .Height(512)
                    .Crop("limit")
            };

            var result = await _cloudinary.UploadAsync(uploadParams);

            if (result.Error != null)
            {
                Console.WriteLine("Cloudinary upload error: " + result.Error.Message);
                return null;
            }

            return result.SecureUrl?.ToString();
        }
    }
}
