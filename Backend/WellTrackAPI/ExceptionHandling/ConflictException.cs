namespace WellTrackAPI.ExceptionHandling;

public sealed class ConflictException : DomainException
{
    public ConflictException(string message)
        : base(message, StatusCodes.Status409Conflict) { }
}
