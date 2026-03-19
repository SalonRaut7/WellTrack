using WellTrackAPI.DTOs;

namespace WellTrackAPI.Services.Admin
{
    public interface IAdminReportService
    {
        Task<AdminReportsDTO> GetReportsAsync();
    }
}