namespace WellTrackAPI.Models
{
    public class SleepEntry
    {
        public int Id { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public double Hours { get; set; }
        public string Quality { get; set; } = string.Empty;

        public int UserId { get; set; }
        public User User { get; set; } = null!;
    }
}
