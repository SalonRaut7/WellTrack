namespace WellTrackAPI.Services.Core
{
    public interface IExportService
    {
        Task<byte[]> ExportAllTrackersToExcelAsync(
            string userId,
            DateTime? from = null,
            DateTime? to = null
        );
    }
}