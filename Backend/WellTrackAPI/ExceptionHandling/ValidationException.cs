namespace WellTrackAPI.ExceptionHandling;

public sealed class ValidationException : DomainException
{
    public ValidationException(string message)
        : base(message, StatusCodes.Status400BadRequest) { }
}
