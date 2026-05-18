using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using STS.Mfg.Application.AI;
using STS.Mfg.Application.Abstractions.AI;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.AI;
using STS.Mfg.Domain.AI;
using STS.Mfg.Infrastructure.Application;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Infrastructure.AI;

internal sealed class AiService(
    MfgDbContext dbContext,
    IDataScopeService dataScopeService,
    ICurrentUserContextAccessor currentUserContextAccessor,
    IAuditTrail auditTrail)
    : ApplicationServiceBase(dbContext, dataScopeService, currentUserContextAccessor, auditTrail), IAiService
{
    private static readonly Regex EmailRegex = new(@"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", RegexOptions.Compiled | RegexOptions.IgnoreCase);
    private static readonly Regex PhoneRegex = new(@"\b(?:\+?\d[\d\-\s]{7,}\d)\b", RegexOptions.Compiled);

    public async Task<PagedResult<AiProviderDto>> ListProvidersAsync(AiFilter filter, CancellationToken cancellationToken = default)
    {
        var query = DbContext.AiProviders.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.ProviderCode.Contains(search) || entity.ProviderName.Contains(search));
        }

        var page = await query.OrderBy(entity => entity.ProviderCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapProvider);
    }

    public async Task<AiProviderDto> GetProviderAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await DbContext.AiProviders.AsNoTracking().FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "AI provider was not found.", "ai.provider_not_found");
        return MapProvider(entity);
    }

    public async Task<AiProviderDto> CreateProviderAsync(AiProviderUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateProvider(request);
        var entity = AiProvider.Create(request.ProviderCode, request.ProviderName, request.ProviderType, request.Status, GetUserId());
        DbContext.AiProviders.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapProvider(entity);
        await WriteAuditAsync("ai", nameof(AiProvider), "ai.provider.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<AiProviderDto> UpdateProviderAsync(long id, AiProviderUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateProvider(request);
        var entity = await DbContext.AiProviders.FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "AI provider was not found.", "ai.provider_not_found");

        var before = MapProvider(entity);
        entity.Update(request.ProviderCode, request.ProviderName, request.ProviderType, request.Status, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapProvider(entity);
        await WriteAuditAsync("ai", nameof(AiProvider), "ai.provider.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<AiModelDto>> ListModelsAsync(AiFilter filter, CancellationToken cancellationToken = default)
    {
        var query = DbContext.AiModels.AsNoTracking().AsQueryable();
        if (filter.AiProviderId.HasValue)
        {
            query = query.Where(entity => entity.AiProviderId == filter.AiProviderId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.ModelCode.Contains(search) || entity.ModelName.Contains(search));
        }

        var page = await query.OrderBy(entity => entity.ModelCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapModel);
    }

    public async Task<AiModelDto> GetModelAsync(long id, CancellationToken cancellationToken = default)
    {
        var entity = await DbContext.AiModels.AsNoTracking().FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "AI model was not found.", "ai.model_not_found");
        return MapModel(entity);
    }

    public async Task<AiModelDto> CreateModelAsync(AiModelUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateModel(request);
        await EnsureAiProviderExistsAsync(request.AiProviderId, cancellationToken);

        var entity = AiModel.Create(request.AiProviderId, request.ModelCode, request.ModelName, request.CapabilityFlagsJson, request.Status, GetUserId());
        DbContext.AiModels.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapModel(entity);
        await WriteAuditAsync("ai", nameof(AiModel), "ai.model.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<AiModelDto> UpdateModelAsync(long id, AiModelUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateModel(request);
        var entity = await DbContext.AiModels.FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "AI model was not found.", "ai.model_not_found");
        ThrowIfInvalid(Immutable(entity.AiProviderId, request.AiProviderId, nameof(request.AiProviderId), "AI model provider cannot be changed."));

        var before = MapModel(entity);
        entity.Update(request.ModelCode, request.ModelName, request.CapabilityFlagsJson, request.Status, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapModel(entity);
        await WriteAuditAsync("ai", nameof(AiModel), "ai.model.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<AiPromptTemplateDto>> ListPromptTemplatesAsync(AiFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.AiPromptTemplates.AsNoTracking().ApplyCompanyScope(scope);
        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value || entity.CompanyId == null);
        }

        if (!string.IsNullOrWhiteSpace(filter.PromptPurpose))
        {
            var promptPurpose = filter.PromptPurpose.Trim();
            query = query.Where(entity => entity.PromptPurpose == promptPurpose);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.TemplateCode.Contains(search) || entity.TemplateName.Contains(search));
        }

        var page = await query.OrderBy(entity => entity.TemplateCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapTemplate);
    }

    public async Task<AiPromptTemplateDto> GetPromptTemplateAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.AiPromptTemplates.AsNoTracking().ApplyCompanyScope(scope).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "AI prompt template was not found in the active scope.", "ai.template_not_found");
        return MapTemplate(entity);
    }

    public async Task<AiPromptTemplateDto> CreatePromptTemplateAsync(AiPromptTemplateUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateTemplate(request);
        EnsureContextAccess(request.CompanyId, null);

        var entity = AiPromptTemplate.Create(request.CompanyId, request.TemplateCode, request.TemplateName, request.PromptPurpose, request.TemplateBody, request.Status, GetUserId());
        DbContext.AiPromptTemplates.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapTemplate(entity);
        await WriteAuditAsync("ai", nameof(AiPromptTemplate), "ai.template.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<AiPromptTemplateDto> UpdatePromptTemplateAsync(long id, AiPromptTemplateUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateTemplate(request);
        var scope = GetScope();
        var entity = await DbContext.AiPromptTemplates.ApplyCompanyScope(scope).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "AI prompt template was not found in the active scope.", "ai.template_not_found");
        ThrowIfInvalid(Immutable(entity.CompanyId, request.CompanyId, nameof(request.CompanyId), "Prompt-template company cannot be changed."));

        var before = MapTemplate(entity);
        entity.Update(request.TemplateCode, request.TemplateName, request.PromptPurpose, request.TemplateBody, request.Status, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapTemplate(entity);
        await WriteAuditAsync("ai", nameof(AiPromptTemplate), "ai.template.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<AiRunDto>> ListRunsAsync(AiFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.AiRuns.AsNoTracking().ApplyActiveOrganizationScope(scope);
        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        if (filter.AiProviderId.HasValue)
        {
            query = query.Where(entity => entity.AiProviderId == filter.AiProviderId.Value);
        }

        if (filter.AiModelId.HasValue)
        {
            query = query.Where(entity => entity.AiModelId == filter.AiModelId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.RunStatus == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity =>
                entity.DraftPurpose.Contains(search) ||
                entity.InputText.Contains(search) ||
                (entity.RelatedDocumentType != null && entity.RelatedDocumentType.Contains(search)));
        }

        var page = await query.OrderByDescending(entity => entity.RequestedOn).ThenByDescending(entity => entity.Id).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapRun);
    }

    public async Task<AiRunDto> GetRunAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.AiRuns.AsNoTracking().ApplyActiveOrganizationScope(scope).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "AI run was not found in the active scope.", "ai.run_not_found");
        return MapRun(entity);
    }

    public async Task<AiRunDto> CreateDraftRunAsync(AiDraftRequest request, CancellationToken cancellationToken = default)
    {
        ValidateDraft(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);
        await EnsureAiReferencesAsync(request.AiProviderId, request.AiModelId, request.AiPromptTemplateId, cancellationToken);

        var template = request.AiPromptTemplateId.HasValue
            ? await DbContext.AiPromptTemplates.AsNoTracking().FirstOrDefaultAsync(record => record.Id == request.AiPromptTemplateId.Value, cancellationToken)
            : null;

        var maskedInput = MaskSensitiveText(request.InputText);
        var draftText = BuildDraftText(request.DraftPurpose, template?.TemplateBody, maskedInput, null, null);
        var tokenUsage = BuildTokenUsageJson(maskedInput, draftText);
        var entity = AiRun.Create(
            request.CompanyId,
            request.BranchId,
            request.AiProviderId,
            request.AiModelId,
            request.AiPromptTemplateId,
            request.DraftPurpose,
            request.RelatedDocumentType,
            request.RelatedDocumentId,
            maskedInput,
            draftText,
            "Draft",
            tokenUsage,
            true,
            GetUserId());

        DbContext.AiRuns.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapRun(entity);
        await WriteAuditAsync("ai", nameof(AiRun), "ai.run.draft", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<AiRunDto> ReviewRunAsync(long id, AiReviewRequest request, CancellationToken cancellationToken = default)
    {
        ValidateReview(request);
        var scope = GetScope();
        var entity = await DbContext.AiRuns.ApplyActiveOrganizationScope(scope).FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "AI draft was not found in the active scope.", "ai.run_not_found");

        var before = MapRun(entity);
        ThrowIfInvalid(!entity.RequiresReview && !request.ReviewStatus.Equals("Applied", StringComparison.OrdinalIgnoreCase)
            ? new ApiError("ai.review_not_required", nameof(request.ReviewStatus), "This AI draft no longer requires review.")
            : null);

        entity.Review(request.ReviewStatus, request.ReviewNote, request.AppliedTargetType, request.AppliedTargetId, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapRun(entity);
        await WriteAuditAsync("ai", nameof(AiRun), "ai.run.review", entity.Id, before, after, cancellationToken);
        return after;
    }


    public async Task<TranslationDraftDto> CreateTranslationDraftAsync(TranslationDraftRequest request, CancellationToken cancellationToken = default)
    {
        ValidateTranslationDraft(request);
        var draft = await CreateDraftRunAsync(
            new AiDraftRequest(
                request.CompanyId,
                request.BranchId,
                request.AiProviderId,
                request.AiModelId,
                request.AiPromptTemplateId,
                "Translate",
                MaskSensitiveText(request.SourceText),
                request.RelatedDocumentType,
                request.RelatedDocumentId),
            cancellationToken);

        var translated = BuildDraftText("Translate", null, MaskSensitiveText(request.SourceText), request.SourceLanguageCode, request.TargetLanguageCode);
        var entity = await DbContext.AiRuns.FirstOrDefaultAsync(record => record.Id == draft.Id, cancellationToken);
        if (entity is not null)
        {
            entity.Update(entity.DraftPurpose, entity.RelatedDocumentType, entity.InputText, translated, entity.RunStatus, entity.TokenUsageJson, entity.RequiresReview, GetUserId());
            await DbContext.SaveChangesAsync(cancellationToken);
        }

        var refreshed = await GetRunAsync(draft.Id, cancellationToken);
        return new TranslationDraftDto(refreshed, request.SourceLanguageCode, request.TargetLanguageCode, translated);
    }

    public Task<AiExecutionPolicyDto> GetExecutionPolicyAsync(CancellationToken cancellationToken = default)
    {
        _ = cancellationToken;
        return Task.FromResult(new AiExecutionPolicyDto(
            DraftOnly: true,
            AllowsOperationalWriteBack: false,
            MasksPii: true,
            ReviewRequirement: "AI outputs are stored as drafts in AiRuns and require human review before notification, status, or document use."));
    }

    public async Task<AiDailySummaryDraftDto> CreateDailySummaryDraftAsync(AiDailySummaryRequest request, CancellationToken cancellationToken = default)
    {
        ValidateDailySummary(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);
        await EnsureAiReferencesAsync(request.AiProviderId, request.AiModelId, request.AiPromptTemplateId, cancellationToken);

        var template = request.AiPromptTemplateId.HasValue
            ? await DbContext.AiPromptTemplates.AsNoTracking().FirstOrDefaultAsync(record => record.Id == request.AiPromptTemplateId.Value, cancellationToken)
            : null;

        var digest = BuildRiskDigest(request.Signals);
        var inputText = MaskSensitiveText(BuildSummaryInput(request));
        var outputText = BuildDailySummaryOutput(request, digest, template?.TemplateBody);
        var tokenUsage = BuildTokenUsageJson(inputText, outputText);
        var entity = AiRun.Create(
            request.CompanyId,
            request.BranchId,
            request.AiProviderId,
            request.AiModelId,
            request.AiPromptTemplateId,
            "DailySummary",
            "DailyOperationsDigest",
            null,
            inputText,
            outputText,
            "Draft",
            tokenUsage,
            true,
            GetUserId());

        DbContext.AiRuns.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapRun(entity);
        await WriteAuditAsync("ai", nameof(AiRun), "ai.run.daily_summary", entity.Id, null, dto, cancellationToken);
        return new AiDailySummaryDraftDto(dto, request.ShiftLabel.Trim(), request.SummaryDate, digest, "Human review required before sending or acting.");
    }

    public Task<IReadOnlyCollection<AiAssistantIntentDefinitionDto>> ListAssistantIntentsAsync(CancellationToken cancellationToken = default)
    {
        _ = cancellationToken;
        return Task.FromResult(AiAssistantIntentCatalog.ListDefinitions());
    }

    public async Task<AiAssistantQueryPlanDto> CreateAssistantPlanAsync(AiAssistantPlanRequest request, CancellationToken cancellationToken = default)
    {
        ValidateAssistantPlan(request);
        EnsureContextAccess(request.CompanyId, request.BranchId);

        var definition = AiAssistantIntentCatalog.Find(request.IntentCode);
        if (definition is null)
        {
            ThrowIfInvalid(new ApiError("ai.intent_not_allowed", nameof(request.IntentCode), "Assistant intent is not approved for execution."));
            throw new InvalidOperationException("Assistant intent validation failed.");
        }

        var unsupportedParameters = AiAssistantIntentCatalog.FindUnsupportedParameters(definition, request.Parameters);
        ThrowIfInvalid(unsupportedParameters.Select(parameter => new ApiError("ai.parameter_not_allowed", parameter, "Parameter is not approved for this assistant intent.")));

        var plan = AiAssistantIntentCatalog.BuildPlan(definition, request.CompanyId, request.BranchId, request.Parameters);
        await WriteAuditAsync("ai", "AiAssistantPlan", "ai.assistant.plan", request.CompanyId ?? 0, null, plan, cancellationToken);
        return plan;
    }

    public async Task<MultiLanguageTranslationDraftDto> CreateMultiLanguageTranslationDraftAsync(MultiLanguageTranslationDraftRequest request, CancellationToken cancellationToken = default)
    {
        ValidateMultiLanguageTranslation(request);
        var drafts = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        AiRunDto? run = null;

        foreach (var targetLanguageCode in request.TargetLanguageCodes.Select(code => code.Trim()).Where(code => !string.IsNullOrWhiteSpace(code)).Distinct(StringComparer.OrdinalIgnoreCase))
        {
            var draft = await CreateTranslationDraftAsync(
                new TranslationDraftRequest(
                    request.CompanyId,
                    request.BranchId,
                    request.AiProviderId,
                    request.AiModelId,
                    request.AiPromptTemplateId,
                    request.SourceText,
                    targetLanguageCode,
                    request.SourceLanguageCode,
                    request.RelatedDocumentType,
                    request.RelatedDocumentId),
                cancellationToken);

            run ??= draft.Run;
            drafts[targetLanguageCode] = draft.DraftText;
        }

        return new MultiLanguageTranslationDraftDto(run!, drafts, "Human review required before using translated notes or messages.");
    }

    public async Task<IReadOnlyCollection<AiProviderHealthDto>> GetProviderHealthAsync(CancellationToken cancellationToken = default)
    {
        var providers = await DbContext.AiProviders.AsNoTracking().OrderBy(record => record.ProviderCode).ToListAsync(cancellationToken);
        var models = await DbContext.AiModels.AsNoTracking().ToListAsync(cancellationToken);

        return providers.Select(provider =>
        {
            var activeModelCount = models.Count(model => model.AiProviderId == provider.Id && string.Equals(model.Status, "Active", StringComparison.OrdinalIgnoreCase));
            var status = !string.Equals(provider.Status, "Active", StringComparison.OrdinalIgnoreCase)
                ? "Inactive"
                : activeModelCount == 0 ? "NoModels" : "Ready";

            var notes = activeModelCount == 0
                ? "No active models are registered for this provider."
                : "Draft-only execution is enabled; human review is still required before any downstream use.";

            return new AiProviderHealthDto(provider.Id, provider.ProviderCode, status, activeModelCount, notes);
        }).ToArray();
    }

    private async Task EnsureAiReferencesAsync(long providerId, long modelId, long? templateId, CancellationToken cancellationToken)
    {
        ThrowIfInvalid(
            Positive(providerId, nameof(providerId), "Provider is required."),
            Positive(modelId, nameof(modelId), "Model is required."));

        var provider = await EnsureAiProviderExistsAsync(providerId, cancellationToken);

        var model = await DbContext.AiModels.AsNoTracking().FirstOrDefaultAsync(record => record.Id == modelId, cancellationToken);
        model = EnsureFound(model, "AI model was not found.", "ai.model_not_found");
        ThrowIfInvalid(model.AiProviderId != provider.Id
            ? new ApiError("validation.mismatch", nameof(modelId), "AI model does not belong to the requested provider.")
            : null);

        if (!templateId.HasValue)
        {
            return;
        }

        var template = await DbContext.AiPromptTemplates.AsNoTracking().FirstOrDefaultAsync(record => record.Id == templateId.Value, cancellationToken);
        EnsureFound(template, "AI prompt template was not found.", "ai.template_not_found");
    }

    private async Task<AiProvider> EnsureAiProviderExistsAsync(long providerId, CancellationToken cancellationToken)
    {
        ThrowIfInvalid(Positive(providerId, nameof(providerId), "Provider is required."));
        var provider = await DbContext.AiProviders.AsNoTracking().FirstOrDefaultAsync(record => record.Id == providerId, cancellationToken);
        return EnsureFound(provider, "AI provider was not found.", "ai.provider_not_found");
    }

    private static void ValidateProvider(AiProviderUpsertRequest request) =>
        ThrowIfInvalid(
            Required(request.ProviderCode, nameof(request.ProviderCode), "Provider code is required."),
            Required(request.ProviderName, nameof(request.ProviderName), "Provider name is required."),
            Required(request.ProviderType, nameof(request.ProviderType), "Provider type is required."),
            Required(request.Status, nameof(request.Status), "Status is required."));

    private static void ValidateModel(AiModelUpsertRequest request) =>
        ThrowIfInvalid(
            Positive(request.AiProviderId, nameof(request.AiProviderId), "Provider is required."),
            Required(request.ModelCode, nameof(request.ModelCode), "Model code is required."),
            Required(request.ModelName, nameof(request.ModelName), "Model name is required."),
            Required(request.Status, nameof(request.Status), "Status is required."));

    private static void ValidateTemplate(AiPromptTemplateUpsertRequest request) =>
        ThrowIfInvalid(
            Required(request.TemplateCode, nameof(request.TemplateCode), "Template code is required."),
            Required(request.TemplateName, nameof(request.TemplateName), "Template name is required."),
            Required(request.PromptPurpose, nameof(request.PromptPurpose), "Prompt purpose is required."),
            Required(request.TemplateBody, nameof(request.TemplateBody), "Template body is required."),
            Required(request.Status, nameof(request.Status), "Status is required."));

    private static void ValidateDraft(AiDraftRequest request) =>
        ThrowIfInvalid(
            Positive(request.AiProviderId, nameof(request.AiProviderId), "Provider is required."),
            Positive(request.AiModelId, nameof(request.AiModelId), "Model is required."),
            Required(request.DraftPurpose, nameof(request.DraftPurpose), "Draft purpose is required."),
            Required(request.InputText, nameof(request.InputText), "Input text is required."));

    private static void ValidateTranslationDraft(TranslationDraftRequest request) =>
        ThrowIfInvalid(
            Positive(request.AiProviderId, nameof(request.AiProviderId), "Provider is required."),
            Positive(request.AiModelId, nameof(request.AiModelId), "Model is required."),
            Required(request.SourceText, nameof(request.SourceText), "Source text is required."),
            Required(request.TargetLanguageCode, nameof(request.TargetLanguageCode), "Target language code is required."));

    private static void ValidateDailySummary(AiDailySummaryRequest request) =>
        ThrowIfInvalid(
            Positive(request.AiProviderId, nameof(request.AiProviderId), "Provider is required."),
            Positive(request.AiModelId, nameof(request.AiModelId), "Model is required."),
            Required(request.ShiftLabel, nameof(request.ShiftLabel), "Shift label is required."));

    private static void ValidateAssistantPlan(AiAssistantPlanRequest request) =>
        ThrowIfInvalid(
            Required(request.IntentCode, nameof(request.IntentCode), "Assistant intent code is required."));

    private static void ValidateMultiLanguageTranslation(MultiLanguageTranslationDraftRequest request)
    {
        ThrowIfInvalid(
            Positive(request.AiProviderId, nameof(request.AiProviderId), "Provider is required."),
            Positive(request.AiModelId, nameof(request.AiModelId), "Model is required."),
            Required(request.SourceText, nameof(request.SourceText), "Source text is required."),
            request.TargetLanguageCodes.Any(code => !string.IsNullOrWhiteSpace(code)) ? null : new ApiError("validation.required", nameof(request.TargetLanguageCodes), "At least one target language is required."));
    }

    private static void ValidateReview(AiReviewRequest request)
    {
        var allowed = new[] { "Reviewed", "Accepted", "Rejected", "Applied" };
        ThrowIfInvalid(
            Required(request.ReviewStatus, nameof(request.ReviewStatus), "Review status is required."),
            !allowed.Contains(request.ReviewStatus, StringComparer.OrdinalIgnoreCase)
                ? new ApiError("validation.unsupported", nameof(request.ReviewStatus), "Review status must be Reviewed, Accepted, Rejected, or Applied.")
                : null,
            request.ReviewStatus.Equals("Applied", StringComparison.OrdinalIgnoreCase) && string.IsNullOrWhiteSpace(request.AppliedTargetType)
                ? new ApiError("validation.required", nameof(request.AppliedTargetType), "Applied target is required when marking an AI draft as applied.")
                : null);
    }

    private static string BuildDraftText(string draftPurpose, string? templateBody, string inputText, string? sourceLanguageCode, string? targetLanguageCode)
    {
        var header = draftPurpose switch
        {
            "Summary" or "DailySummary" => "Draft summary for review",
            "Translate" => $"Draft translation for review ({sourceLanguageCode ?? "auto"} -> {targetLanguageCode ?? "target"})",
            "Assistant" => "Draft assistant response for review",
            _ => "Draft output for review"
        };

        if (string.Equals(draftPurpose, "Translate", StringComparison.OrdinalIgnoreCase))
        {
            return $"{header}:{Environment.NewLine}[{targetLanguageCode ?? "target"}] {inputText.Trim()}";
        }

        if (string.IsNullOrWhiteSpace(templateBody))
        {
            return $"{header}:{Environment.NewLine}{inputText.Trim()}";
        }

        return $"{header}:{Environment.NewLine}{templateBody.Trim()}{Environment.NewLine}{Environment.NewLine}Source:{Environment.NewLine}{inputText.Trim()}";
    }

    private static IReadOnlyCollection<AiRiskDigestItemDto> BuildRiskDigest(IReadOnlyCollection<AiOperationalSignalDto> signals)
    {
        var digest = signals
            .Where(signal =>
                signal.Count > 0 ||
                signal.Severity.Equals("High", StringComparison.OrdinalIgnoreCase) ||
                signal.Severity.Equals("Critical", StringComparison.OrdinalIgnoreCase))
            .Select(signal => new AiRiskDigestItemDto(
                signal.Label.Trim(),
                signal.Severity.Trim(),
                signal.Count,
                MaskSensitiveText(signal.Explanation),
                BuildReviewHint(signal)))
            .ToArray();

        return digest.Length > 0
            ? digest
            : [new AiRiskDigestItemDto("No critical blockers reported", "Info", 0, "Structured inputs did not include shortages, downtime, overdue orders, or pending QC blockers.", "Review dashboard inputs before sending.")];
    }

    private static string BuildReviewHint(AiOperationalSignalDto signal)
    {
        if (signal.Source.Equals("Shortage", StringComparison.OrdinalIgnoreCase))
        {
            return "Validate BOQ/MRP shortage rows before escalation.";
        }

        if (signal.Source.Equals("Downtime", StringComparison.OrdinalIgnoreCase))
        {
            return "Confirm machine event status before publishing.";
        }

        if (signal.Source.Equals("OverdueOrder", StringComparison.OrdinalIgnoreCase))
        {
            return "Check promised-date and dispatch readiness source data.";
        }

        if (signal.Source.Equals("Quality", StringComparison.OrdinalIgnoreCase))
        {
            return "Confirm inspection/NCR owner before sending.";
        }

        return "Human review required before operational use.";
    }

    private static string BuildSummaryInput(AiDailySummaryRequest request)
    {
        var signalLines = request.Signals.Count == 0
            ? "No structured signals supplied."
            : string.Join(Environment.NewLine, request.Signals.Select(signal => $"- {signal.Source}: {signal.Label}; count={signal.Count}; severity={signal.Severity}; reason={signal.Explanation}"));

        return $"Shift: {request.ShiftLabel.Trim()}{Environment.NewLine}Date: {request.SummaryDate:yyyy-MM-dd}{Environment.NewLine}{signalLines}";
    }

    private static string BuildDailySummaryOutput(AiDailySummaryRequest request, IReadOnlyCollection<AiRiskDigestItemDto> digest, string? templateBody)
    {
        var blockerSummary = string.Join(Environment.NewLine, digest.Select(item => $"- {item.Label}: {item.Severity}, count {item.Count}. {item.Explanation}"));
        var templatePrefix = string.IsNullOrWhiteSpace(templateBody)
            ? "Daily operations summary draft"
            : templateBody.Trim();

        return $"{templatePrefix}{Environment.NewLine}{Environment.NewLine}Shift: {request.ShiftLabel.Trim()} / {request.SummaryDate:yyyy-MM-dd}{Environment.NewLine}Risk digest:{Environment.NewLine}{blockerSummary}{Environment.NewLine}{Environment.NewLine}Review note: This draft cannot update operational records automatically.";
    }

    private static string MaskSensitiveText(string value)
    {
        var masked = EmailRegex.Replace(value, "[redacted-email]");
        masked = PhoneRegex.Replace(masked, "[redacted-phone]");
        return masked.Trim();
    }

    private static string BuildTokenUsageJson(string inputText, string outputText) =>
        JsonSerializer.Serialize(new
        {
            inputChars = inputText.Length,
            outputChars = outputText.Length,
            mode = "draft-only"
        });

    private static AiProviderDto MapProvider(AiProvider entity) =>
        new(entity.Id, entity.ProviderCode, entity.ProviderName, entity.ProviderType, entity.Status);

    private static AiModelDto MapModel(AiModel entity) =>
        new(entity.Id, entity.AiProviderId, entity.ModelCode, entity.ModelName, entity.CapabilityFlagsJson, entity.Status);

    private static AiPromptTemplateDto MapTemplate(AiPromptTemplate entity) =>
        new(entity.Id, entity.CompanyId, entity.TemplateCode, entity.TemplateName, entity.PromptPurpose, entity.TemplateBody, entity.Status);

    private static AiRunDto MapRun(AiRun entity) =>
        new(
            entity.Id,
            entity.CompanyId,
            entity.BranchId,
            entity.AiProviderId,
            entity.AiModelId,
            entity.AiPromptTemplateId,
            entity.DraftPurpose,
            entity.RelatedDocumentType,
            entity.RelatedDocumentId,
            entity.InputText,
            entity.OutputText,
            entity.RunStatus,
            entity.TokenUsageJson,
            entity.RequiresReview,
            entity.RequestedOn,
            entity.CompletedOn,
            string.IsNullOrWhiteSpace(entity.ReviewStatus) ? (entity.RequiresReview ? "Drafted" : "NotRequired") : entity.ReviewStatus,
            entity.ReviewedByUserId,
            entity.ReviewedOn,
            entity.ReviewNote,
            entity.AppliedTargetType,
            entity.AppliedTargetId);
}
