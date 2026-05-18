using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Reporting;

namespace STS.Mfg.Application.Abstractions.Reporting;

public interface IReportingService
{
    Task<PagedResult<ReportDefinitionDto>> ListReportDefinitionsAsync(ReportFilter filter, CancellationToken cancellationToken = default);

    Task<ReportDefinitionDto> GetReportDefinitionAsync(long id, CancellationToken cancellationToken = default);

    Task<ReportDefinitionDto> UpsertReportDefinitionAsync(ReportDefinitionUpsertRequest request, CancellationToken cancellationToken = default);

    Task<ReportRunDto> RunReportAsync(long reportDefinitionId, ReportRunRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<ReportRunDto>> ListReportRunsAsync(ReportFilter filter, CancellationToken cancellationToken = default);

    Task<PagedResult<ReportOutputDto>> ListReportOutputsAsync(ReportFilter filter, CancellationToken cancellationToken = default);

    Task<ReportDownloadDto> DownloadOutputAsync(long outputId, CancellationToken cancellationToken = default);

    Task<PagedResult<DashboardDefinitionDto>> ListDashboardsAsync(ReportFilter filter, CancellationToken cancellationToken = default);

    Task<DashboardDefinitionDto> SaveDashboardAsync(DashboardUpsertRequest request, CancellationToken cancellationToken = default);

    Task<DashboardDataDto> GetDashboardDataAsync(long dashboardId, CancellationToken cancellationToken = default);
}
