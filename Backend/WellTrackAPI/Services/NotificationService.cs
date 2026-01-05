using Microsoft.AspNetCore.SignalR;
using WellTrackAPI.DTOs;
using WellTrackAPI.Hubs;

namespace WellTrackAPI.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub> _hub;

        public NotificationService(IHubContext<NotificationHub> hub)
        {
            _hub = hub;
        }

        public async Task SendToUserAsync(string userId, NotificationDTO notification)
        {
            Console.WriteLine($"[Notify] -> userId={userId} type={notification.Type}");
            await _hub.Clients
                .User(userId)
                .SendAsync("ReceiveNotification", notification);
        }
    }
}
