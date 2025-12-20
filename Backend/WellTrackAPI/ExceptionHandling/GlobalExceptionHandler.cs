using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace WellTrackAPI.ExceptionHandling;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext context,
        Exception exception,
        CancellationToken cancellationToken)
    {
        ProblemDetails problem;

        if (exception is DomainException domainEx)
        {
            _logger.LogWarning(
                domainEx,
                "Domain error: {Message}",
                domainEx.Message
            );

            problem = new ProblemDetails
            {
                Status = domainEx.StatusCode,
                Title = domainEx.GetType().Name,
                Detail = domainEx.Message,
                Instance = context.Request.Path
            };
        }
        else
        {
            _logger.LogError(
                exception,
                "Unhandled exception. TraceId: {TraceId}",
                context.TraceIdentifier
            );

            problem = new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Internal Server Error",
                Detail = "An unexpected error occurred.",
                Instance = context.Request.Path
            };
        }

        problem.Extensions["traceId"] = context.TraceIdentifier;

        context.Response.StatusCode = problem.Status!.Value;
        context.Response.ContentType = "application/problem+json";

        await context.Response.WriteAsJsonAsync(problem, cancellationToken);
        return true;
    }
}
