namespace WellTrackAPI.Models
{
    public class MoodEntry
    {
        public int Id { get; set; }
        public string Mood { get; set; } = null!; // e.g., Happy, Sad, Anxious
        public string? Notes { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;

        public string UserId { get; set; } = null!;
        public ApplicationUser User { get; set; } = null!;
    }
}
