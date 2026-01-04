using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WellTrackAPI.Services;

namespace WellTrackAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AnalyticsController : ControllerBase
{
    private readonly IStepAnalyticsService _steps;
    private readonly ISleepAnalyticsService _sleep;
    private readonly IHydrationAnalyticsService _hydration;
    private readonly IFoodAnalyticsService _food;
    public AnalyticsController(
        IStepAnalyticsService steps,
        ISleepAnalyticsService sleep,
        IHydrationAnalyticsService hydration,
        IFoodAnalyticsService food
    )
    {
        _steps = steps;
        _sleep = sleep;
        _hydration = hydration;
        _food = food;
    }

    private string UserId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet("steps")]
    public async Task<IActionResult> GetStepsChart([FromQuery] string range = "week")
        => Ok(await _steps.GetStepsChartAsync(UserId, range));

    [HttpGet("sleep")]
    public async Task<IActionResult> GetSleepChart([FromQuery] string range = "week")
        => Ok(await _sleep.GetSleepChartAsync(UserId, range));

    [HttpGet("hydration")]
    public async Task<IActionResult> GetHydrationChart([FromQuery] string range = "week")
        => Ok(await _hydration.GetHydrationChartAsync(UserId, range));
    
    [HttpGet("food")]
    public async Task<IActionResult> GetFoodChart([FromQuery] string range = "week")
        => Ok(await _food.GetFoodChartAsync(UserId, range));

}
