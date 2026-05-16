using STS.Mfg.Application.Contracts.Commercial;

namespace STS.Mfg.Application.Abstractions.Commercial;

public interface ICommercialCalculationService
{
    Task<CommercialDocumentCalculationResult> CalculateAsync(
        CommercialDocumentCalculationRequest request,
        CancellationToken cancellationToken = default);
}
