using Microsoft.AspNetCore.Mvc;
using WellTrackAPI.Services.Core;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace WellTrackAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ExportController : ControllerBase
    {
        private readonly IExportService _exportService;

        public ExportController(IExportService exportService)
        {
            _exportService = exportService;
        }

        [HttpGet("excel")]
        public async Task<IActionResult> ExportExcel([FromQuery] DateTime? from, [FromQuery] DateTime? to)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User ID not found in token");

            if (from.HasValue && to.HasValue && from.Value > to.Value)
                return BadRequest("'from' cannot be later than 'to'.");

            var fileBytes = await _exportService.ExportAllTrackersToExcelAsync(userId, from, to);

            var fileName =
                from.HasValue || to.HasValue
                    ? $"WellTrack_Export_{DateTime.Now:yyyyMMdd_HHmmss}_Filtered.xlsx"
                    : $"WellTrack_Export_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";

            return File(
                fileBytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                fileName
            );
        }
    }
}