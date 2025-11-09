using System.ComponentModel.DataAnnotations;

namespace WellTrackAPI.Models.DTOs
{
    public class HydrationEntryDto
    {
        public int Id { get; set; }
        public double WaterIntakeLiters { get; set; }
        public DateTime Date { get; set; }
    }

    public class CreateHydrationEntryDto
    {
        [Range(0.1, 10.0)]
        public double WaterIntakeLiters { get; set; }
    }

    public class UpdateHydrationEntryDto
    {
        [Range(0.1, 10.0)]
        public double WaterIntakeLiters { get; set; }
    }
}
