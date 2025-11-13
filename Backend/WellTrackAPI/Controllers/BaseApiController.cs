using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WellTrackAPI.Extensions;

namespace WellTrackAPI.Controllers
{
    [ApiController]
    [Authorize]
    public abstract class BaseApiController : ControllerBase
    {
        protected int UserId => User.GetUserId();
    }
}
