namespace WellTrackAPI.Domain.Entities.Interfaces
{
    public interface ITrackerEntity
    {
        int Id { get; set; }
        string UserId { get; set; }
        DateTime Date { get; set; }
    }
}
