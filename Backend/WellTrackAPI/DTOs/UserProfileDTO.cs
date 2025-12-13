namespace WellTrackAPI.DTOs
{
    public class UserProfileDTO
    {
        public string? Name { get; set; }
        public int? Age { get; set; }
        public string? Gender { get; set; }
        public double? Weight { get; set; }
        public double? Height { get; set; }
        public string? Goals { get; set; }
        public string? Bio { get; set; }
        public string? ProfileImageUrl { get; set; }
        public double? BMI { get; set; } //this is only for reading purpose...
    }
}