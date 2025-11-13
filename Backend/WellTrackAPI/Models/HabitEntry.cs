namespace WellTrackAPI.Models
{
    public class HabitEntry
    {
        public int Id { get; set; }
        public string HabitName { get; set; } = string.Empty;
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public bool Completed { get; set; }

        public int UserId { get; set; }
        public User User { get; set; } = null!;
    }
}
