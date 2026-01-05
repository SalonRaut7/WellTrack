using Microsoft.EntityFrameworkCore;
using WellTrackAPI.Data;
using WellTrackAPI.DTOs;
using WellTrackAPI.Services;

namespace WellTrackAPI.BackgroundJobs
{
    public class HealthNotificationWorker : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<HealthNotificationWorker> _logger;

        public HealthNotificationWorker(IServiceScopeFactory scopeFactory, ILogger<HealthNotificationWorker> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("HealthNotificationWorker started");
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    _logger.LogInformation("HealthNotificationWorker tick");
                    await CheckHealthRulesAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "HealthNotificationWorker error");
                }
                await Task.Delay(TimeSpan.FromMinutes(30), stoppingToken);
            }
        }

        private async Task CheckHealthRulesAsync()
        {
            using var scope = _scopeFactory.CreateScope();

            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var notifier = scope.ServiceProvider.GetRequiredService<INotificationService>();

            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            var users = await db.Users.ToListAsync();

            foreach (var user in users)
            {
                var lastWater = await db.HydrationEntries
                    .Where(h => h.UserId == user.Id)
                    .OrderByDescending(h => h.Date)
                    .FirstOrDefaultAsync();

                if (lastWater == null ||
                    DateTime.UtcNow - lastWater.Date > TimeSpan.FromHours(4))
                {
                    await notifier.SendToUserAsync(user.Id, new NotificationDTO
                    {
                        Date = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm"),
                        Type = "HydrationReminder",
                        Message = "You haven’t drunk water in the last 4 hours 💧"
                    });
                }

                var todaySteps = await db.StepEntries
                    .Where(s => s.UserId == user.Id && DateOnly.FromDateTime(s.Date) == today)
                    .SumAsync(s => s.StepsCount);

                if (todaySteps < 3000)
                {
                    await notifier.SendToUserAsync(user.Id, new NotificationDTO
                    {
                        Date = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm"),
                        Type = "LowStepsWarning",
                        Message = "Today you walked less than usual 🚶"
                    });
                }
            }
        }
    }
}
