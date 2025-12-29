namespace WellTrackAPI.Models;

public class DailyMotivation
{
    public int Id { get; set; }
    public DateOnly Date { get; set; }
    public string Message { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
