namespace WellTrackAPI.DTOs
{
    public class MoodDTO
    {
        public string Mood { get; set; } = null!;
        public string? Notes { get; set; }
        public DateTime? Date { get; set; }
    }
}
