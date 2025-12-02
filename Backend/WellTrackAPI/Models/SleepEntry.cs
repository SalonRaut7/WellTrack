namespace WellTrackAPI.Models
{
    public class SleepEntry
    {
        public int Id { get; set; }

        // BedTime and WakeUpTime are stored in UTC; 
        public DateTime BedTime { get; set; }
        public DateTime WakeUpTime { get; set; }

        // Calculated (set on create/update)
        public double Hours { get; set; }
        public string Quality { get; set; } = null!; // e.g., Good, Poor

        public DateTime Date { get; set; } = DateTime.UtcNow;

        public string UserId { get; set; } = null!;
        public ApplicationUser User { get; set; } = null!;
    }
}
