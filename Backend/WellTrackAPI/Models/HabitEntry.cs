using WellTrackAPI.Domain.Entities.Interfaces;

namespace WellTrackAPI.Models
{
    public class HabitEntry : ITrackerEntity
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public bool Completed { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;

        public string UserId { get; set; } = null!;
        public ApplicationUser User { get; set; } = null!;
    }
}
