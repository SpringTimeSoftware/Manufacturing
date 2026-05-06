namespace STS.Mfg.Infrastructure.Configuration;

public sealed class LocalizationOptions
{
    public const string SectionName = "Localization";

    public string DefaultLanguageCode { get; init; } = "en-IN";
}
