using STS.Mfg.Application.Contracts;

namespace STS.Mfg.Application.Contracts.Engineering;

public sealed record EngineeringFilter(
    int Page = 1,
    int PageSize = 25,
    string? Search = null,
    string? Status = null,
    long? CompanyId = null) : QueryFilter(Page, PageSize, Search, Status);

public sealed record RoutingOperationDto(long Id, int SequenceNo, long OperationId, long? WorkCenterId, long? ToolId, decimal SetupMinutes, decimal RunMinutesPerUnit, decimal TeardownMinutes, decimal? OverlapPercent, bool IsOutsideProcessing, bool RequiresQcCheckpoint, string Status);
public sealed record RoutingOperationUpsertRequest(int SequenceNo, long OperationId, long? WorkCenterId, long? ToolId, decimal SetupMinutes, decimal RunMinutesPerUnit, decimal TeardownMinutes, decimal? OverlapPercent, bool IsOutsideProcessing, bool RequiresQcCheckpoint, string Status);
public sealed record RoutingDto(long Id, long CompanyId, string RoutingCode, string RoutingName, long? OutputItemId, string? RevisionCode, string Status, IReadOnlyCollection<RoutingOperationDto> Operations);
public sealed record RoutingUpsertRequest(long CompanyId, string RoutingCode, string RoutingName, long? OutputItemId, string? RevisionCode, string Status, IReadOnlyCollection<RoutingOperationUpsertRequest> Operations);

public sealed record BomLineDto(long Id, int SequenceNo, long ComponentItemId, decimal QuantityPer, long IssueUomId, decimal ScrapPercent, string IssueMethod, bool IsPhantom, long? AlternateItemId, DateOnly? EffectiveFrom, DateOnly? EffectiveTo);
public sealed record BomLineUpsertRequest(int SequenceNo, long ComponentItemId, decimal QuantityPer, long IssueUomId, decimal ScrapPercent, string IssueMethod, bool IsPhantom, long? AlternateItemId, DateOnly? EffectiveFrom, DateOnly? EffectiveTo);
public sealed record BomOperationDto(long Id, int SequenceNo, long? RoutingOperationId, long? OperationId, decimal SetupMinutes, decimal RunMinutesPerUnit, decimal TeardownMinutes, bool RequiresQcCheckpoint, bool IsOptional);
public sealed record BomOperationUpsertRequest(int SequenceNo, long? RoutingOperationId, long? OperationId, decimal SetupMinutes, decimal RunMinutesPerUnit, decimal TeardownMinutes, bool RequiresQcCheckpoint, bool IsOptional);
public sealed record BomRevisionDto(long Id, string RevisionCode, DateOnly? EffectiveFrom, DateOnly? EffectiveTo, string ApprovalStatus, long? RoutingId, string? ChangeSummary, bool IsPhantomParentAllowed, IReadOnlyCollection<BomLineDto> Lines, IReadOnlyCollection<BomOperationDto> Operations);
public sealed record BomRevisionUpsertRequest(string RevisionCode, DateOnly? EffectiveFrom, DateOnly? EffectiveTo, string ApprovalStatus, long? RoutingId, string? ChangeSummary, bool IsPhantomParentAllowed, IReadOnlyCollection<BomLineUpsertRequest> Lines, IReadOnlyCollection<BomOperationUpsertRequest> Operations);
public sealed record BomDto(long Id, long CompanyId, long ItemId, string BomCode, string BomName, long? CurrentReleasedRevisionId, string Status, IReadOnlyCollection<BomRevisionDto> Revisions);
public sealed record BomUpsertRequest(long CompanyId, long ItemId, string BomCode, string BomName, string Status, IReadOnlyCollection<BomRevisionUpsertRequest> Revisions);

public sealed record AlternateItemDto(long Id, long CompanyId, long PrimaryItemId, long AlternateItemId, string ContextType, long? BomId, int PriorityRank, DateOnly? EffectiveFrom, DateOnly? EffectiveTo, string ApprovalStatus, string? ReasonCode);
public sealed record AlternateItemUpsertRequest(long CompanyId, long PrimaryItemId, long AlternateItemId, string ContextType, long? BomId, int PriorityRank, DateOnly? EffectiveFrom, DateOnly? EffectiveTo, string ApprovalStatus, string? ReasonCode);

public sealed record EngineeringChangeLineDto(long Id, int LineNo, string ImpactType, long TargetEntityId, string ActionType, string? FromValueSummary, string? ToValueSummary, DateOnly? EffectiveFrom);
public sealed record EngineeringChangeLineUpsertRequest(int LineNo, string ImpactType, long TargetEntityId, string ActionType, string? FromValueSummary, string? ToValueSummary, DateOnly? EffectiveFrom);
public sealed record EngineeringChangeDto(long Id, long CompanyId, string EcoCode, string EcoTitle, string ChangeType, long RequestedByUserId, DateTimeOffset RequestedOn, DateOnly? EffectiveFrom, string ApprovalStatus, string? ReasonCode, IReadOnlyCollection<EngineeringChangeLineDto> Lines);
public sealed record EngineeringChangeUpsertRequest(long CompanyId, string EcoCode, string EcoTitle, string ChangeType, long RequestedByUserId, DateTimeOffset RequestedOn, DateOnly? EffectiveFrom, string ApprovalStatus, string? ReasonCode, IReadOnlyCollection<EngineeringChangeLineUpsertRequest> Lines);
