namespace WellTrackAPI.DTOs
{
    public class HabitDTO
    {
        public string Name { get; set; } = null!;
        public bool Completed { get; set; }
        public DateTime? Date { get; set; }
    }
}
