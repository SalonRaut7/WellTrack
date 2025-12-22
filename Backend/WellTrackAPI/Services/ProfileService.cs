using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using WellTrackAPI.DTOs;
using WellTrackAPI.ExceptionHandling;
using WellTrackAPI.Models;

namespace WellTrackAPI.Services
{
    public class ProfileService : IProfileService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IImageService _imageService;
        private readonly IMapper _mapper;
        private readonly ILogger<ProfileService> _logger;

        public ProfileService(
            UserManager<ApplicationUser> userManager,
            IImageService imageService,
            IMapper mapper,
            ILogger<ProfileService> logger)
        {
            _userManager = userManager;
            _imageService = imageService;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<UserProfileDTO> GetMeAsync(string userId)
        {
            _logger.LogInformation("Fetching profile for user {UserId}", userId);

            var user = await _userManager.FindByIdAsync(userId)
                ?? throw new NotFoundException("User not found");

            var dto = _mapper.Map<UserProfileDTO>(user);

            if (user.Weight.HasValue && user.Height.HasValue && user.Height.Value > 0)
            {
                var heightMeters = user.Height.Value / 100.0;
                dto.BMI = Math.Round(user.Weight.Value / (heightMeters * heightMeters), 2);
            }

            return dto;
        }

        public async Task UpdateProfileAsync(string userId, UserProfileDTO dto)
        {
            _logger.LogInformation("Updating profile for user {UserId}", userId);

            var user = await _userManager.FindByIdAsync(userId)
                ?? throw new NotFoundException("User not found");

            _mapper.Map(dto, user);

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                var message = string.Join(
                    "; ",
                    result.Errors.Select(e => e.Description)
                );

                throw new ValidationException(message);
            }
        }

        public async Task<string> UploadPhotoAsync(string userId, IFormFile file)
        {
            if (file == null)
                throw new ValidationException("No file provided");

            _logger.LogInformation("Uploading profile photo for user {UserId}", userId);

            var uploadUrl = await _imageService.UploadProfileImageAsync(file, userId);
            if (string.IsNullOrWhiteSpace(uploadUrl))
                throw new ValidationException("Image upload failed");

            var user = await _userManager.FindByIdAsync(userId)
                ?? throw new NotFoundException("User not found");

            user.ProfileImageUrl = uploadUrl;
            await _userManager.UpdateAsync(user);

            return uploadUrl;
        }

        public async Task DeletePhotoAsync(string userId)
        {
            _logger.LogInformation("Deleting profile photo for user {UserId}", userId);

            var user = await _userManager.FindByIdAsync(userId)
                ?? throw new NotFoundException("User not found");

            user.ProfileImageUrl = null;
            await _userManager.UpdateAsync(user);
        }

        public async Task ChangePasswordAsync(string userId, ChangePasswordDTO dto)
        {
            _logger.LogInformation("Changing password for user {UserId}", userId);

            var user = await _userManager.FindByIdAsync(userId)
                ?? throw new NotFoundException("User not found");

            var result = await _userManager.ChangePasswordAsync(
                user,
                dto.OldPassword,
                dto.NewPassword
            );

            if (!result.Succeeded)
            {
                var message = string.Join(
                    "; ",
                    result.Errors.Select(e => e.Description)
                );

                throw new ValidationException(message);
            }
        }
    }
}
