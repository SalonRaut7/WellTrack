namespace WellTrackAPI.Models
{
    public class HabitEntry
    {
        public int Id { get; set; }
        public string HabitName { get; set; } = string.Empty;
        public DateTime Date { get; set; } = DateTime.Now;
        public bool Completed { get; set; }
    }
}
