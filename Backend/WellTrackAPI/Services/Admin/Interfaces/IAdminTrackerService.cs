namespace WellTrackAPI.Services.Admin
{
    public interface IAdminTrackerService
    {
        Task<object> GetUserTrackersAsync(string userId);
    }
}