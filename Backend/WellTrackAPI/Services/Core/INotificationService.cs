using WellTrackAPI.DTOs;

namespace WellTrackAPI.Services.Core
{
    public interface INotificationService
    {
        Task SendToUserAsync(string userId, NotificationDTO notification);
    }
}
