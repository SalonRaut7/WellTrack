using WellTrackAPI.DTOs;
public interface IImportService
{
    Task<ImportPreviewDto> ParseAndValidateAsync(IFormFile file, string userId, string rangeMode, DateTime? from = null, DateTime? to = null);
    Task SaveAsync(ImportPreviewDto dto, string userId, bool overwriteConflicts);
}