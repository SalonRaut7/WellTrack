using Microsoft.AspNetCore.Mvc;
using WellTrackAPI.Services.Interfaces;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using WellTrackAPI.DTOs;

namespace WellTrackAPI.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class ImportController : ControllerBase
    {
        private readonly IImportService _importService;

        public ImportController(IImportService importService)
        {
            _importService = importService;
        }

        [HttpPost("preview")]
        public async Task<IActionResult> Preview(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User ID not found in token");

            var preview = await _importService.ParseAndValidateAsync(file, userId);
            return Ok(preview);
        }
        [HttpPost("confirm")]
        public async Task<IActionResult> ConfirmImport([FromBody] ImportPreviewDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User ID not found in token");

            if (dto == null)
                return BadRequest("Invalid import data.");

            await _importService.SaveAsync(dto, userId);
            return Ok(new { Message = "Imported successfully" });
        }
    }
    
}
