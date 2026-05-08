using System.Security.Claims;
using System.Text.Json;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using STS.Mfg.Application.Contracts;

namespace STS.Mfg.Host;

public static class ApiRateLimiting
{
    public const string AuthSensitiveBucket = "auth-sensitive";
    public const string AiBucket = "ai";
    public const string IntegrationBucket = "integration";
    public const string ImportExportBucket = "import-export";
    public const string DefaultBucket = "api-default";

    public static IServiceCollection AddApiRateLimiting(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.OnRejected = static async (context, cancellationToken) =>
            {
                context.HttpContext.Response.ContentType = "application/json";
                var envelope = ApiEnvelope<object>.FailureResult(
                    "Too many requests. Wait briefly and retry the action.",
                    new[] { new ApiError("rate_limit.exceeded", null, "Request rate limit exceeded.") },
                    context.HttpContext.TraceIdentifier);

                await context.HttpContext.Response.WriteAsync(
                    JsonSerializer.Serialize(envelope, new JsonSerializerOptions(JsonSerializerDefaults.Web)),
                    cancellationToken);
            };

            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
            {
                var bucket = ResolveBucket(httpContext.Request.Path);
                var key = BuildPartitionKey(httpContext, bucket);

                return RateLimitPartition.GetFixedWindowLimiter(
                    key,
                    _ => CreateLimiterOptions(bucket));
            });
        });

        return services;
    }

    public static string ResolveBucket(PathString path)
    {
        var value = path.Value ?? string.Empty;

        if (value.Equals("/api/auth/login", StringComparison.OrdinalIgnoreCase) ||
            value.Equals("/api/auth/forgot-password", StringComparison.OrdinalIgnoreCase) ||
            value.Equals("/api/auth/refresh", StringComparison.OrdinalIgnoreCase))
        {
            return AuthSensitiveBucket;
        }

        if (value.StartsWith("/api/ai", StringComparison.OrdinalIgnoreCase))
        {
            return AiBucket;
        }

        if (value.StartsWith("/api/integration", StringComparison.OrdinalIgnoreCase) ||
            value.StartsWith("/api/webhooks", StringComparison.OrdinalIgnoreCase))
        {
            return IntegrationBucket;
        }

        if (value.StartsWith("/api/import", StringComparison.OrdinalIgnoreCase) ||
            value.StartsWith("/api/export", StringComparison.OrdinalIgnoreCase))
        {
            return ImportExportBucket;
        }

        return DefaultBucket;
    }

    public static FixedWindowRateLimiterOptions CreateLimiterOptions(string bucket)
    {
        var limit = bucket switch
        {
            AuthSensitiveBucket => 12,
            AiBucket => 60,
            IntegrationBucket => 45,
            ImportExportBucket => 30,
            _ => 600
        };

        return new FixedWindowRateLimiterOptions
        {
            AutoReplenishment = true,
            PermitLimit = limit,
            QueueLimit = 0,
            Window = TimeSpan.FromMinutes(1)
        };
    }

    private static string BuildPartitionKey(HttpContext httpContext, string bucket)
    {
        var userId =
            httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier) ??
            httpContext.User.FindFirstValue("sub");

        var actor = !string.IsNullOrWhiteSpace(userId)
            ? $"user:{userId}"
            : $"ip:{httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown"}";

        return $"{bucket}:{actor}";
    }
}
