using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.AI;

namespace STS.Mfg.Application.Abstractions.AI;

public interface IAiService
{
    Task<PagedResult<AiProviderDto>> ListProvidersAsync(AiFilter filter, CancellationToken cancellationToken = default);
    Task<AiProviderDto> GetProviderAsync(long id, CancellationToken cancellationToken = default);
    Task<AiProviderDto> CreateProviderAsync(AiProviderUpsertRequest request, CancellationToken cancellationToken = default);
    Task<AiProviderDto> UpdateProviderAsync(long id, AiProviderUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<AiModelDto>> ListModelsAsync(AiFilter filter, CancellationToken cancellationToken = default);
    Task<AiModelDto> GetModelAsync(long id, CancellationToken cancellationToken = default);
    Task<AiModelDto> CreateModelAsync(AiModelUpsertRequest request, CancellationToken cancellationToken = default);
    Task<AiModelDto> UpdateModelAsync(long id, AiModelUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<AiPromptTemplateDto>> ListPromptTemplatesAsync(AiFilter filter, CancellationToken cancellationToken = default);
    Task<AiPromptTemplateDto> GetPromptTemplateAsync(long id, CancellationToken cancellationToken = default);
    Task<AiPromptTemplateDto> CreatePromptTemplateAsync(AiPromptTemplateUpsertRequest request, CancellationToken cancellationToken = default);
    Task<AiPromptTemplateDto> UpdatePromptTemplateAsync(long id, AiPromptTemplateUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<AiRunDto>> ListRunsAsync(AiFilter filter, CancellationToken cancellationToken = default);
    Task<AiRunDto> GetRunAsync(long id, CancellationToken cancellationToken = default);
    Task<AiRunDto> CreateDraftRunAsync(AiDraftRequest request, CancellationToken cancellationToken = default);
    Task<AiRunDto> ReviewRunAsync(long id, AiReviewRequest request, CancellationToken cancellationToken = default);
    Task<TranslationDraftDto> CreateTranslationDraftAsync(TranslationDraftRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<AiProviderHealthDto>> GetProviderHealthAsync(CancellationToken cancellationToken = default);
    Task<AiExecutionPolicyDto> GetExecutionPolicyAsync(CancellationToken cancellationToken = default);
    Task<AiDailySummaryDraftDto> CreateDailySummaryDraftAsync(AiDailySummaryRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<AiAssistantIntentDefinitionDto>> ListAssistantIntentsAsync(CancellationToken cancellationToken = default);
    Task<AiAssistantQueryPlanDto> CreateAssistantPlanAsync(AiAssistantPlanRequest request, CancellationToken cancellationToken = default);
    Task<MultiLanguageTranslationDraftDto> CreateMultiLanguageTranslationDraftAsync(MultiLanguageTranslationDraftRequest request, CancellationToken cancellationToken = default);
}
