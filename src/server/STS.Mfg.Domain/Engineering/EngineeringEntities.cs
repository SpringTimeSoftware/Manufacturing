using STS.Mfg.Domain.Abstractions;

namespace STS.Mfg.Domain.Engineering;

public sealed class Bom : AuditableEntity, ICompanyScoped
{
    private Bom()
    {
    }

    public long? CompanyId { get; private set; }
    public long ItemId { get; private set; }
    public string BomCode { get; private set; } = string.Empty;
    public string BomName { get; private set; } = string.Empty;
    public long? CurrentReleasedRevisionId { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static Bom Create(long companyId, long itemId, string bomCode, string bomName, string status, long? userId)
    {
        var entity = new Bom { CompanyId = companyId, ItemId = itemId };
        entity.Update(bomCode, bomName, null, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string bomCode, string bomName, long? currentReleasedRevisionId, string status, long? userId)
    {
        BomCode = bomCode.Trim();
        BomName = bomName.Trim();
        CurrentReleasedRevisionId = currentReleasedRevisionId;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void MarkReleased(long bomRevisionId, long? userId)
    {
        CurrentReleasedRevisionId = bomRevisionId;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class BomRevision : AuditableEntity
{
    private BomRevision()
    {
    }

    public long BomId { get; private set; }
    public string RevisionCode { get; private set; } = string.Empty;
    public DateOnly? EffectiveFrom { get; private set; }
    public DateOnly? EffectiveTo { get; private set; }
    public string ApprovalStatus { get; private set; } = string.Empty;
    public long? RoutingId { get; private set; }
    public string? ChangeSummary { get; private set; }
    public bool IsPhantomParentAllowed { get; private set; }

    public static BomRevision Create(long bomId, string revisionCode, DateOnly? effectiveFrom, DateOnly? effectiveTo, string approvalStatus, long? routingId, string? changeSummary, bool isPhantomParentAllowed, long? userId)
    {
        var entity = new BomRevision { BomId = bomId, RoutingId = routingId };
        entity.Update(revisionCode, effectiveFrom, effectiveTo, approvalStatus, changeSummary, isPhantomParentAllowed, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string revisionCode, DateOnly? effectiveFrom, DateOnly? effectiveTo, string approvalStatus, string? changeSummary, bool isPhantomParentAllowed, long? userId)
    {
        RevisionCode = revisionCode.Trim();
        EffectiveFrom = effectiveFrom;
        EffectiveTo = effectiveTo;
        ApprovalStatus = approvalStatus.Trim();
        ChangeSummary = string.IsNullOrWhiteSpace(changeSummary) ? null : changeSummary.Trim();
        IsPhantomParentAllowed = isPhantomParentAllowed;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class BomLine : AuditableEntity
{
    private BomLine()
    {
    }

    public long BomRevisionId { get; private set; }
    public int SequenceNo { get; private set; }
    public long ComponentItemId { get; private set; }
    public decimal QuantityPer { get; private set; }
    public long IssueUomId { get; private set; }
    public decimal ScrapPercent { get; private set; }
    public string IssueMethod { get; private set; } = string.Empty;
    public bool IsPhantom { get; private set; }
    public long? AlternateItemId { get; private set; }
    public DateOnly? EffectiveFrom { get; private set; }
    public DateOnly? EffectiveTo { get; private set; }

    public static BomLine Create(long bomRevisionId, int sequenceNo, long componentItemId, decimal quantityPer, long issueUomId, decimal scrapPercent, string issueMethod, bool isPhantom, long? alternateItemId, DateOnly? effectiveFrom, DateOnly? effectiveTo, long? userId)
    {
        var entity = new BomLine { BomRevisionId = bomRevisionId, SequenceNo = sequenceNo, ComponentItemId = componentItemId, IssueUomId = issueUomId };
        entity.Update(quantityPer, scrapPercent, issueMethod, isPhantom, alternateItemId, effectiveFrom, effectiveTo, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(decimal quantityPer, decimal scrapPercent, string issueMethod, bool isPhantom, long? alternateItemId, DateOnly? effectiveFrom, DateOnly? effectiveTo, long? userId)
    {
        QuantityPer = quantityPer;
        ScrapPercent = scrapPercent;
        IssueMethod = issueMethod.Trim();
        IsPhantom = isPhantom;
        AlternateItemId = alternateItemId;
        EffectiveFrom = effectiveFrom;
        EffectiveTo = effectiveTo;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class BomOperation : AuditableEntity
{
    private BomOperation()
    {
    }

    public long BomRevisionId { get; private set; }
    public int SequenceNo { get; private set; }
    public long? RoutingOperationId { get; private set; }
    public long? OperationId { get; private set; }
    public decimal SetupMinutes { get; private set; }
    public decimal RunMinutesPerUnit { get; private set; }
    public decimal TeardownMinutes { get; private set; }
    public bool RequiresQcCheckpoint { get; private set; }
    public bool IsOptional { get; private set; }

    public static BomOperation Create(long bomRevisionId, int sequenceNo, long? routingOperationId, long? operationId, decimal setupMinutes, decimal runMinutesPerUnit, decimal teardownMinutes, bool requiresQcCheckpoint, bool isOptional, long? userId)
    {
        var entity = new BomOperation { BomRevisionId = bomRevisionId, SequenceNo = sequenceNo, RoutingOperationId = routingOperationId, OperationId = operationId };
        entity.Update(setupMinutes, runMinutesPerUnit, teardownMinutes, requiresQcCheckpoint, isOptional, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(decimal setupMinutes, decimal runMinutesPerUnit, decimal teardownMinutes, bool requiresQcCheckpoint, bool isOptional, long? userId)
    {
        SetupMinutes = setupMinutes;
        RunMinutesPerUnit = runMinutesPerUnit;
        TeardownMinutes = teardownMinutes;
        RequiresQcCheckpoint = requiresQcCheckpoint;
        IsOptional = isOptional;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class AlternateItem : AuditableEntity, ICompanyScoped
{
    private AlternateItem()
    {
    }

    public long? CompanyId { get; private set; }
    public long PrimaryItemId { get; private set; }
    public long AlternateItemValueId { get; private set; }
    public string ContextType { get; private set; } = string.Empty;
    public long? BomId { get; private set; }
    public int PriorityRank { get; private set; }
    public DateOnly? EffectiveFrom { get; private set; }
    public DateOnly? EffectiveTo { get; private set; }
    public string ApprovalStatus { get; private set; } = string.Empty;
    public string? ReasonCode { get; private set; }

    public static AlternateItem Create(long companyId, long primaryItemId, long alternateItemId, string contextType, long? bomId, int priorityRank, DateOnly? effectiveFrom, DateOnly? effectiveTo, string approvalStatus, string? reasonCode, long? userId)
    {
        var entity = new AlternateItem { CompanyId = companyId, PrimaryItemId = primaryItemId, AlternateItemValueId = alternateItemId, BomId = bomId };
        entity.Update(contextType, priorityRank, effectiveFrom, effectiveTo, approvalStatus, reasonCode, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string contextType, int priorityRank, DateOnly? effectiveFrom, DateOnly? effectiveTo, string approvalStatus, string? reasonCode, long? userId)
    {
        ContextType = contextType.Trim();
        PriorityRank = priorityRank;
        EffectiveFrom = effectiveFrom;
        EffectiveTo = effectiveTo;
        ApprovalStatus = approvalStatus.Trim();
        ReasonCode = string.IsNullOrWhiteSpace(reasonCode) ? null : reasonCode.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class EngineeringChange : AuditableEntity, ICompanyScoped, IUserOwnedRecord
{
    private EngineeringChange()
    {
    }

    public long? CompanyId { get; private set; }
    public string EcoCode { get; private set; } = string.Empty;
    public string EcoTitle { get; private set; } = string.Empty;
    public string ChangeType { get; private set; } = string.Empty;
    public long RequestedByUserId { get; private set; }
    public DateTimeOffset RequestedOn { get; private set; }
    public DateOnly? EffectiveFrom { get; private set; }
    public string ApprovalStatus { get; private set; } = string.Empty;
    public string? ReasonCode { get; private set; }
    public long? OwnerUserId => RequestedByUserId;

    public static EngineeringChange Create(long companyId, string ecoCode, string ecoTitle, string changeType, long requestedByUserId, DateTimeOffset requestedOn, DateOnly? effectiveFrom, string approvalStatus, string? reasonCode, long? userId)
    {
        var entity = new EngineeringChange { CompanyId = companyId };
        entity.Update(ecoCode, ecoTitle, changeType, requestedByUserId, requestedOn, effectiveFrom, approvalStatus, reasonCode, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string ecoCode, string ecoTitle, string changeType, long requestedByUserId, DateTimeOffset requestedOn, DateOnly? effectiveFrom, string approvalStatus, string? reasonCode, long? userId)
    {
        EcoCode = ecoCode.Trim();
        EcoTitle = ecoTitle.Trim();
        ChangeType = changeType.Trim();
        RequestedByUserId = requestedByUserId;
        RequestedOn = requestedOn;
        EffectiveFrom = effectiveFrom;
        ApprovalStatus = approvalStatus.Trim();
        ReasonCode = string.IsNullOrWhiteSpace(reasonCode) ? null : reasonCode.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class EngineeringChangeLine : AuditableEntity
{
    private EngineeringChangeLine()
    {
    }

    public long EngineeringChangeId { get; private set; }
    public int LineNo { get; private set; }
    public string ImpactType { get; private set; } = string.Empty;
    public long TargetEntityId { get; private set; }
    public string ActionType { get; private set; } = string.Empty;
    public string? FromValueSummary { get; private set; }
    public string? ToValueSummary { get; private set; }
    public DateOnly? EffectiveFrom { get; private set; }

    public static EngineeringChangeLine Create(long engineeringChangeId, int lineNo, string impactType, long targetEntityId, string actionType, string? fromValueSummary, string? toValueSummary, DateOnly? effectiveFrom, long? userId)
    {
        var entity = new EngineeringChangeLine { EngineeringChangeId = engineeringChangeId, LineNo = lineNo, TargetEntityId = targetEntityId };
        entity.Update(impactType, actionType, fromValueSummary, toValueSummary, effectiveFrom, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string impactType, string actionType, string? fromValueSummary, string? toValueSummary, DateOnly? effectiveFrom, long? userId)
    {
        ImpactType = impactType.Trim();
        ActionType = actionType.Trim();
        FromValueSummary = string.IsNullOrWhiteSpace(fromValueSummary) ? null : fromValueSummary.Trim();
        ToValueSummary = string.IsNullOrWhiteSpace(toValueSummary) ? null : toValueSummary.Trim();
        EffectiveFrom = effectiveFrom;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}
