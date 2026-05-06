using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Exceptions;

namespace STS.Mfg.Api.Middleware;

public sealed class ApiExceptionHandlingMiddleware(
    RequestDelegate next,
    ILogger<ApiExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext httpContext)
    {
        try
        {
            await next(httpContext);
        }
        catch (Exception exception) when (!httpContext.Response.HasStarted)
        {
            await WriteFailureAsync(httpContext, exception);
        }
    }

    private async Task WriteFailureAsync(HttpContext httpContext, Exception exception)
    {
        var (statusCode, message, errors) = exception switch
        {
            ValidationFailureException validationFailure => (
                StatusCodes.Status400BadRequest,
                validationFailure.Message,
                validationFailure.Errors),
            AuthenticationFailureException authenticationFailure => (
                StatusCodes.Status401Unauthorized,
                authenticationFailure.Message,
                BuildErrors(authenticationFailure)),
            ScopeViolationException scopeViolation => (
                StatusCodes.Status403Forbidden,
                scopeViolation.Message,
                BuildErrors(scopeViolation)),
            ResourceNotFoundException resourceNotFound => (
                StatusCodes.Status404NotFound,
                resourceNotFound.Message,
                BuildErrors(resourceNotFound)),
            BusinessRuleException businessRule => (
                StatusCodes.Status409Conflict,
                businessRule.Message,
                businessRule.Errors.Count > 0 ? businessRule.Errors : BuildErrors(businessRule)),
            _ => (
                StatusCodes.Status500InternalServerError,
                "The server encountered an unexpected error.",
                new[] { new ApiError("server.unhandled", null, "The server encountered an unexpected error.") })
        };

        if (statusCode >= 500)
        {
            logger.LogError(exception, "Unhandled API exception for correlation {CorrelationId}.", httpContext.TraceIdentifier);
        }
        else if (statusCode >= 400)
        {
            logger.LogWarning(exception, "Handled API exception for correlation {CorrelationId}.", httpContext.TraceIdentifier);
        }

        httpContext.Response.StatusCode = statusCode;
        httpContext.Response.ContentType = "application/json";

        var envelope = ApiEnvelope<object>.FailureResult(message, errors, httpContext.TraceIdentifier);
        await httpContext.Response.WriteAsync(JsonSerializer.Serialize(envelope, new JsonSerializerOptions(JsonSerializerDefaults.Web)));
    }

    private static IReadOnlyCollection<ApiError> BuildErrors(AppException exception)
    {
        return exception.Errors.Count > 0
            ? exception.Errors
            : new[] { new ApiError(exception.ErrorCode, null, exception.Message) };
    }
}
