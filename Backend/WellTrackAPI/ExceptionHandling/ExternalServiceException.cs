namespace WellTrackAPI.ExceptionHandling;

public sealed class ExternalServiceException : DomainException
{
    public ExternalServiceException(string message)
        : base(message, StatusCodes.Status503ServiceUnavailable) { }
}
