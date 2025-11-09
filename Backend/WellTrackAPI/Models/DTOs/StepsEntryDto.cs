using System.ComponentModel.DataAnnotations;

namespace WellTrackAPI.Models.DTOs
{
    public class StepsEntryDto
    {
        public int Id { get; set; }
        public int Steps { get; set; }
        public string ActivityType { get; set; } = "Walking";
        public DateTime Date { get; set; }
    }

    public class CreateStepsEntryDto
    {
        [Range(0, 100000)]
        public int Steps { get; set; }

        [Required]
        [StringLength(50)]
        public string ActivityType { get; set; } = "Walking";
    }

    public class UpdateStepsEntryDto
    {
        [Range(0, 100000)]
        public int Steps { get; set; }

        [Required]
        [StringLength(50)]
        public string ActivityType { get; set; } = "Walking";
    }
}
