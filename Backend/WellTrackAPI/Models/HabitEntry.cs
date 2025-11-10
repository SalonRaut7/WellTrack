namespace WellTrackAPI.Models
{
    public class HabitEntry
    {
        public int Id { get; set; }
        public string HabitName { get; set; } = string.Empty;
        public DateTime Date { get; set; } = DateTime.Now;
        public bool Completed { get; set; }

        public int UserId { get; set; }
        public User User { get; set; } = null!; 
        //I’m deliberately initializing this to null, but I guarantee it will be assigned a valid User later (by EF Core when it loads from the database). Don’t warn me.

    }
}
