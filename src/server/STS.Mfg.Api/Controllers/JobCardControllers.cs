using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STS.Mfg.Application.Abstractions.Production;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Production;

namespace STS.Mfg.Api.Controllers;

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/job-cards")]
public sealed class JobCardsController(IJobCardService jobCardService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<JobCardSummaryDto>>>> List(
        [FromQuery] JobCardFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await jobCardService.ListJobCardsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<JobCardDto>>> Get(long id, CancellationToken cancellationToken)
    {
        var response = await jobCardService.GetJobCardAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("create-for-work-order")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<JobCardDto>>>> CreateForWorkOrder(
        [FromBody] CreateJobCardsRequest request,
        CancellationToken cancellationToken)
    {
        var response = await jobCardService.CreateForWorkOrderAsync(request, cancellationToken);
        return OkEnvelope(response, "Job cards generated from work order.");
    }

    [HttpPost("{id:long}/assign")]
    public async Task<ActionResult<ApiEnvelope<ActionResponse>>> Assign(
        long id,
        [FromBody] JobCardAssignRequest request,
        CancellationToken cancellationToken)
    {
        var response = await jobCardService.AssignAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Job card assigned.");
    }

    [HttpPost("{id:long}/start")]
    public async Task<ActionResult<ApiEnvelope<ActionResponse>>> Start(
        long id,
        [FromBody] JobCardStartRequest request,
        CancellationToken cancellationToken)
    {
        var response = await jobCardService.StartAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Job card started.");
    }

    [HttpPost("{id:long}/pause")]
    public async Task<ActionResult<ApiEnvelope<ActionResponse>>> Pause(
        long id,
        [FromBody] JobCardPauseRequest request,
        CancellationToken cancellationToken)
    {
        var response = await jobCardService.PauseAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Job card paused.");
    }

    [HttpPost("{id:long}/resume")]
    public async Task<ActionResult<ApiEnvelope<ActionResponse>>> Resume(
        long id,
        [FromBody] JobCardResumeRequest request,
        CancellationToken cancellationToken)
    {
        var response = await jobCardService.ResumeAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Job card resumed.");
    }

    [HttpPost("{id:long}/quantities")]
    public async Task<ActionResult<ApiEnvelope<JobCardQuantityResultDto>>> LogQuantity(
        long id,
        [FromBody] JobCardQuantityRequest request,
        CancellationToken cancellationToken)
    {
        var response = await jobCardService.LogQuantityAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Job card quantities logged.");
    }

    [HttpPost("{id:long}/downtime")]
    public async Task<ActionResult<ApiEnvelope<DowntimeEventDto>>> LogDowntime(
        long id,
        [FromBody] JobCardDowntimeRequest request,
        CancellationToken cancellationToken)
    {
        var response = await jobCardService.LogDowntimeAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Downtime logged.");
    }

    [HttpPost("{id:long}/complete")]
    public async Task<ActionResult<ApiEnvelope<ActionResponse>>> Complete(
        long id,
        [FromBody] JobCardCompleteRequest? request,
        CancellationToken cancellationToken)
    {
        var response = await jobCardService.CompleteAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Job card completion processed.");
    }

    [HttpPost("mobile-replay")]
    public async Task<ActionResult<ApiEnvelope<JobCardReplayResult>>> Replay(
        [FromBody] JobCardReplayRequest request,
        CancellationToken cancellationToken)
    {
        var response = await jobCardService.ReplayMobileActionsAsync(request, cancellationToken);
        return OkEnvelope(response, "Mobile replay processed.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/downtime")]
public sealed class DowntimeController(IJobCardService jobCardService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<DowntimeEventDto>>>> List(
        [FromQuery] DowntimeFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await jobCardService.ListDowntimeAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }
}
