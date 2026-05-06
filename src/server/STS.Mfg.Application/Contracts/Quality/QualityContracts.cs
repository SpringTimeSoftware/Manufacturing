using STS.Mfg.Application.Contracts;

namespace STS.Mfg.Application.Contracts.Quality;

public sealed record InspectionPlanFilter(
    int Page = 1,
    int PageSize = 25,
    string? Search = null,
    string? Status = null,
    DateTimeOffset? DateFrom = null,
    DateTimeOffset? DateTo = null,
    long? CompanyId = null,
    string? InspectionType = null) : QueryFilter(Page, PageSize, Search, Status, DateFrom, DateTo);

public sealed record InspectionPlanDto(
    long Id,
    long CompanyId,
    string PlanCode,
    string PlanName,
    string InspectionType,
    long? ItemId,
    long? OperationId,
    bool AutoHoldOnFail,
    bool AutoCreateNcrOnFail,
    string Status);

public sealed record InspectionPlanUpsertRequest(
    long CompanyId,
    string PlanCode,
    string PlanName,
    string InspectionType,
    long? ItemId,
    long? OperationId,
    bool AutoHoldOnFail,
    bool AutoCreateNcrOnFail,
    string Status,
    string? ItemCode = null);

public sealed record InspectionFilter(
    int Page = 1,
    int PageSize = 25,
    string? Search = null,
    string? Status = null,
    DateTimeOffset? DateFrom = null,
    DateTimeOffset? DateTo = null,
    long? CompanyId = null,
    long? BranchId = null,
    string? InspectionType = null,
    string? SourceDocumentType = null,
    long? SourceDocumentId = null) : QueryFilter(Page, PageSize, Search, Status, DateFrom, DateTo);

public sealed record InspectionResultDto(
    long Id,
    int LineNo,
    string ParameterCode,
    string? ExpectedValue,
    string? ActualValue,
    string ResultStatus,
    string? Remarks);

public sealed record InspectionDto(
    long Id,
    long CompanyId,
    long BranchId,
    string InspectionNo,
    long? InspectionPlanId,
    string InspectionType,
    string SourceDocumentType,
    long? SourceDocumentId,
    long? LotId,
    long? SerialId,
    string Status,
    string OverallResult,
    string? RequestToken,
    string? Notes,
    DateTimeOffset? HeldOn,
    DateTimeOffset? ReleasedOn,
    IReadOnlyCollection<InspectionResultDto> Results);

public sealed record InspectionResultRequest(
    int LineNo,
    string ParameterCode,
    string? ExpectedValue,
    string? ActualValue,
    string ResultStatus,
    string? Remarks);

public sealed record InspectionSaveRequest(
    long CompanyId,
    long BranchId,
    string InspectionNo,
    long? InspectionPlanId,
    string InspectionType,
    string SourceDocumentType,
    long? SourceDocumentId,
    long? LotId,
    long? SerialId,
    string? RequestToken,
    string? Notes,
    string? OverallResult,
    bool AutoCreateNcr,
    string? NcrNo,
    string? NcrDisposition,
    string? NcrRootCause,
    IReadOnlyCollection<InspectionResultRequest> Results);

public sealed record InspectionHoldReleaseRequest(string? Notes = null);

public sealed record NonConformanceFilter(
    int Page = 1,
    int PageSize = 25,
    string? Search = null,
    string? Status = null,
    DateTimeOffset? DateFrom = null,
    DateTimeOffset? DateTo = null,
    long? CompanyId = null,
    long? BranchId = null,
    string? SourceDocumentType = null,
    long? SourceDocumentId = null) : QueryFilter(Page, PageSize, Search, Status, DateFrom, DateTo);

public sealed record NonConformanceDto(
    long Id,
    long CompanyId,
    long BranchId,
    string NcrNo,
    string SourceDocumentType,
    long? SourceDocumentId,
    long? LotId,
    long? SerialId,
    string Disposition,
    string Status,
    string? RootCause,
    long? ReworkOrderId,
    string? Remarks);

public sealed record NonConformanceUpsertRequest(
    long CompanyId,
    long BranchId,
    string NcrNo,
    string SourceDocumentType,
    long? SourceDocumentId,
    long? LotId,
    long? SerialId,
    string Disposition,
    string Status,
    string? RootCause,
    long? ReworkOrderId,
    string? Remarks);

public sealed record NonConformanceActionRequest(string? Remarks = null);
