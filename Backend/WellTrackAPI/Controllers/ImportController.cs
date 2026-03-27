using Microsoft.AspNetCore.Mvc;
using WellTrackAPI.Services.Core;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using WellTrackAPI.DTOs;
using Microsoft.Extensions.Options;

namespace WellTrackAPI.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class ImportController : ControllerBase
    {
        private readonly IImportService _importService;
        private readonly long MaxFileSizeBytes;
        public ImportController(IImportService importService, IOptions<ImportSettings> importSettings)
        {
            _importService = importService;
            MaxFileSizeBytes = importSettings.Value.MaxFileSizeBytes;
        }

        [HttpPost("preview")]
        public async Task<IActionResult> Preview(
            IFormFile file,
            [FromQuery] string rangeMode = "all",
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            if (file.Length > MaxFileSizeBytes)
                return BadRequest($"File is too large. Maximum allowed size is {MaxFileSizeBytes / (1024 * 1024)} MB.");

            if (!file.FileName.EndsWith(".xlsx", StringComparison.OrdinalIgnoreCase))
                return BadRequest("Only .xlsx Excel files are supported.");

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User ID not found in token");

            if (!string.Equals(rangeMode, "all", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(rangeMode, "today", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(rangeMode, "range", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest("rangeMode must be 'all', 'today', or 'range'.");
            }

            if (string.Equals(rangeMode, "range", StringComparison.OrdinalIgnoreCase))
            {
                if (!from.HasValue && !to.HasValue)
                    return BadRequest("For rangeMode='range', provide at least one of 'from' or 'to'.");

                if (from.HasValue && to.HasValue && from.Value > to.Value)
                    return BadRequest("'from' cannot be later than 'to'.");
            }

            var preview = await _importService.ParseAndValidateAsync(file, userId, rangeMode, from, to);
            return Ok(preview);
        }

        [HttpPost("confirm")]
        public async Task<IActionResult> ConfirmImport([FromBody] ImportConfirmRequestDto request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User ID not found in token");

            if (request?.Preview == null)
                return BadRequest("Invalid import data.");

            await _importService.SaveAsync(request.Preview, userId, request.OverwriteConflicts);
            return Ok(new { Message = "Imported successfully" });
        }
    }
}