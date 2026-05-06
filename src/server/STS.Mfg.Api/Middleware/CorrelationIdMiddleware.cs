using Microsoft.AspNetCore.Http;

namespace STS.Mfg.Api.Middleware;

public sealed class CorrelationIdMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext httpContext)
    {
        var correlationId = httpContext.Request.Headers.TryGetValue("X-Correlation-Id", out var existing)
            && !string.IsNullOrWhiteSpace(existing.ToString())
                ? existing.ToString()
                : Guid.NewGuid().ToString("N");

        httpContext.TraceIdentifier = correlationId;
        httpContext.Response.Headers["X-Correlation-Id"] = correlationId;

        await next(httpContext);
    }
}
