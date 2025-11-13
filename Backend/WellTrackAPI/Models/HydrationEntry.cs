namespace WellTrackAPI.Models
{
    public class HydrationEntry
    {
        public int Id { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public double WaterIntakeLiters { get; set; }

        public int UserId { get; set; }
        public User User { get; set; } = null!;
    }
}
