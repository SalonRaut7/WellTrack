using Microsoft.AspNetCore.Mvc;
using WellTrackAPI.Services.Interfaces;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace WellTrackAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ExportController : ControllerBase
    {
        private readonly ITrackerExportService _exportService;

        public ExportController(ITrackerExportService exportService)
        {
            _exportService = exportService;
        }

        [HttpGet("excel")]
        public async Task<IActionResult> ExportExcel()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized("User ID not found in token");

                var fileBytes = await _exportService.ExportAllTrackersToExcelAsync(userId);

                return File(
                    fileBytes,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    $"WellTrack_Export_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx"
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error exporting to Excel", error = ex.Message });
            }
        }
    }
}