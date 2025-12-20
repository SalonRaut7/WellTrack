using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Logging;
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
        private readonly ILogger<CloudinaryImageService> _logger;

        public CloudinaryImageService(IConfiguration config, ILogger<CloudinaryImageService> logger)
        {
            _logger = logger;

            var cloudName = config["Cloudinary:CloudName"] ?? throw new InvalidOperationException("Cloudinary:CloudName missing");
            var apiKey = config["Cloudinary:ApiKey"] ?? throw new InvalidOperationException("Cloudinary:ApiKey missing");
            var apiSecret = config["Cloudinary:ApiSecret"] ?? throw new InvalidOperationException("Cloudinary:ApiSecret missing");

            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account) { Api = { Secure = true } };
        }

        public async Task<string?> UploadProfileImageAsync(IFormFile file, string userId)
        {
            if (file == null || file.Length == 0)
            {
                _logger.LogWarning("Empty profile image upload attempt for UserId {UserId}", userId);
                return null;
            }

            _logger.LogInformation("Uploading profile image for UserId {UserId}", userId);
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
                _logger.LogError(
                    "Cloudinary upload failed for UserId {UserId}. Error: {Error}",
                    userId,
                    result.Error.Message
                );
                return null;
            }
            _logger.LogInformation("Profile image uploaded successfully for UserId {UserId}", userId);
            return result.SecureUrl?.ToString();
        }
    }
}
