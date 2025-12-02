namespace WellTrackAPI.Models
{
    public class StepEntry
    {
        public int Id { get; set; }
        public int StepsCount { get; set; }
        public string? ActivityType { get; set; } // Walking, Jogging, etc.
        public DateTime Date { get; set; } = DateTime.UtcNow;

        public string UserId { get; set; } = null!;
        public ApplicationUser User { get; set; } = null!;
    }
}
