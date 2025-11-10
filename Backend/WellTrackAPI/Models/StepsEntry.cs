namespace WellTrackAPI.Models
{
    public class StepsEntry
    {
        public int Id { get; set; }
        public DateTime Date { get; set; } = DateTime.Now;
        public int Steps { get; set; }
        public string ActivityType { get; set; } = "Walking";
        public int UserId { get; set; }
        public User User { get; set; } = null!;

    }
}
