using WellTrackAPI.DTOs;
public interface IImportService
{
    Task<ImportPreviewDto> ParseAndValidateAsync(IFormFile file, string userId);
    Task SaveAsync(ImportPreviewDto dto, string userId);
}