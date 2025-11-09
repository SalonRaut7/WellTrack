using System.ComponentModel.DataAnnotations;

namespace WellTrackAPI.Models.DTOs
{
    public class HabitEntryDto
    {
        public int Id { get; set; }
        public string HabitName { get; set; } = string.Empty;
        public bool Completed { get; set; }
    }

    public class CreateHabitEntryDto
    {
        [Required]
        [StringLength(100, MinimumLength = 1)]
        public string HabitName { get; set; } = string.Empty;
    }

    public class UpdateHabitEntryDto
    {
        [Required]
        [StringLength(100, MinimumLength = 1)]
        public string HabitName { get; set; } = string.Empty;

        public bool Completed { get; set; }
    }
}
