namespace WellTrackAPI.Models
{
    public class HydrationEntry
    {
        public int Id { get; set; }
        public DateTime Date { get; set; } = DateTime.Now;
        public double WaterIntakeLiters { get; set; } // e.g. 2.5

        public int UserId { get; set; }
        public User User { get; set; } = null!;

    }
}
