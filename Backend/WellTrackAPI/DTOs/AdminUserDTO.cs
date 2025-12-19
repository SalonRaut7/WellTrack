namespace WellTrackAPI.DTOs
{
    public class AdminUserDTO
    {
        public string Id { get; set; } = null!;
        public string? Email { get; set; }
        public string? Name { get; set; }
        public string? UserName { get; set; }
        public bool EmailConfirmed { get; set; }
        public IList<string> Roles { get; set; } = new List<string>();
    }
}
