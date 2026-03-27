using Microsoft.AspNetCore.Mvc;
using WellTrackAPI.Services.Core;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace WellTrackAPI.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class TemplateController : ControllerBase
    {
        private readonly ITrackerTemplateService _templateService;

        public TemplateController(ITrackerTemplateService templateService)
        {
            _templateService = templateService;
        }

        [HttpGet]
        public IActionResult Download()
        {
            var file = _templateService.GenerateTemplate();
            return File(file,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"WellTrack_Import_Template_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx");
        }
    }
}

