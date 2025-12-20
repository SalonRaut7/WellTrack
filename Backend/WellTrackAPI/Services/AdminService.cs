using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WellTrackAPI.Data;
using WellTrackAPI.DTOs;
using WellTrackAPI.Models;
using Microsoft.Extensions.Logging;
using WellTrackAPI.ExceptionHandling;
using Microsoft.AspNetCore.Http.HttpResults;

namespace WellTrackAPI.Services
{
    public class AdminService : IAdminService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ApplicationDbContext _db;
        private readonly IMapper _mapper;
        private readonly ILogger<AdminService> _logger;

        public AdminService(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            ApplicationDbContext db,
            IMapper mapper,
            ILogger<AdminService> logger)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _db = db;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<AdminUserDTO>> GetUsersAsync()
        {
            _logger.LogInformation("Fetching all users for admin.");
            var users = await _userManager.Users.ToListAsync() 
                ?? throw new NotFoundException("No users found");

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
            _logger.LogInformation("Fetching user {UserId} for admin.", id);
            var user = await _userManager.FindByIdAsync(id)
                ?? throw new NotFoundException("User not found");

            var dto = _mapper.Map<AdminUserDTO>(user);
            dto.Roles = await _userManager.GetRolesAsync(user);
            return dto;
        }

        public async Task AssignRoleAsync(string userId, string role)
        {
            _logger.LogInformation("Assigning role {Role} to user {UserId}.", role, userId);
            var user = await _userManager.FindByIdAsync(userId)
                ?? throw new NotFoundException("User not found");

            if (!await _roleManager.RoleExistsAsync(role))
            {
                await _roleManager.CreateAsync(new IdentityRole(role));
                _logger.LogInformation("Created new role {Role}", role);
            }

            await _userManager.AddToRoleAsync(user, role);
        }

        public async Task RemoveRoleAsync(string userId, string role)
        {
            _logger.LogInformation("Removing role {Role} from user {UserId}.", role, userId);
            var user = await _userManager.FindByIdAsync(userId)
                ?? throw new NotFoundException("User not found");

            await _userManager.RemoveFromRoleAsync(user, role);
        }

        public async Task DeleteUserAsync(string userId)
        {
            _logger.LogInformation("Deleting user {UserId}.", userId);
            var user = await _userManager.FindByIdAsync(userId)
                ?? throw new NotFoundException("User not found");

            await _userManager.DeleteAsync(user);
        }

        public async Task<AdminReportsDTO> GetReportsAsync()
        {
            _logger.LogInformation("Generating admin reports.");
            return new AdminReportsDTO
            {
                TotalUsers = await _db.Users.CountAsync(),
                TotalMoodEntries = await _db.MoodEntries.CountAsync(),
                TotalSleepRecords = await _db.SleepEntries.CountAsync(),
                TotalStepsRecords = await _db.StepEntries.CountAsync(),
                TotalHydrationRecords = await _db.HydrationEntries.CountAsync(),
                TotalHabitEntries = await _db.HabitEntries.CountAsync(),
                TotalFoodEntries = await _db.FoodEntries.CountAsync()
            };
        }

        public async Task<object> GetUserTrackersAsync(string userId)
        {
            _logger.LogInformation("Fetching tracker data for user {UserId}.", userId);
            return new
            {
                Mood = await _db.MoodEntries.Where(x => x.UserId == userId).ToListAsync(),
                Sleep = await _db.SleepEntries.Where(x => x.UserId == userId).ToListAsync(),
                Steps = await _db.StepEntries.Where(x => x.UserId == userId).ToListAsync(),
                Hydration = await _db.HydrationEntries.Where(x => x.UserId == userId).ToListAsync(),
                Habits = await _db.HabitEntries.Where(x => x.UserId == userId).ToListAsync(),
                Food = await _db.FoodEntries.Where(x => x.UserId == userId).ToListAsync()
            };
        }

        // Update & Delete methods (logic unchanged)
        public async Task UpdateMoodAsync(int id, MoodDTO dto)
        {
            var e = await _db.MoodEntries.FindAsync(id) 
                ?? throw new NotFoundException("Mood entry not found");
            e.Mood = dto.Mood;
            e.Notes = dto.Notes;
            if (dto.Date.HasValue) e.Date = dto.Date.Value;
            await _db.SaveChangesAsync();
        }

