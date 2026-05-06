using Microsoft.Extensions.Logging;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Domain.Platform.Audit;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Infrastructure.Platform.Audit;

public sealed class AuditTrail(
    MfgDbContext dbContext,
    ICurrentUserContextAccessor currentUserContextAccessor,
    ILogger<AuditTrail> logger) : IAuditTrail
{
    public async Task WriteAsync(AuditEntryDraft entry, CancellationToken cancellationToken = default)
    {
        var currentUser = currentUserContextAccessor.GetCurrent();

        var auditEntry = AuditLogEntry.Create(
            currentUser.ActiveCompanyId,
            currentUser.ActiveBranchId,
            currentUser.UserId,
            entry.Module,
            entry.EntityType,
            entry.ActionCode,
            entry.EntityId,
            entry.BeforeSnapshot,
            entry.AfterSnapshot,
            entry.ReasonCode,
            Guid.NewGuid().ToString("N"),
            currentUser.ClientType);

        try
        {
            await dbContext.AuditLogs.AddAsync(auditEntry, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (Exception exception)
        {
            logger.LogWarning(exception, "Audit persistence failed for action {ActionCode}.", entry.ActionCode);
        }
    }
}
