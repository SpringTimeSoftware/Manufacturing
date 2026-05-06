using STS.Mfg.Application.Abstractions.Validation;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Localization;

namespace STS.Mfg.Application.Platform.Localization;

public sealed class TranslationResourceRequestValidator : Validator<TranslationResourceRequest>
{
    public override Task<IReadOnlyCollection<ApiError>> ValidateAsync(
        TranslationResourceRequest instance,
        CancellationToken cancellationToken = default)
    {
        if (instance.Keys.Count > 0 || !string.IsNullOrWhiteSpace(instance.Module))
        {
            return Task.FromResult<IReadOnlyCollection<ApiError>>(Array.Empty<ApiError>());
        }

        return Task.FromResult<IReadOnlyCollection<ApiError>>(new[]
        {
            new ApiError("validation.required", nameof(instance.Keys), "Provide one or more keys or a module name.")
        });
    }
}
