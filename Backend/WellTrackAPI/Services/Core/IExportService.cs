namespace WellTrackAPI.Services.Interfaces
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