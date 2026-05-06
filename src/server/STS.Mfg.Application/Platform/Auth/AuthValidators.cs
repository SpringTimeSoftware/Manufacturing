using STS.Mfg.Application.Abstractions.Validation;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Auth;

namespace STS.Mfg.Application.Platform.Auth;

public sealed class LoginRequestValidator : Validator<LoginRequest>
{
    public override Task<IReadOnlyCollection<ApiError>> ValidateAsync(LoginRequest instance, CancellationToken cancellationToken = default)
    {
        var errors = new List<ApiError>();

        if (string.IsNullOrWhiteSpace(instance.UserName))
        {
            errors.Add(new ApiError("validation.required", nameof(instance.UserName), "User name is required."));
        }

        if (string.IsNullOrWhiteSpace(instance.Password))
        {
            errors.Add(new ApiError("validation.required", nameof(instance.Password), "Password is required."));
        }

        if (instance.BranchId.HasValue && !instance.CompanyId.HasValue)
        {
            errors.Add(new ApiError("validation.required", nameof(instance.CompanyId), "Company is required when branch is provided."));
        }

        return Task.FromResult<IReadOnlyCollection<ApiError>>(errors);
    }
}

public sealed class RefreshTokenRequestValidator : Validator<RefreshTokenRequest>
{
    public override Task<IReadOnlyCollection<ApiError>> ValidateAsync(RefreshTokenRequest instance, CancellationToken cancellationToken = default)
    {
        IReadOnlyCollection<ApiError> errors = string.IsNullOrWhiteSpace(instance.RefreshToken)
            ? new[] { new ApiError("validation.required", nameof(instance.RefreshToken), "Refresh token is required.") }
            : Array.Empty<ApiError>();

        return Task.FromResult(errors);
    }
}

public sealed class LogoutRequestValidator : Validator<LogoutRequest>
{
    public override Task<IReadOnlyCollection<ApiError>> ValidateAsync(LogoutRequest instance, CancellationToken cancellationToken = default)
    {
        if (instance.RevokeAll || !string.IsNullOrWhiteSpace(instance.RefreshToken))
        {
            return Task.FromResult<IReadOnlyCollection<ApiError>>(Array.Empty<ApiError>());
        }

        return Task.FromResult<IReadOnlyCollection<ApiError>>(new[]
        {
            new ApiError("validation.required", nameof(instance.RefreshToken), "Refresh token is required unless revoke-all is requested.")
        });
    }
}

public sealed class SwitchOperatingContextRequestValidator : Validator<SwitchOperatingContextRequest>
{
    public override Task<IReadOnlyCollection<ApiError>> ValidateAsync(
        SwitchOperatingContextRequest instance,
        CancellationToken cancellationToken = default)
    {
        var errors = new List<ApiError>();

        if (instance.CompanyId <= 0)
        {
            errors.Add(new ApiError("validation.range", nameof(instance.CompanyId), "Company must be greater than zero."));
        }

        if (instance.BranchId <= 0)
        {
            errors.Add(new ApiError("validation.range", nameof(instance.BranchId), "Branch must be greater than zero."));
        }

        return Task.FromResult<IReadOnlyCollection<ApiError>>(errors);
    }
}
