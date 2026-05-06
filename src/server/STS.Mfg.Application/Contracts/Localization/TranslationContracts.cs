namespace STS.Mfg.Application.Contracts.Localization;

public sealed record TranslationResourceRequest(
    string? LanguageCode,
    string? Module,
    IReadOnlyCollection<string> Keys);

public sealed record TranslationBundleResponse(
    string LanguageCode,
    IReadOnlyDictionary<string, string> Resources);
