using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STS.Mfg.Application.Abstractions.Reporting;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Reporting;

namespace STS.Mfg.Api.Controllers;

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/reporting")]
public sealed class ReportingController(IReportingService reportingService) : ApiControllerBase
{
    [HttpGet("definitions")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<ReportDefinitionDto>>>> ListDefinitions([FromQuery] ReportFilter filter, CancellationToken cancellationToken)
    {
        var response = await reportingService.ListReportDefinitionsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("definitions/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<ReportDefinitionDto>>> GetDefinition(long id, CancellationToken cancellationToken)
    {
        var response = await reportingService.GetReportDefinitionAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("definitions")]
    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    public async Task<ActionResult<ApiEnvelope<ReportDefinitionDto>>> UpsertDefinition([FromBody] ReportDefinitionUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await reportingService.UpsertReportDefinitionAsync(request, cancellationToken);
        return OkEnvelope(response, "Report definition saved.");
    }

    [HttpPost("definitions/{id:long}/run")]
    public async Task<ActionResult<ApiEnvelope<ReportRunDto>>> RunReport(long id, [FromBody] ReportRunRequest request, CancellationToken cancellationToken)
    {
        var response = await reportingService.RunReportAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Report run completed.");
    }

    [HttpGet("runs")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<ReportRunDto>>>> ListRuns([FromQuery] ReportFilter filter, CancellationToken cancellationToken)
    {
        var response = await reportingService.ListReportRunsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("outputs")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<ReportOutputDto>>>> ListOutputs([FromQuery] ReportFilter filter, CancellationToken cancellationToken)
    {
        var response = await reportingService.ListReportOutputsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("outputs/{id:long}/download")]
    public async Task<IActionResult> DownloadOutput(long id, CancellationToken cancellationToken)
    {
        var response = await reportingService.DownloadOutputAsync(id, cancellationToken);
        return File(response.Content, response.ContentType, response.FileName);
    }

    [HttpGet("dashboards")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<DashboardDefinitionDto>>>> ListDashboards([FromQuery] ReportFilter filter, CancellationToken cancellationToken)
    {
        var response = await reportingService.ListDashboardsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("dashboards")]
    public async Task<ActionResult<ApiEnvelope<DashboardDefinitionDto>>> SaveDashboard([FromBody] DashboardUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await reportingService.SaveDashboardAsync(request, cancellationToken);
        return OkEnvelope(response, "Dashboard saved.");
    }

    [HttpGet("dashboards/{id:long}/data")]
    public async Task<ActionResult<ApiEnvelope<DashboardDataDto>>> GetDashboardData(long id, CancellationToken cancellationToken)
    {
        var response = await reportingService.GetDashboardDataAsync(id, cancellationToken);
        return OkEnvelope(response);
    }
}
