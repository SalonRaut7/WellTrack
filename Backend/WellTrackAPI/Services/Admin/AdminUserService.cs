using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using WellTrackAPI.DTOs;
using WellTrackAPI.ExceptionHandling;
using WellTrackAPI.Models;

namespace WellTrackAPI.Services.Admin
{
    public class AdminUserService : IAdminUserService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IMapper _mapper;
        private readonly ILogger<AdminUserService> _logger;

        public AdminUserService(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IMapper mapper,
            ILogger<AdminUserService> logger)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<AdminUserDTO>> GetUsersAsync()
        {
            _logger.LogInformation("Fetching all users");

            var users = await _userManager.Users.ToListAsync();

            var result = new List<AdminUserDTO>();

            foreach (var user in users)
            {
                var dto = _mapper.Map<AdminUserDTO>(user);
                dto.Roles = await _userManager.GetRolesAsync(user);
                result.Add(dto);
            }

            return result;
        }

        public async Task<AdminUserDTO> GetUserAsync(string id)
        {
            var user = await _userManager.FindByIdAsync(id)
                ?? throw new NotFoundException("User not found");

            var dto = _mapper.Map<AdminUserDTO>(user);
            dto.Roles = await _userManager.GetRolesAsync(user);

            return dto;
        }

        public async Task AssignRoleAsync(string userId, string role)
        {
            var user = await _userManager.FindByIdAsync(userId)
                ?? throw new NotFoundException("User not found");

            if (!await _roleManager.RoleExistsAsync(role))
                await _roleManager.CreateAsync(new IdentityRole(role));

            await _userManager.AddToRoleAsync(user, role);
        }

        public async Task RemoveRoleAsync(string userId, string role)
        {
            var user = await _userManager.FindByIdAsync(userId)
                ?? throw new NotFoundException("User not found");

            await _userManager.RemoveFromRoleAsync(user, role);
        }

        public async Task DeleteUserAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId)
                ?? throw new NotFoundException("User not found");

            await _userManager.DeleteAsync(user);
        }
    }
}