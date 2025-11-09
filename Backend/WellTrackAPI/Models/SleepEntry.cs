namespace WellTrackAPI.Models
{
    public class SleepEntry
    {
        public int Id { get; set; }
        public DateTime Date { get; set; } = DateTime.Now;
        public double Hours { get; set; } // e.g. 7.5
        public string Quality { get; set; } = string.Empty; // e.g. "Good", "Poor"
    }
}
