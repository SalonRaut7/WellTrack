using System.ComponentModel.DataAnnotations;

namespace WellTrackAPI.Models.DTOs
{
    public class SleepEntryDto
    {
        public int Id { get; set; }
        public double Hours { get; set; }
        public string Quality { get; set; } = string.Empty;
        public DateTime Date { get; set; }
    }

    public class CreateSleepEntryDto
    {
        [Range(0.1, 24)]
        public double Hours { get; set; }

        [Required]
        [StringLength(50)]
        public string Quality { get; set; } = string.Empty;
    }

    public class UpdateSleepEntryDto
    {
        [Range(0.1, 24)]
        public double Hours { get; set; }

        [Required]
        [StringLength(50)]
        public string Quality { get; set; } = string.Empty;
    }
}
