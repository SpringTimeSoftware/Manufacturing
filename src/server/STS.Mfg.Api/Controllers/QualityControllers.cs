using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STS.Mfg.Application.Abstractions.Quality;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Quality;

namespace STS.Mfg.Api.Controllers;

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/quality")]
public sealed class QualityController(IQualityService qualityService) : ApiControllerBase
{
    [HttpGet("plans")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<InspectionPlanDto>>>> ListPlans([FromQuery] InspectionPlanFilter filter, CancellationToken cancellationToken)
    {
        var response = await qualityService.ListInspectionPlansAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("plans/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<InspectionPlanDto>>> GetPlan(long id, CancellationToken cancellationToken)
    {
        var response = await qualityService.GetInspectionPlanAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("plans")]
    public async Task<ActionResult<ApiEnvelope<InspectionPlanDto>>> CreatePlan([FromBody] InspectionPlanUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await qualityService.CreateInspectionPlanAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(GetPlan), new { id = response.Id }, response, "Inspection plan created.");
    }

    [HttpPut("plans/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<InspectionPlanDto>>> UpdatePlan(long id, [FromBody] InspectionPlanUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await qualityService.UpdateInspectionPlanAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Inspection plan updated.");
    }

    [HttpGet("inspections")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<InspectionDto>>>> ListInspections([FromQuery] InspectionFilter filter, CancellationToken cancellationToken)
    {
        var response = await qualityService.ListInspectionsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("inspections/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<InspectionDto>>> GetInspection(long id, CancellationToken cancellationToken)
    {
        var response = await qualityService.GetInspectionAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("inspections")]
    public async Task<ActionResult<ApiEnvelope<InspectionDto>>> SaveInspection([FromBody] InspectionSaveRequest request, CancellationToken cancellationToken)
    {
        var response = await qualityService.SaveInspectionAsync(request, cancellationToken);
        return OkEnvelope(response, "Inspection saved.");
    }

    [HttpPost("inspections/{id:long}/hold")]
    public async Task<ActionResult<ApiEnvelope<ActionResponse>>> HoldInspection(long id, [FromBody] InspectionHoldReleaseRequest? request, CancellationToken cancellationToken)
    {
        var response = await qualityService.HoldInspectionAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Inspection hold applied.");
    }

    [HttpPost("inspections/{id:long}/release")]
    public async Task<ActionResult<ApiEnvelope<ActionResponse>>> ReleaseInspection(long id, [FromBody] InspectionHoldReleaseRequest? request, CancellationToken cancellationToken)
    {
        var response = await qualityService.ReleaseInspectionAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Inspection release applied.");
    }

    [HttpGet("ncrs")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<NonConformanceDto>>>> ListNcrs([FromQuery] NonConformanceFilter filter, CancellationToken cancellationToken)
    {
        var response = await qualityService.ListNonConformancesAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("ncrs/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<NonConformanceDto>>> GetNcr(long id, CancellationToken cancellationToken)
    {
        var response = await qualityService.GetNonConformanceAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("ncrs")]
    public async Task<ActionResult<ApiEnvelope<NonConformanceDto>>> CreateNcr([FromBody] NonConformanceUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await qualityService.CreateNonConformanceAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(GetNcr), new { id = response.Id }, response, "NCR created.");
    }

    [HttpPut("ncrs/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<NonConformanceDto>>> UpdateNcr(long id, [FromBody] NonConformanceUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await qualityService.UpdateNonConformanceAsync(id, request, cancellationToken);
        return OkEnvelope(response, "NCR updated.");
    }

    [HttpPost("ncrs/{id:long}/close")]
    public async Task<ActionResult<ApiEnvelope<ActionResponse>>> CloseNcr(long id, [FromBody] NonConformanceActionRequest? request, CancellationToken cancellationToken)
    {
        var response = await qualityService.CloseNonConformanceAsync(id, request, cancellationToken);
        return OkEnvelope(response, "NCR closed.");
    }

    [HttpPost("ncrs/{id:long}/release-disposition")]
    public async Task<ActionResult<ApiEnvelope<ActionResponse>>> ReleaseNcrDisposition(long id, [FromBody] NonConformanceDispositionRequest request, CancellationToken cancellationToken)
    {
        var response = await qualityService.ReleaseNonConformanceDispositionAsync(id, request, cancellationToken);
        return OkEnvelope(response, "NCR disposition released.");
    }

    [HttpGet("coas")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<CoaCertificateDto>>>> ListCoas([FromQuery] CoaCertificateFilter filter, CancellationToken cancellationToken)
    {
        var response = await qualityService.ListCoaCertificatesAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("coas/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<CoaCertificateDto>>> GetCoa(long id, CancellationToken cancellationToken)
    {
        var response = await qualityService.GetCoaCertificateAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("coas")]
    public async Task<ActionResult<ApiEnvelope<CoaCertificateDto>>> GenerateCoa([FromBody] CoaGenerateRequest request, CancellationToken cancellationToken)
    {
        var response = await qualityService.GenerateCoaCertificateAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(GetCoa), new { id = response.Id }, response, "COA generated.");
    }

    [HttpPost("coas/{id:long}/reissue")]
    public async Task<ActionResult<ApiEnvelope<CoaCertificateDto>>> ReissueCoa(long id, [FromBody] CoaReissueRequest request, CancellationToken cancellationToken)
    {
        var response = await qualityService.ReissueCoaCertificateAsync(id, request, cancellationToken);
        return OkEnvelope(response, "COA reissued.");
    }

    [HttpPost("coas/{id:long}/issue")]
    public async Task<ActionResult<ApiEnvelope<ActionResponse>>> IssueCoa(long id, CancellationToken cancellationToken)
    {
        var response = await qualityService.IssueCoaCertificateAsync(id, cancellationToken);
        return OkEnvelope(response, "COA issued.");
    }
}
