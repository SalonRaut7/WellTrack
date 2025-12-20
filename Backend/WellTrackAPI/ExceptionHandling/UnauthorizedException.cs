namespace WellTrackAPI.ExceptionHandling;

public sealed class UnauthorizedException : DomainException
{
    public UnauthorizedException(string message)
        : base(message, StatusCodes.Status401Unauthorized) { }
}
