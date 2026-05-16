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
    string Status,
    IReadOnlyCollection<InspectionPlanCharacteristicDto> Characteristics);

public sealed record InspectionPlanCharacteristicDto(
    long Id,
    int LineNo,
    string ParameterCode,
    string ParameterName,
    string CharacteristicType,
    string? ExpectedValue,
    decimal? LowerLimit,
    decimal? UpperLimit,
    long? UomId,
    int SampleSize,
    bool IsMandatory,
    string Status,
    string? Remarks);

public sealed record InspectionPlanCharacteristicRequest(
    long? Id,
    int LineNo,
    string ParameterCode,
    string ParameterName,
    string CharacteristicType,
    string? ExpectedValue,
    decimal? LowerLimit,
    decimal? UpperLimit,
    long? UomId,
    int SampleSize,
    bool IsMandatory,
    string Status,
    string? Remarks);

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
    string? ItemCode = null,
    IReadOnlyCollection<InspectionPlanCharacteristicRequest>? Characteristics = null);

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
    string? DefectCategory,
    string? ContainmentAction,
    string? RootCause,
    string? CorrectiveAction,
    string? PreventiveAction,
    DateTimeOffset? DispositionReleasedOn,
    long? DispositionReleasedByUserId,
    DateTimeOffset? ClosedOn,
    long? ClosedByUserId,
    long? ReworkOrderId,
    string? Remarks,
    IReadOnlyCollection<NonConformanceLineDto> Lines);

public sealed record NonConformanceLineDto(
    long Id,
    int LineNo,
    long? ItemId,
    long? ItemRevisionId,
    long? LotId,
    long? SerialId,
    decimal? AffectedQuantity,
    long? UomId,
    string DefectCode,
    string DefectDescription,
    string Disposition,
    string? Remarks);

public sealed record NonConformanceLineRequest(
    long? Id,
    int LineNo,
    long? ItemId,
    long? ItemRevisionId,
    long? LotId,
    long? SerialId,
    decimal? AffectedQuantity,
    long? UomId,
    string DefectCode,
    string DefectDescription,
    string Disposition,
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
    string? DefectCategory,
    string? ContainmentAction,
    string? RootCause,
    string? CorrectiveAction,
    string? PreventiveAction,
    long? ReworkOrderId,
    string? Remarks,
    IReadOnlyCollection<NonConformanceLineRequest>? Lines = null);

public sealed record NonConformanceActionRequest(string? Remarks = null);

public sealed record NonConformanceDispositionRequest(
    string Disposition,
    string? ContainmentAction,
    string? RootCause,
    string? CorrectiveAction,
    string? PreventiveAction,
    string? Remarks);

public sealed record CoaCertificateFilter(
    int Page = 1,
    int PageSize = 25,
    string? Search = null,
    string? Status = null,
    DateTimeOffset? DateFrom = null,
    DateTimeOffset? DateTo = null,
    long? CompanyId = null,
    long? BranchId = null,
    long? InspectionRecordId = null) : QueryFilter(Page, PageSize, Search, Status, DateFrom, DateTo);

public sealed record CoaCertificateLineDto(
    long Id,
    int LineNo,
    string ParameterCode,
    string? ExpectedValue,
    string? ActualValue,
    string ResultStatus,
    string? Remarks);

public sealed record CoaCertificateDto(
    long Id,
    long CompanyId,
    long BranchId,
    string CoaNo,
    long InspectionRecordId,
    string SourceDocumentType,
    long? SourceDocumentId,
    long? LotId,
    long? SerialId,
    string TemplateCode,
    int VersionNo,
    string StoragePath,
    string Status,
    DateTimeOffset GeneratedOn,
    long? GeneratedByUserId,
    DateTimeOffset? IssuedOn,
    long? IssuedByUserId,
    string? ReissueReason,
    IReadOnlyCollection<CoaCertificateLineDto> Lines);

public sealed record CoaGenerateRequest(
    long CompanyId,
    long BranchId,
    long InspectionRecordId,
    string CoaNo,
    string TemplateCode,
    bool IssueImmediately,
    string? ReissueReason = null);

public sealed record CoaReissueRequest(
    string ReissueReason,
    string? TemplateCode = null,
    bool IssueImmediately = false);
