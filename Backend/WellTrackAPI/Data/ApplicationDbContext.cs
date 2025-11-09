using Microsoft.EntityFrameworkCore;
using WellTrackAPI.Models;

namespace WellTrackAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<MoodEntry> MoodEntries { get; set; }
        public DbSet<SleepEntry> SleepEntries { get; set; }
        public DbSet<StepsEntry> StepsEntries { get; set; }
        public DbSet<HydrationEntry> HydrationEntries { get; set; }
        public DbSet<HabitEntry> HabitEntries { get; set; }
    }
}
