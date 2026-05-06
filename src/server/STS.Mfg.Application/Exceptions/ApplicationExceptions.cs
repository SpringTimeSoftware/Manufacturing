using STS.Mfg.Application.Contracts;

namespace STS.Mfg.Application.Exceptions;

public abstract class AppException : Exception
{
    protected AppException(string message, string errorCode, IReadOnlyCollection<ApiError>? errors = null)
        : base(message)
    {
        ErrorCode = errorCode;
        Errors = errors ?? Array.Empty<ApiError>();
    }

    public string ErrorCode { get; }

    public IReadOnlyCollection<ApiError> Errors { get; }
}

public sealed class ValidationFailureException : AppException
{
    public ValidationFailureException(IReadOnlyCollection<ApiError> errors)
        : base("Validation failed.", "validation.failed", errors)
    {
    }
}

public sealed class BusinessRuleException : AppException
{
    public BusinessRuleException(string message, string errorCode, IReadOnlyCollection<ApiError>? errors = null)
        : base(message, errorCode, errors)
    {
    }
}

public sealed class ResourceNotFoundException : AppException
{
    public ResourceNotFoundException(string message, string errorCode)
        : base(message, errorCode)
    {
    }
}

public sealed class ScopeViolationException : AppException
{
    public ScopeViolationException(string message, string errorCode = "security.scope_denied")
        : base(message, errorCode)
    {
    }
}

public sealed class AuthenticationFailureException : AppException
{
    public AuthenticationFailureException(string message, string errorCode = "auth.unauthorized")
        : base(message, errorCode)
    {
    }
}
