using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace WellTrackAPI.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        private readonly ILogger<NotificationHub> _logger;

        public NotificationHub(ILogger<NotificationHub> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            _logger.LogInformation(
                "NotificationHub connected. ConnectionId={ConnectionId}, UserIdentifier={UserIdentifier}, Name={Name}",
                Context.ConnectionId,
                Context.UserIdentifier,
                Context.User?.Identity?.Name
            );

            await base.OnConnectedAsync();
        }
    }
}