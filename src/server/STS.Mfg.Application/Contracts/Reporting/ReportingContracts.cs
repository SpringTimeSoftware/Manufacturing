namespace STS.Mfg.Application.Contracts.Reporting;

public sealed record ReportFilter(
    int Page = 1,
    int PageSize = 25,
    string? Search = null,
    string? Status = null,
    DateTimeOffset? DateFrom = null,
    DateTimeOffset? DateTo = null,
    long? CompanyId = null,
    long? BranchId = null,
    string? Module = null,
    string? Category = null,
    string? ReportType = null,
    string? ReportCode = null) : QueryFilter(Page, PageSize, Search, Status, DateFrom, DateTo);

public sealed record ReportDefinitionDto(
    long Id,
    long? CompanyId,
    string ReportCode,
    string ReportName,
    string Module,
    string Category,
    string? Description,
    string DatasetSource,
    string ReportType,
    IReadOnlyCollection<string> OutputFormats,
    string PermissionKey,
    string ParameterSchemaJson,
    string? DefaultFiltersJson,
    string? OwnerUserName,
    int VersionNo,
    string Status,
    bool IsActive);

public sealed record ReportDefinitionUpsertRequest(
    long? CompanyId,
    string ReportCode,
    string ReportName,
    string Module,
    string Category,
    string? Description,
    string DatasetSource,
    string ReportType,
    IReadOnlyCollection<string> OutputFormats,
    string PermissionKey,
    string ParameterSchemaJson,
    string? DefaultFiltersJson,
    string? OwnerUserName,
    string Status,
    bool IsActive);

public sealed record ReportRunRequest(
    IReadOnlyDictionary<string, string?> Parameters,
    string OutputFormat,
    string? SourceEntityType = null,
    long? SourceEntityId = null);

public sealed record ReportRowDto(IReadOnlyDictionary<string, string?> Values);

public sealed record ReportOutputDto(
    long Id,
    long? CompanyId,
    long? BranchId,
    long ReportRunId,
    string FileName,
    string OutputFormat,
    string ContentType,
    string StoragePath,
    string Checksum,
    long SizeBytes,
    string Status,
    DateTimeOffset GeneratedOn,
    int DownloadCount,
    DateTimeOffset? LastDownloadedOn,
    long? LastDownloadedByUserId);

public sealed record ReportRunDto(
    long Id,
    long? CompanyId,
    long? BranchId,
    long ReportDefinitionId,
    string RunNo,
    string ParametersJson,
    string OutputFormat,
    string Status,
    int RowCount,
    string? FailureReason,
    DateTimeOffset StartedOn,
    DateTimeOffset? CompletedOn,
    long? GeneratedByUserId,
    int SourceReportVersion,
    string? SourceEntityType,
    long? SourceEntityId,
    ReportDefinitionDto? Definition,
    IReadOnlyCollection<string> Columns,
    IReadOnlyCollection<ReportRowDto> Rows,
    IReadOnlyCollection<ReportOutputDto> Outputs);

public sealed record ReportDownloadDto(byte[] Content, string ContentType, string FileName);

public sealed record DashboardWidgetDto(
    long Id,
    long DashboardDefinitionId,
    string WidgetCode,
    string Title,
    string WidgetType,
    long? ReportDefinitionId,
    string? DatasetSource,
    string FiltersJson,
    string? DrilldownRoute,
    string? DrilldownFilterJson,
    int LayoutX,
    int LayoutY,
    int LayoutW,
    int LayoutH,
    int? RefreshMinutes,
    string Status);

public sealed record DashboardDefinitionDto(
    long Id,
    long? CompanyId,
    long? BranchId,
    string DashboardCode,
    string DashboardName,
    string Module,
    string? Description,
    string? VisibilityRole,
    long? OwnerUserId,
    string Status,
    IReadOnlyCollection<DashboardWidgetDto> Widgets);

public sealed record DashboardWidgetUpsertRequest(
    long? Id,
    string WidgetCode,
    string Title,
    string WidgetType,
    long? ReportDefinitionId,
    string? DatasetSource,
    string FiltersJson,
    string? DrilldownRoute,
    string? DrilldownFilterJson,
    int LayoutX,
    int LayoutY,
    int LayoutW,
    int LayoutH,
    int? RefreshMinutes,
    string Status);

public sealed record DashboardUpsertRequest(
    long? CompanyId,
    long? BranchId,
    string DashboardCode,
    string DashboardName,
    string Module,
    string? Description,
    string? VisibilityRole,
    long? OwnerUserId,
    string Status,
    IReadOnlyCollection<DashboardWidgetUpsertRequest> Widgets);

public sealed record DashboardWidgetDataDto(
    DashboardWidgetDto Widget,
    IReadOnlyCollection<string> Columns,
    IReadOnlyCollection<ReportRowDto> Rows,
    DateTimeOffset LoadedOn,
    string? DisabledReason);

public sealed record DashboardDataDto(
    DashboardDefinitionDto Dashboard,
    IReadOnlyCollection<DashboardWidgetDataDto> Widgets);
