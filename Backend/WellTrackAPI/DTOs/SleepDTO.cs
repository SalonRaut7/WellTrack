namespace WellTrackAPI.DTOs
{
    public class SleepDTO
    {
        public DateTime BedTime { get; set; }
        public DateTime WakeUpTime { get; set; }
        public string Quality { get; set; } = null!;
        public DateTime? Date { get; set; }
    }
}
