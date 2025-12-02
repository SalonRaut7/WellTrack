namespace WellTrackAPI.Models
{
    public class HydrationEntry
    {
        public int Id { get; set; }
        public double WaterIntakeLiters { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;

        public string UserId { get; set; } = null!;
        public ApplicationUser User { get; set; } = null!;
    }
}
