using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Production;

namespace STS.Mfg.Application.Abstractions.Production;

public interface IJobCardService
{
    Task<PagedResult<JobCardSummaryDto>> ListJobCardsAsync(JobCardFilter filter, CancellationToken cancellationToken = default);
    Task<JobCardDto> GetJobCardAsync(long id, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<JobCardDto>> CreateForWorkOrderAsync(CreateJobCardsRequest request, CancellationToken cancellationToken = default);

    Task<ActionResponse> AssignAsync(long jobCardId, JobCardAssignRequest request, CancellationToken cancellationToken = default);
    Task<ActionResponse> StartAsync(long jobCardId, JobCardStartRequest request, CancellationToken cancellationToken = default);
    Task<ActionResponse> PauseAsync(long jobCardId, JobCardPauseRequest request, CancellationToken cancellationToken = default);
    Task<ActionResponse> ResumeAsync(long jobCardId, JobCardResumeRequest request, CancellationToken cancellationToken = default);
    Task<JobCardQuantityResultDto> LogQuantityAsync(long jobCardId, JobCardQuantityRequest request, CancellationToken cancellationToken = default);
    Task<DowntimeEventDto> LogDowntimeAsync(long jobCardId, JobCardDowntimeRequest request, CancellationToken cancellationToken = default);
    Task<ActionResponse> CompleteAsync(long jobCardId, JobCardCompleteRequest? request, CancellationToken cancellationToken = default);

    Task<PagedResult<DowntimeEventDto>> ListDowntimeAsync(DowntimeFilter filter, CancellationToken cancellationToken = default);
    Task<JobCardReplayResult> ReplayMobileActionsAsync(JobCardReplayRequest request, CancellationToken cancellationToken = default);
}
