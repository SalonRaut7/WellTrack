using WellTrackAPI.DTOs;

namespace WellTrackAPI.Services
{
    public interface INotificationService
    {
        Task SendToUserAsync(string userId, NotificationDTO notification);
    }
}
