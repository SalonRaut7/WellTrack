namespace WellTrackAPI.Services.Interfaces
{
    public interface ITrackerExportService
    {
        Task<byte[]> ExportAllTrackersToExcelAsync(
            string userId,
            DateTime? from = null,
            DateTime? to = null
        );
    }
}