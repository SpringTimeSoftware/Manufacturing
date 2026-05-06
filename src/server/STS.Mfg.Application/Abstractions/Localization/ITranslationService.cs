using STS.Mfg.Application.Contracts.Localization;

namespace STS.Mfg.Application.Abstractions.Localization;

public interface ITranslationService
{
    Task<TranslationBundleResponse> GetResourcesAsync(
        TranslationResourceRequest request,
        CancellationToken cancellationToken = default);
}
