using STS.Mfg.Domain.Abstractions;

namespace STS.Mfg.Domain.Reporting;

public sealed class ReportDefinition : AuditableEntity, ICompanyScoped
{
    private ReportDefinition()
    {
    }

    public long? CompanyId { get; private set; }
    public string ReportCode { get; private set; } = string.Empty;
    public string ReportName { get; private set; } = string.Empty;
    public string Module { get; private set; } = string.Empty;
    public string Category { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string DatasetSource { get; private set; } = string.Empty;
    public string ReportType { get; private set; } = string.Empty;
    public string OutputFormatsJson { get; private set; } = "[]";
    public string PermissionKey { get; private set; } = string.Empty;
    public string ParameterSchemaJson { get; private set; } = "{}";
    public string? DefaultFiltersJson { get; private set; }
    public string? OwnerUserName { get; private set; }
    public int VersionNo { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public bool IsActive { get; private set; }

    public static ReportDefinition Create(
        long? companyId,
        string reportCode,
        string reportName,
        string module,
        string category,
        string? description,
        string datasetSource,
        string reportType,
        string outputFormatsJson,
        string permissionKey,
        string parameterSchemaJson,
        string? defaultFiltersJson,
        string? ownerUserName,
        string status,
        bool isActive,
        long? userId)
    {
        var entity = new ReportDefinition { CompanyId = companyId };
        entity.Update(
            reportName,
            module,
            category,
            description,
            datasetSource,
            reportType,
            outputFormatsJson,
            permissionKey,
            parameterSchemaJson,
            defaultFiltersJson,
            ownerUserName,
            status,
            isActive,
            userId);
        entity.ReportCode = reportCode.Trim();
        entity.VersionNo = 1;
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string reportName,
        string module,
        string category,
        string? description,
        string datasetSource,
        string reportType,
        string outputFormatsJson,
        string permissionKey,
        string parameterSchemaJson,
        string? defaultFiltersJson,
        string? ownerUserName,
        string status,
        bool isActive,
        long? userId)
    {
        ReportName = reportName.Trim();
        Module = module.Trim();
        Category = category.Trim();
        Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim();
        DatasetSource = datasetSource.Trim();
        ReportType = reportType.Trim();
        OutputFormatsJson = string.IsNullOrWhiteSpace(outputFormatsJson) ? "[]" : outputFormatsJson.Trim();
        PermissionKey = permissionKey.Trim();
        ParameterSchemaJson = string.IsNullOrWhiteSpace(parameterSchemaJson) ? "{}" : parameterSchemaJson.Trim();
        DefaultFiltersJson = string.IsNullOrWhiteSpace(defaultFiltersJson) ? null : defaultFiltersJson.Trim();
        OwnerUserName = string.IsNullOrWhiteSpace(ownerUserName) ? null : ownerUserName.Trim();
        Status = status.Trim();
        IsActive = isActive;
        VersionNo = VersionNo <= 0 ? 1 : VersionNo + 1;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class ReportRun : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private ReportRun()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public long ReportDefinitionId { get; private set; }
    public string RunNo { get; private set; } = string.Empty;
    public string ParametersJson { get; private set; } = "{}";
    public string OutputFormat { get; private set; } = string.Empty;
    public string Status { get; private set; } = string.Empty;
    public int RowCount { get; private set; }
    public string? FailureReason { get; private set; }
    public DateTimeOffset StartedOn { get; private set; }
    public DateTimeOffset? CompletedOn { get; private set; }
    public long? GeneratedByUserId { get; private set; }
    public int SourceReportVersion { get; private set; }
    public string? SourceEntityType { get; private set; }
    public long? SourceEntityId { get; private set; }

    public static ReportRun Create(
        long? companyId,
        long? branchId,
        long reportDefinitionId,
        string runNo,
        string parametersJson,
        string outputFormat,
        int sourceReportVersion,
        string? sourceEntityType,
        long? sourceEntityId,
        long? userId)
    {
        var entity = new ReportRun
        {
            CompanyId = companyId,
            BranchId = branchId,
            ReportDefinitionId = reportDefinitionId,
            RunNo = runNo.Trim(),
            ParametersJson = string.IsNullOrWhiteSpace(parametersJson) ? "{}" : parametersJson.Trim(),
            OutputFormat = outputFormat.Trim(),
            Status = "Running",
            StartedOn = DateTimeOffset.UtcNow,
            GeneratedByUserId = userId,
            SourceReportVersion = sourceReportVersion,
            SourceEntityType = string.IsNullOrWhiteSpace(sourceEntityType) ? null : sourceEntityType.Trim(),
            SourceEntityId = sourceEntityId,
            CreatedOn = DateTimeOffset.UtcNow,
            CreatedByUserId = userId,
            ModifiedOn = DateTimeOffset.UtcNow,
            ModifiedByUserId = userId
        };
        return entity;
    }

    public void MarkCompleted(int rowCount, long? userId)
    {
        Status = "Completed";
        RowCount = rowCount;
        FailureReason = null;
        CompletedOn = DateTimeOffset.UtcNow;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void MarkFailed(string failureReason, long? userId)
    {
        Status = "Failed";
        FailureReason = failureReason.Trim();
        CompletedOn = DateTimeOffset.UtcNow;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class ReportOutput : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private ReportOutput()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public long ReportRunId { get; private set; }
    public string FileName { get; private set; } = string.Empty;
    public string OutputFormat { get; private set; } = string.Empty;
    public string ContentType { get; private set; } = string.Empty;
    public string StoragePath { get; private set; } = string.Empty;
    public string Checksum { get; private set; } = string.Empty;
    public long SizeBytes { get; private set; }
    public string? ContentText { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public DateTimeOffset GeneratedOn { get; private set; }
    public int DownloadCount { get; private set; }
    public DateTimeOffset? LastDownloadedOn { get; private set; }
    public long? LastDownloadedByUserId { get; private set; }

    public static ReportOutput Create(
        long? companyId,
        long? branchId,
        long reportRunId,
        string fileName,
        string outputFormat,
        string contentType,
        string storagePath,
        string checksum,
        long sizeBytes,
        string? contentText,
        string status,
        long? userId)
    {
        var entity = new ReportOutput
        {
            CompanyId = companyId,
            BranchId = branchId,
            ReportRunId = reportRunId,
            FileName = fileName.Trim(),
            OutputFormat = outputFormat.Trim(),
            ContentType = contentType.Trim(),
            StoragePath = storagePath.Trim(),
            Checksum = checksum.Trim(),
            SizeBytes = sizeBytes,
            ContentText = contentText,
            Status = status.Trim(),
            GeneratedOn = DateTimeOffset.UtcNow,
            CreatedOn = DateTimeOffset.UtcNow,
            CreatedByUserId = userId,
            ModifiedOn = DateTimeOffset.UtcNow,
            ModifiedByUserId = userId
        };
        return entity;
    }

    public void MarkDownloaded(long? userId)
    {
        DownloadCount += 1;
        LastDownloadedOn = DateTimeOffset.UtcNow;
        LastDownloadedByUserId = userId;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class DashboardDefinition : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private DashboardDefinition()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string DashboardCode { get; private set; } = string.Empty;
    public string DashboardName { get; private set; } = string.Empty;
    public string Module { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string? VisibilityRole { get; private set; }
    public long? OwnerUserId { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static DashboardDefinition Create(
        long? companyId,
        long? branchId,
        string dashboardCode,
        string dashboardName,
        string module,
        string? description,
        string? visibilityRole,
        long? ownerUserId,
        string status,
        long? userId)
    {
        var entity = new DashboardDefinition { CompanyId = companyId, BranchId = branchId, DashboardCode = dashboardCode.Trim() };
        entity.Update(dashboardName, module, description, visibilityRole, ownerUserId, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string dashboardName, string module, string? description, string? visibilityRole, long? ownerUserId, string status, long? userId)
    {
        DashboardName = dashboardName.Trim();
        Module = module.Trim();
        Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim();
        VisibilityRole = string.IsNullOrWhiteSpace(visibilityRole) ? null : visibilityRole.Trim();
        OwnerUserId = ownerUserId;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class DashboardWidget : AuditableEntity
{
    private DashboardWidget()
    {
    }

    public long DashboardDefinitionId { get; private set; }
    public string WidgetCode { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string WidgetType { get; private set; } = string.Empty;
    public long? ReportDefinitionId { get; private set; }
    public string? DatasetSource { get; private set; }
    public string FiltersJson { get; private set; } = "{}";
    public string? DrilldownRoute { get; private set; }
    public string? DrilldownFilterJson { get; private set; }
    public int LayoutX { get; private set; }
    public int LayoutY { get; private set; }
    public int LayoutW { get; private set; }
    public int LayoutH { get; private set; }
    public int? RefreshMinutes { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static DashboardWidget Create(
        long dashboardDefinitionId,
        string widgetCode,
        string title,
        string widgetType,
        long? reportDefinitionId,
        string? datasetSource,
        string filtersJson,
        string? drilldownRoute,
        string? drilldownFilterJson,
        int layoutX,
        int layoutY,
        int layoutW,
        int layoutH,
        int? refreshMinutes,
        string status,
        long? userId)
    {
        var entity = new DashboardWidget { DashboardDefinitionId = dashboardDefinitionId, WidgetCode = widgetCode.Trim() };
        entity.Update(title, widgetType, reportDefinitionId, datasetSource, filtersJson, drilldownRoute, drilldownFilterJson, layoutX, layoutY, layoutW, layoutH, refreshMinutes, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string title,
        string widgetType,
        long? reportDefinitionId,
        string? datasetSource,
        string filtersJson,
        string? drilldownRoute,
        string? drilldownFilterJson,
        int layoutX,
        int layoutY,
        int layoutW,
        int layoutH,
        int? refreshMinutes,
        string status,
        long? userId)
    {
        Title = title.Trim();
        WidgetType = widgetType.Trim();
        ReportDefinitionId = reportDefinitionId;
        DatasetSource = string.IsNullOrWhiteSpace(datasetSource) ? null : datasetSource.Trim();
        FiltersJson = string.IsNullOrWhiteSpace(filtersJson) ? "{}" : filtersJson.Trim();
        DrilldownRoute = string.IsNullOrWhiteSpace(drilldownRoute) ? null : drilldownRoute.Trim();
        DrilldownFilterJson = string.IsNullOrWhiteSpace(drilldownFilterJson) ? null : drilldownFilterJson.Trim();
        LayoutX = layoutX;
        LayoutY = layoutY;
        LayoutW = layoutW <= 0 ? 1 : layoutW;
        LayoutH = layoutH <= 0 ? 1 : layoutH;
        RefreshMinutes = refreshMinutes;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}
