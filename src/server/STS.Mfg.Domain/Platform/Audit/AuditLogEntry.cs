using STS.Mfg.Domain.Abstractions;

namespace STS.Mfg.Domain.Platform.Audit;

public sealed class AuditLogEntry : Entity, ICompanyScoped, IBranchScoped
{
    private AuditLogEntry()
    {
    }

    private AuditLogEntry(
        long? companyId,
        long? branchId,
        long? createdByUserId,
        string module,
        string entityType,
        string actionCode,
        string? entityId,
        string? beforeSnapshot,
        string? afterSnapshot,
        string? reasonCode,
        string correlationId,
        string clientType)
    {
        CompanyId = companyId;
        BranchId = branchId;
        CreatedOn = DateTimeOffset.UtcNow;
        CreatedByUserId = createdByUserId;
        Module = module;
        EntityType = entityType;
        ActionCode = actionCode;
        EntityId = entityId;
        BeforeSnapshot = beforeSnapshot;
        AfterSnapshot = afterSnapshot;
        ReasonCode = reasonCode;
        CorrelationId = correlationId;
        ClientType = clientType;
    }

    public long? CompanyId { get; private set; }

    public long? BranchId { get; private set; }

    public DateTimeOffset CreatedOn { get; private set; }

    public long? CreatedByUserId { get; private set; }

    public string Module { get; private set; } = string.Empty;

    public string EntityType { get; private set; } = string.Empty;

    public string ActionCode { get; private set; } = string.Empty;

    public string? EntityId { get; private set; }

    public string? BeforeSnapshot { get; private set; }

    public string? AfterSnapshot { get; private set; }

    public string? ReasonCode { get; private set; }

    public string CorrelationId { get; private set; } = string.Empty;

    public string ClientType { get; private set; } = string.Empty;

    public static AuditLogEntry Create(
        long? companyId,
        long? branchId,
        long? createdByUserId,
        string module,
        string entityType,
        string actionCode,
        string? entityId,
        string? beforeSnapshot,
        string? afterSnapshot,
        string? reasonCode,
        string correlationId,
        string clientType)
    {
        return new AuditLogEntry(
            companyId,
            branchId,
            createdByUserId,
            module,
            entityType,
            actionCode,
            entityId,
            beforeSnapshot,
            afterSnapshot,
            reasonCode,
            correlationId,
            clientType);
    }
}
