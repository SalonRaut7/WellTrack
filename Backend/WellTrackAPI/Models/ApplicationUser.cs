using Microsoft.AspNetCore.Identity;

namespace WellTrackAPI.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string? Name { get; set; }
        public int? Age { get; set; }
        public string? Gender { get; set; }
        public double? Weight { get; set; }
        public string? Goals { get; set; }
    }
}
