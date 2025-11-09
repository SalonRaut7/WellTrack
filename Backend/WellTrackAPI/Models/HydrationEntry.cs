namespace WellTrackAPI.Models
{
    public class HydrationEntry
    {
        public int Id { get; set; }
        public DateTime Date { get; set; } = DateTime.Now;
        public double WaterIntakeLiters { get; set; } // e.g. 2.5
    }
}
