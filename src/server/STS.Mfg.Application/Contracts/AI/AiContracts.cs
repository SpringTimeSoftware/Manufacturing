using STS.Mfg.Application.Contracts;

namespace STS.Mfg.Application.Contracts.AI;

public sealed record AiFilter(
    int Page = 1,
    int PageSize = 25,
    string? Search = null,
    string? Status = null,
    DateTimeOffset? DateFrom = null,
    DateTimeOffset? DateTo = null,
    long? CompanyId = null,
    long? BranchId = null,
    long? AiProviderId = null,
    long? AiModelId = null,
    string? PromptPurpose = null) : QueryFilter(Page, PageSize, Search, Status, DateFrom, DateTo);

public sealed record AiProviderDto(long Id, string ProviderCode, string ProviderName, string ProviderType, string Status);
public sealed record AiProviderUpsertRequest(string ProviderCode, string ProviderName, string ProviderType, string Status);

public sealed record AiModelDto(long Id, long AiProviderId, string ModelCode, string ModelName, string? CapabilityFlagsJson, string Status);
public sealed record AiModelUpsertRequest(long AiProviderId, string ModelCode, string ModelName, string? CapabilityFlagsJson, string Status);

public sealed record AiPromptTemplateDto(long Id, long? CompanyId, string TemplateCode, string TemplateName, string PromptPurpose, string TemplateBody, string Status);
public sealed record AiPromptTemplateUpsertRequest(long? CompanyId, string TemplateCode, string TemplateName, string PromptPurpose, string TemplateBody, string Status);

public sealed record AiRunDto(
    long Id,
    long? CompanyId,
    long? BranchId,
    long AiProviderId,
    long AiModelId,
    long? AiPromptTemplateId,
    string DraftPurpose,
    string? RelatedDocumentType,
    long? RelatedDocumentId,
    string InputText,
    string? OutputText,
    string RunStatus,
    string? TokenUsageJson,
    bool RequiresReview,
    DateTimeOffset RequestedOn,
    DateTimeOffset? CompletedOn,
    string ReviewStatus,
    long? ReviewedByUserId,
    DateTimeOffset? ReviewedOn,
    string? ReviewNote,
    string? AppliedTargetType,
    long? AppliedTargetId);

public sealed record AiDraftRequest(long? CompanyId, long? BranchId, long AiProviderId, long AiModelId, long? AiPromptTemplateId, string DraftPurpose, string InputText, string? RelatedDocumentType = null, long? RelatedDocumentId = null);
public sealed record AiReviewRequest(string ReviewStatus, string? ReviewNote = null, string? AppliedTargetType = null, long? AppliedTargetId = null);

public sealed record TranslationDraftRequest(long? CompanyId, long? BranchId, long AiProviderId, long AiModelId, long? AiPromptTemplateId, string SourceText, string TargetLanguageCode, string? SourceLanguageCode = null, string? RelatedDocumentType = null, long? RelatedDocumentId = null);
public sealed record TranslationDraftDto(AiRunDto Run, string? SourceLanguageCode, string TargetLanguageCode, string DraftText);

public sealed record AiProviderHealthDto(long ProviderId, string ProviderCode, string Status, int ActiveModelCount, string? Notes);

public sealed record AiExecutionPolicyDto(bool DraftOnly, bool AllowsOperationalWriteBack, bool MasksPii, string ReviewRequirement);

public sealed record AiOperationalSignalDto(string Source, string Label, int Count, string Severity, string Explanation);

public sealed record AiDailySummaryRequest(
    long? CompanyId,
    long? BranchId,
    long AiProviderId,
    long AiModelId,
    long? AiPromptTemplateId,
    string ShiftLabel,
    DateOnly SummaryDate,
    IReadOnlyCollection<AiOperationalSignalDto> Signals);

public sealed record AiRiskDigestItemDto(string Label, string Severity, int Count, string Explanation, string ReviewHint);

public sealed record AiDailySummaryDraftDto(AiRunDto Run, string ShiftLabel, DateOnly SummaryDate, IReadOnlyCollection<AiRiskDigestItemDto> RiskDigest, string ReviewStatus);

public sealed record AiAssistantIntentDefinitionDto(
    string IntentCode,
    string DisplayName,
    string Description,
    string ExecutionKind,
    string CommandName,
    IReadOnlyCollection<string> AllowedParameters);

public sealed record AiAssistantParameterDto(string Name, string Value, string Source);

public sealed record AiAssistantPlanRequest(
    long? CompanyId,
    long? BranchId,
    string IntentCode,
    IReadOnlyDictionary<string, string> Parameters,
    string? UserQuestion = null);

public sealed record AiAssistantQueryPlanDto(
    string IntentCode,
    string DisplayName,
    string ExecutionKind,
    string CommandName,
    IReadOnlyCollection<AiAssistantParameterDto> Parameters,
    bool UsesArbitrarySql,
    bool RequiresReview,
    string SafetyNote);

public sealed record MultiLanguageTranslationDraftRequest(
    long? CompanyId,
    long? BranchId,
    long AiProviderId,
    long AiModelId,
    long? AiPromptTemplateId,
    string SourceText,
    IReadOnlyCollection<string> TargetLanguageCodes,
    string? SourceLanguageCode = null,
    string? RelatedDocumentType = null,
    long? RelatedDocumentId = null);

public sealed record MultiLanguageTranslationDraftDto(AiRunDto Run, IReadOnlyDictionary<string, string> DraftsByLanguage, string ReviewStatus);
