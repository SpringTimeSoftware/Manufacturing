using STS.Mfg.Application.Contracts;

namespace STS.Mfg.Application.Abstractions.Audit;

public sealed record AuditEntryDraft(
    string Module,
    string EntityType,
    string ActionCode,
    string? EntityId,
    string? BeforeSnapshot,
    string? AfterSnapshot,
    string? ReasonCode);

public interface IAuditTrail
{
    Task WriteAsync(AuditEntryDraft entry, CancellationToken cancellationToken = default);
}
