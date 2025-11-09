using System.ComponentModel.DataAnnotations;

namespace WellTrackAPI.Models.DTOs
{
    public class MoodEntryDto
    {
        public int Id { get; set; }
        public string Mood { get; set; } = string.Empty;
        public string Notes { get; set; } = string.Empty;
        public DateTime Date { get; set; }
    }

    public class CreateMoodEntryDto
    {
        [Required]
        [StringLength(50)]
        public string Mood { get; set; } = string.Empty;

        [StringLength(250)]
        public string? Notes { get; set; }
    }

    public class UpdateMoodEntryDto
    {
        [Required]
        [StringLength(50)]
        public string Mood { get; set; } = string.Empty;

        [StringLength(250)]
        public string? Notes { get; set; }
    }
}
