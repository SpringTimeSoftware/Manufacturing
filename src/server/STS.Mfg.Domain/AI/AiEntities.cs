using STS.Mfg.Domain.Abstractions;

namespace STS.Mfg.Domain.AI;

public sealed class AiProvider : AuditableEntity
{
    private AiProvider()
    {
    }

    public string ProviderCode { get; private set; } = string.Empty;
    public string ProviderName { get; private set; } = string.Empty;
    public string ProviderType { get; private set; } = string.Empty;
    public string Status { get; private set; } = string.Empty;

    public static AiProvider Create(string providerCode, string providerName, string providerType, string status, long? userId)
    {
        var entity = new AiProvider();
        entity.Update(providerCode, providerName, providerType, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string providerCode, string providerName, string providerType, string status, long? userId)
    {
        ProviderCode = providerCode.Trim();
        ProviderName = providerName.Trim();
        ProviderType = providerType.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class AiModel : AuditableEntity
{
    private AiModel()
    {
    }

    public long AiProviderId { get; private set; }
    public string ModelCode { get; private set; } = string.Empty;
    public string ModelName { get; private set; } = string.Empty;
    public string? CapabilityFlagsJson { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static AiModel Create(long aiProviderId, string modelCode, string modelName, string? capabilityFlagsJson, string status, long? userId)
    {
        var entity = new AiModel { AiProviderId = aiProviderId };
        entity.Update(modelCode, modelName, capabilityFlagsJson, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string modelCode, string modelName, string? capabilityFlagsJson, string status, long? userId)
    {
        ModelCode = modelCode.Trim();
        ModelName = modelName.Trim();
        CapabilityFlagsJson = string.IsNullOrWhiteSpace(capabilityFlagsJson) ? null : capabilityFlagsJson.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class AiPromptTemplate : AuditableEntity, ICompanyScoped
{
    private AiPromptTemplate()
    {
    }

    public long? CompanyId { get; private set; }
    public string TemplateCode { get; private set; } = string.Empty;
    public string TemplateName { get; private set; } = string.Empty;
    public string PromptPurpose { get; private set; } = string.Empty;
    public string TemplateBody { get; private set; } = string.Empty;
    public string Status { get; private set; } = string.Empty;

    public static AiPromptTemplate Create(long? companyId, string templateCode, string templateName, string promptPurpose, string templateBody, string status, long? userId)
    {
        var entity = new AiPromptTemplate { CompanyId = companyId };
        entity.Update(templateCode, templateName, promptPurpose, templateBody, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string templateCode, string templateName, string promptPurpose, string templateBody, string status, long? userId)
    {
        TemplateCode = templateCode.Trim();
        TemplateName = templateName.Trim();
        PromptPurpose = promptPurpose.Trim();
        TemplateBody = templateBody.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class AiRun : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private AiRun()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public long AiProviderId { get; private set; }
    public long AiModelId { get; private set; }
    public long? AiPromptTemplateId { get; private set; }
    public string DraftPurpose { get; private set; } = string.Empty;
    public string? RelatedDocumentType { get; private set; }
    public long? RelatedDocumentId { get; private set; }
    public string InputText { get; private set; } = string.Empty;
    public string? OutputText { get; private set; }
    public string RunStatus { get; private set; } = string.Empty;
    public string? TokenUsageJson { get; private set; }
    public bool RequiresReview { get; private set; }
    public DateTimeOffset RequestedOn { get; private set; }
    public DateTimeOffset? CompletedOn { get; private set; }

    public static AiRun Create(long? companyId, long? branchId, long aiProviderId, long aiModelId, long? aiPromptTemplateId, string draftPurpose, string? relatedDocumentType, long? relatedDocumentId, string inputText, string? outputText, string runStatus, string? tokenUsageJson, bool requiresReview, long? userId)
    {
        var entity = new AiRun
        {
            CompanyId = companyId,
            BranchId = branchId,
            AiProviderId = aiProviderId,
            AiModelId = aiModelId,
            AiPromptTemplateId = aiPromptTemplateId,
            RelatedDocumentId = relatedDocumentId
        };
        entity.Update(draftPurpose, relatedDocumentType, inputText, outputText, runStatus, tokenUsageJson, requiresReview, userId);
        entity.RequestedOn = DateTimeOffset.UtcNow;
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string draftPurpose, string? relatedDocumentType, string inputText, string? outputText, string runStatus, string? tokenUsageJson, bool requiresReview, long? userId)
    {
        DraftPurpose = draftPurpose.Trim();
        RelatedDocumentType = string.IsNullOrWhiteSpace(relatedDocumentType) ? null : relatedDocumentType.Trim();
        InputText = inputText.Trim();
        OutputText = string.IsNullOrWhiteSpace(outputText) ? null : outputText.Trim();
        RunStatus = runStatus.Trim();
        TokenUsageJson = string.IsNullOrWhiteSpace(tokenUsageJson) ? null : tokenUsageJson.Trim();
        RequiresReview = requiresReview;
        CompletedOn = DateTimeOffset.UtcNow;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}
