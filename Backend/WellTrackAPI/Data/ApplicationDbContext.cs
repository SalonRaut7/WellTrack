using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using WellTrackAPI.Models;

namespace WellTrackAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Define the converter class inside or outside the DbContext-> to convert DateTime to UTC format.
        private class UtcDateTimeConverter : ValueConverter<DateTime, DateTime>
        {
            public UtcDateTimeConverter()
                : base(
                    v => v.ToUniversalTime(),
                    v => DateTime.SpecifyKind(v, DateTimeKind.Utc))
            { }
        }

        private class NullableUtcDateTimeConverter : ValueConverter<DateTime?, DateTime?>
        {
            public NullableUtcDateTimeConverter()
                : base(
                    v => v.HasValue ? v.Value.ToUniversalTime() : v,
                    v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v)
            { }
        }

        protected override void ConfigureConventions(ModelConfigurationBuilder builder)
        {
            builder
                .Properties<DateTime>()
                .HaveConversion<UtcDateTimeConverter>();

            builder
                .Properties<DateTime?>()
                .HaveConversion<NullableUtcDateTimeConverter>();
        }

        public DbSet<MoodEntry> MoodEntries { get; set; }
        public DbSet<SleepEntry> SleepEntries { get; set; }
        public DbSet<StepsEntry> StepsEntries { get; set; }
        public DbSet<HydrationEntry> HydrationEntries { get; set; }
        public DbSet<HabitEntry> HabitEntries { get; set; }
        public DbSet<User> Users { get; set; }

    }
}
