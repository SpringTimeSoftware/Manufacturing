namespace STS.Mfg.Application.Contracts;

public sealed record ApiError(string Code, string? Field, string Message);

public sealed record ApiMetadata(string CorrelationId, DateTimeOffset TimestampUtc);

public sealed record ApiEnvelope<T>(
    bool Success,
    string? Message,
    T? Data,
    IReadOnlyCollection<ApiError> Errors,
    ApiMetadata Meta)
{
    public static ApiEnvelope<T> SuccessResult(T? data, string? message, string correlationId) =>
        new(true, message, data, Array.Empty<ApiError>(), new ApiMetadata(correlationId, DateTimeOffset.UtcNow));

    public static ApiEnvelope<T> FailureResult(
        string message,
        IReadOnlyCollection<ApiError> errors,
        string correlationId) =>
        new(false, message, default, errors, new ApiMetadata(correlationId, DateTimeOffset.UtcNow));
}

public sealed record PagedResult<T>(
    IReadOnlyCollection<T> Items,
    int Page,
    int PageSize,
    int TotalCount,
    int TotalPages);
