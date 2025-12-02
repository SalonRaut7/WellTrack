using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using WellTrackAPI.Models;

namespace WellTrackAPI.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<MoodEntry> MoodEntries { get; set; } = null!;
        public DbSet<SleepEntry> SleepEntries { get; set; } = null!;
        public DbSet<HydrationEntry> HydrationEntries { get; set; } = null!;
        public DbSet<StepEntry> StepEntries { get; set; } = null!;
        public DbSet<HabitEntry> HabitEntries { get; set; } = null!;

        public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
        public DbSet<EmailOtp> EmailOtps { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Explicitly configure relationship so EF won't create 'UserId1'
            builder.Entity<HabitEntry>()
                .HasOne(h => h.User)
                .WithMany() // not tracking a collection on ApplicationUser
                .HasForeignKey(h => h.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<HydrationEntry>()
                .HasOne(h => h.User)
                .WithMany()
                .HasForeignKey(h => h.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<MoodEntry>()
                .HasOne(m => m.User)
                .WithMany()
                .HasForeignKey(m => m.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<SleepEntry>()
                .HasOne(s => s.User)
                .WithMany()
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<StepEntry>()
                .HasOne(s => s.User)
                .WithMany()
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<RefreshToken>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<EmailOtp>()
                .HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
