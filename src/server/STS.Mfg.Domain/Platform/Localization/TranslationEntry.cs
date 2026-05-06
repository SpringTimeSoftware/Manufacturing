using STS.Mfg.Domain.Abstractions;

namespace STS.Mfg.Domain.Platform.Localization;

public sealed class TranslationEntry : AggregateRoot, ICompanyScoped, IBranchScoped
{
    private TranslationEntry()
    {
    }

    private TranslationEntry(
        string languageCode,
        string translationKey,
        string translationValue,
        string? module,
        long? companyId,
        long? branchId)
    {
        LanguageCode = languageCode;
        TranslationKey = translationKey;
        TranslationValue = translationValue;
        Module = module;
        CompanyId = companyId;
        BranchId = branchId;
        CreatedOn = DateTimeOffset.UtcNow;
    }

    public string LanguageCode { get; private set; } = string.Empty;

    public string TranslationKey { get; private set; } = string.Empty;

    public string TranslationValue { get; private set; } = string.Empty;

    public string? Module { get; private set; }

    public long? CompanyId { get; private set; }

    public long? BranchId { get; private set; }

    public DateTimeOffset CreatedOn { get; private set; }

    public static TranslationEntry Create(
        string languageCode,
        string translationKey,
        string translationValue,
        string? module,
        long? companyId,
        long? branchId)
    {
        return new TranslationEntry(languageCode, translationKey, translationValue, module, companyId, branchId);
    }
}
