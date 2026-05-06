using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Quality;

namespace STS.Mfg.Application.Abstractions.Quality;

public interface IQualityService
{
    Task<PagedResult<InspectionPlanDto>> ListInspectionPlansAsync(InspectionPlanFilter filter, CancellationToken cancellationToken = default);
    Task<InspectionPlanDto> GetInspectionPlanAsync(long id, CancellationToken cancellationToken = default);
    Task<InspectionPlanDto> CreateInspectionPlanAsync(InspectionPlanUpsertRequest request, CancellationToken cancellationToken = default);
    Task<InspectionPlanDto> UpdateInspectionPlanAsync(long id, InspectionPlanUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<InspectionDto>> ListInspectionsAsync(InspectionFilter filter, CancellationToken cancellationToken = default);
    Task<InspectionDto> GetInspectionAsync(long id, CancellationToken cancellationToken = default);
    Task<InspectionDto> SaveInspectionAsync(InspectionSaveRequest request, CancellationToken cancellationToken = default);
    Task<ActionResponse> HoldInspectionAsync(long id, InspectionHoldReleaseRequest? request, CancellationToken cancellationToken = default);
    Task<ActionResponse> ReleaseInspectionAsync(long id, InspectionHoldReleaseRequest? request, CancellationToken cancellationToken = default);

    Task<PagedResult<NonConformanceDto>> ListNonConformancesAsync(NonConformanceFilter filter, CancellationToken cancellationToken = default);
    Task<NonConformanceDto> GetNonConformanceAsync(long id, CancellationToken cancellationToken = default);
    Task<NonConformanceDto> CreateNonConformanceAsync(NonConformanceUpsertRequest request, CancellationToken cancellationToken = default);
    Task<NonConformanceDto> UpdateNonConformanceAsync(long id, NonConformanceUpsertRequest request, CancellationToken cancellationToken = default);
    Task<ActionResponse> CloseNonConformanceAsync(long id, NonConformanceActionRequest? request, CancellationToken cancellationToken = default);
}
