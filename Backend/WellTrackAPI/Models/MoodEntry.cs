namespace WellTrackAPI.Models
{
    public class MoodEntry
    {
        public int Id { get; set; }
        public DateTime Date { get; set; } = DateTime.Now;
        public string Mood { get; set; } = string.Empty; // e.g. "Happy", "Sad"
        public string Notes { get; set; } = string.Empty;
    }
}
