namespace WellTrackAPI.Models
{
    public class MoodEntry
    {
        public int Id { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public string Mood { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;

        public int UserId { get; set; }
        public User User { get; set; } = null!;
    }
}