        public async Task UpdateSleepAsync(int id, SleepDTO dto)
        {
            var e = await _db.SleepEntries.FindAsync(id) 
                ?? throw new NotFoundException("Sleep entry not found");
            e.BedTime = dto.BedTime;
            e.WakeUpTime = dto.WakeUpTime;
            e.Hours = (dto.WakeUpTime - dto.BedTime).TotalHours;
            e.Quality = dto.Quality;
            if (dto.Date.HasValue) e.Date = dto.Date.Value;
            await _db.SaveChangesAsync();
        }

        public async Task UpdateStepAsync(int id, StepDTO dto)
        {
            var e = await _db.StepEntries.FindAsync(id) 
                ?? throw new NotFoundException("Step entry not found");
            e.StepsCount = dto.StepsCount;
            e.ActivityType = dto.ActivityType;
            if (dto.Date.HasValue) e.Date = dto.Date.Value;
            await _db.SaveChangesAsync();
        }

        public async Task UpdateHydrationAsync(int id, HydrationDTO dto)
        {
            var e = await _db.HydrationEntries.FindAsync(id) 
                ?? throw new NotFoundException("Hydration entry not found");
            e.WaterIntakeLiters = dto.WaterIntakeLiters;
            if (dto.Date.HasValue) e.Date = dto.Date.Value;
            await _db.SaveChangesAsync();
        }

        public async Task UpdateHabitAsync(int id, HabitDTO dto)
        {
            var e = await _db.HabitEntries.FindAsync(id)
                ?? throw new NotFoundException("Habit entry not found");
            e.Name = dto.Name;
            e.Completed = dto.Completed;
            if (dto.Date.HasValue) e.Date = dto.Date.Value;
            await _db.SaveChangesAsync();
        }

        public async Task UpdateFoodAsync(int id, FoodEntryDTO dto)
        {
            var e = await _db.FoodEntries.FindAsync(id)
                ?? throw new NotFoundException("Food entry not found");
            e.FoodName = dto.FoodName;
            e.Calories = dto.Calories;
            e.Protein = dto.Protein;
            e.Carbs = dto.Carbs;
            e.Fat = dto.Fat;
            e.ServingSize = dto.ServingSize;
            e.MealType = dto.MealType;
            await _db.SaveChangesAsync();
        }

        public async Task DeleteMoodAsync(int id)
        {
            var entity = await _db.MoodEntries.FindAsync(id)
                ?? throw new NotFoundException("Mood entry not found");

            _db.MoodEntries.Remove(entity);
            await _db.SaveChangesAsync();
        }

        public async Task DeleteSleepAsync(int id)
        {
            var entity = await _db.SleepEntries.FindAsync(id)
               ?? throw new NotFoundException("Sleep entry not found");

            _db.SleepEntries.Remove(entity);
            await _db.SaveChangesAsync();
        }

        public async Task DeleteStepAsync(int id)
        {
            var entity = await _db.StepEntries.FindAsync(id)
                ?? throw new NotFoundException("Step entry not found");

            _db.StepEntries.Remove(entity);
            await _db.SaveChangesAsync();
        }

        public async Task DeleteHydrationAsync(int id)
        {
            var entity = await _db.HydrationEntries.FindAsync(id)
                ?? throw new NotFoundException("Hydration entry not found");

            _db.HydrationEntries.Remove(entity);
            await _db.SaveChangesAsync();
        }

        public async Task DeleteHabitAsync(int id)
        {
            var entity = await _db.HabitEntries.FindAsync(id)
                ?? throw new NotFoundException("Habit entry not found");

            _db.HabitEntries.Remove(entity);
            await _db.SaveChangesAsync();
        }

        public async Task DeleteFoodAsync(int id)
        {
            var entity = await _db.FoodEntries.FindAsync(id)
                ?? throw new NotFoundException("Food entry not found");

            _db.FoodEntries.Remove(entity);
            await _db.SaveChangesAsync();
        }
    }
}
