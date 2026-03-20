using System.ComponentModel.DataAnnotations;

namespace WellTrackAPI.DTOs
{
    public class StepDTO
    {
        [Range(1,int.MaxValue, ErrorMessage = "Steps count must be a positive integer.")]
        public int StepsCount { get; set; }
        public string? ActivityType { get; set; }
        public DateTime? Date { get; set; }
    }
}
