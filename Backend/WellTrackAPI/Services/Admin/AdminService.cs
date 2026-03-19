using WellTrackAPI.DTOs;
using WellTrackAPI.Services.Admin;

namespace WellTrackAPI.Services
{
    public class AdminService : IAdminService
    {
        private readonly IAdminUserService _userService;
        private readonly IAdminReportService _reportService;
        private readonly IAdminTrackerService _trackerService;
        private readonly IAdminEntryService _entryService;

        public AdminService(
            IAdminUserService userService,
            IAdminReportService reportService,
            IAdminTrackerService trackerService,
            IAdminEntryService entryService)
        {
            _userService = userService;
            _reportService = reportService;
            _trackerService = trackerService;
            _entryService = entryService;
        }

        public Task<IEnumerable<AdminUserDTO>> GetUsersAsync()
            => _userService.GetUsersAsync();

        public Task<AdminUserDTO> GetUserAsync(string id)
            => _userService.GetUserAsync(id);

        public Task AssignRoleAsync(string userId, string role)
            => _userService.AssignRoleAsync(userId, role);

        public Task RemoveRoleAsync(string userId, string role)
            => _userService.RemoveRoleAsync(userId, role);

        public Task DeleteUserAsync(string userId)
            => _userService.DeleteUserAsync(userId);

        public Task<AdminReportsDTO> GetReportsAsync()
            => _reportService.GetReportsAsync();

        public Task<object> GetUserTrackersAsync(string userId)
            => _trackerService.GetUserTrackersAsync(userId);

        public Task UpdateMoodAsync(int id, MoodDTO dto)
            => _entryService.UpdateMoodAsync(id, dto);

        public Task UpdateSleepAsync(int id, SleepDTO dto)
            => _entryService.UpdateSleepAsync(id, dto);

        public Task UpdateStepAsync(int id, StepDTO dto)
            => _entryService.UpdateStepAsync(id, dto);

        public Task UpdateHydrationAsync(int id, HydrationDTO dto)
            => _entryService.UpdateHydrationAsync(id, dto);

        public Task UpdateHabitAsync(int id, HabitDTO dto)
            => _entryService.UpdateHabitAsync(id, dto);

        public Task UpdateFoodAsync(int id, FoodEntryDTO dto)
            => _entryService.UpdateFoodAsync(id, dto);

        public Task DeleteMoodAsync(int id)
            => _entryService.DeleteMoodAsync(id);

        public Task DeleteSleepAsync(int id)
            => _entryService.DeleteSleepAsync(id);

        public Task DeleteStepAsync(int id)
            => _entryService.DeleteStepAsync(id);

        public Task DeleteHydrationAsync(int id)
            => _entryService.DeleteHydrationAsync(id);

        public Task DeleteHabitAsync(int id)
            => _entryService.DeleteHabitAsync(id);

        public Task DeleteFoodAsync(int id)
            => _entryService.DeleteFoodAsync(id);
    }
}