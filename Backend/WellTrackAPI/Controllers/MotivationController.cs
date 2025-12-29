using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WellTrackAPI.Services;

namespace WellTrackAPI.Controllers;

[ApiController]
[Route("api/motivation")]
public class MotivationController : ControllerBase
{
    private readonly IMotivationService _service;

    public MotivationController(IMotivationService service)
    {
        _service = service;
    }

    [HttpGet("today")]
    [Authorize]
    public async Task<IActionResult> GetToday()
    {
        var result = await _service.GetTodayMotivationAsync();
        return Ok(result);
    }
}
