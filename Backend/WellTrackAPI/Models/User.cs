using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace WellTrackAPI.Models
{
    [Index(nameof(Email), IsUnique = true)]
    [Index(nameof(Username), IsUnique = true)]
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string PasswordSalt { get; set; } = string.Empty;
        public bool EmailConfirmed { get; set; } = false;
        public string Role { get; set; } = "User";

        public ICollection<HabitEntry> HabitEntries { get; set; } = new List<HabitEntry>();
        public ICollection<HydrationEntry> HydrationEntries { get; set; } = new List<HydrationEntry>();
        public ICollection<MoodEntry> MoodEntries { get; set; } = new List<MoodEntry>();
        public ICollection<SleepEntry> SleepEntries { get; set; } = new List<SleepEntry>();
        public ICollection<StepsEntry> StepsEntries { get; set; } = new List<StepsEntry>();
    }
}
