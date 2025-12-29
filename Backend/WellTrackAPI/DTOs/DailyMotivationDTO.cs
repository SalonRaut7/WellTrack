namespace WellTrackAPI.DTOs;

public class DailyMotivationDTO
{
    public DateOnly Date { get; set; }
    public string Message { get; set; } = null!;
}
