using STS.Mfg.Domain.Abstractions;

namespace STS.Mfg.Domain.ServiceManagement;

public sealed class InstalledAsset : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private InstalledAsset()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string AssetNo { get; private set; } = string.Empty;
    public long CustomerId { get; private set; }
    public long? CustomerSiteId { get; private set; }
    public long? CustomerContactId { get; private set; }
    public long ItemId { get; private set; }
    public long? ItemRevisionId { get; private set; }
    public long? SerialId { get; private set; }
    public string? SerialNo { get; private set; }
    public long? LotId { get; private set; }
    public long? PcidId { get; private set; }
    public long? SourceSalesOrderId { get; private set; }
    public long? SourceSalesOrderLineId { get; private set; }
    public long? SourceDispatchId { get; private set; }
    public long? SourceDispatchLineId { get; private set; }
    public long? SourceInvoiceId { get; private set; }
    public string? SourceDocumentType { get; private set; }
    public string? SourceDocumentNo { get; private set; }
    public int? SourceDocumentRevisionNo { get; private set; }
    public DateOnly InstallationDate { get; private set; }
    public DateOnly? CommissioningDate { get; private set; }
    public DateOnly? WarrantyStartDate { get; private set; }
    public DateOnly? WarrantyEndDate { get; private set; }
    public long? ServiceContractId { get; private set; }
    public string Status { get; private set; } = "Installed";
    public string? LocationSnapshot { get; private set; }
    public string? Remarks { get; private set; }
    public bool LegacySourceIncomplete { get; private set; }

    public static InstalledAsset Create(InstalledAssetDraft draft, long? userId)
    {
        var entity = new InstalledAsset
        {
            CompanyId = draft.CompanyId,
            BranchId = draft.BranchId,
            CreatedOn = DateTimeOffset.UtcNow,
            CreatedByUserId = userId
        };
        entity.Update(draft, userId);
        return entity;
    }

    public void Update(InstalledAssetDraft draft, long? userId)
    {
        AssetNo = draft.AssetNo.Trim();
        CustomerId = draft.CustomerId;
        CustomerSiteId = draft.CustomerSiteId;
        CustomerContactId = draft.CustomerContactId;
        ItemId = draft.ItemId;
        ItemRevisionId = draft.ItemRevisionId;
        SerialId = draft.SerialId;
        SerialNo = Normalize(draft.SerialNo);
        LotId = draft.LotId;
        PcidId = draft.PcidId;
        SourceSalesOrderId = draft.SourceSalesOrderId;
        SourceSalesOrderLineId = draft.SourceSalesOrderLineId;
        SourceDispatchId = draft.SourceDispatchId;
        SourceDispatchLineId = draft.SourceDispatchLineId;
        SourceInvoiceId = draft.SourceInvoiceId;
        SourceDocumentType = Normalize(draft.SourceDocumentType);
        SourceDocumentNo = Normalize(draft.SourceDocumentNo);
        SourceDocumentRevisionNo = draft.SourceDocumentRevisionNo;
        InstallationDate = draft.InstallationDate;
        CommissioningDate = draft.CommissioningDate;
        WarrantyStartDate = draft.WarrantyStartDate;
        WarrantyEndDate = draft.WarrantyEndDate;
        ServiceContractId = draft.ServiceContractId;
        Status = draft.Status.Trim();
        LocationSnapshot = Normalize(draft.LocationSnapshot);
        Remarks = Normalize(draft.Remarks);
        LegacySourceIncomplete = draft.LegacySourceIncomplete;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void MarkReplaced(long? userId)
    {
        Status = "Replaced";
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}

public sealed record InstalledAssetDraft(
    long CompanyId,
    long? BranchId,
    string AssetNo,
    long CustomerId,
    long? CustomerSiteId,
    long? CustomerContactId,
    long ItemId,
    long? ItemRevisionId,
    long? SerialId,
    string? SerialNo,
    long? LotId,
    long? PcidId,
    long? SourceSalesOrderId,
    long? SourceSalesOrderLineId,
    long? SourceDispatchId,
    long? SourceDispatchLineId,
    long? SourceInvoiceId,
    string? SourceDocumentType,
    string? SourceDocumentNo,
    int? SourceDocumentRevisionNo,
    DateOnly InstallationDate,
    DateOnly? CommissioningDate,
    DateOnly? WarrantyStartDate,
    DateOnly? WarrantyEndDate,
    long? ServiceContractId,
    string Status,
    string? LocationSnapshot,
    string? Remarks,
    bool LegacySourceIncomplete);

public sealed class WarrantyPolicy : AuditableEntity, ICompanyScoped
{
    private WarrantyPolicy()
    {
    }

    public long? CompanyId { get; private set; }
    public string PolicyCode { get; private set; } = string.Empty;
    public string PolicyName { get; private set; } = string.Empty;
    public long? ItemId { get; private set; }
    public long? ItemGroupId { get; private set; }
    public long? CustomerGroupId { get; private set; }
    public int DurationDays { get; private set; }
    public string StartTrigger { get; private set; } = "InstallationDate";
    public bool CoversParts { get; private set; }
    public bool CoversLabor { get; private set; }
    public bool CoversOnsite { get; private set; }
    public bool CoversReplacement { get; private set; }
    public string? Exclusions { get; private set; }
    public decimal? ClaimLimitAmount { get; private set; }
    public string Status { get; private set; } = "Draft";

    public static WarrantyPolicy Create(WarrantyPolicyDraft draft, long? userId)
    {
        var entity = new WarrantyPolicy
        {
            CompanyId = draft.CompanyId,
            CreatedOn = DateTimeOffset.UtcNow,
            CreatedByUserId = userId
        };
        entity.Update(draft, userId);
        return entity;
    }

    public void Update(WarrantyPolicyDraft draft, long? userId)
    {
        PolicyCode = draft.PolicyCode.Trim();
        PolicyName = draft.PolicyName.Trim();
        ItemId = draft.ItemId;
        ItemGroupId = draft.ItemGroupId;
        CustomerGroupId = draft.CustomerGroupId;
        DurationDays = draft.DurationDays;
        StartTrigger = draft.StartTrigger.Trim();
        CoversParts = draft.CoversParts;
        CoversLabor = draft.CoversLabor;
        CoversOnsite = draft.CoversOnsite;
        CoversReplacement = draft.CoversReplacement;
        Exclusions = Normalize(draft.Exclusions);
        ClaimLimitAmount = draft.ClaimLimitAmount;
        Status = draft.Status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}

public sealed record WarrantyPolicyDraft(
    long? CompanyId,
    string PolicyCode,
    string PolicyName,
    long? ItemId,
    long? ItemGroupId,
    long? CustomerGroupId,
    int DurationDays,
    string StartTrigger,
    bool CoversParts,
    bool CoversLabor,
    bool CoversOnsite,
    bool CoversReplacement,
    string? Exclusions,
    decimal? ClaimLimitAmount,
    string Status);

public sealed class ServiceContract : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private ServiceContract()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string ContractNo { get; private set; } = string.Empty;
    public long CustomerId { get; private set; }
    public long? InstalledAssetId { get; private set; }
    public DateOnly StartDate { get; private set; }
    public DateOnly EndDate { get; private set; }
    public DateOnly? RenewalDate { get; private set; }
    public string CoverageSummary { get; private set; } = string.Empty;
    public int? VisitFrequencyDays { get; private set; }
    public string? PreventiveScheduleJson { get; private set; }
    public int? SlaResponseHours { get; private set; }
    public long? BillingTermsId { get; private set; }
    public decimal? ContractValueAmount { get; private set; }
    public long? TaxCodeId { get; private set; }
    public decimal? TaxRateSnapshot { get; private set; }
    public string Status { get; private set; } = "Draft";
    public int VersionNo { get; private set; } = 1;
    public long? PriorContractId { get; private set; }

    public static ServiceContract Create(ServiceContractDraft draft, long? userId)
    {
        var entity = new ServiceContract
        {
            CompanyId = draft.CompanyId,
            BranchId = draft.BranchId,
            CreatedOn = DateTimeOffset.UtcNow,
            CreatedByUserId = userId
        };
        entity.Update(draft, userId);
        return entity;
    }

    public void Update(ServiceContractDraft draft, long? userId)
    {
        ContractNo = draft.ContractNo.Trim();
        CustomerId = draft.CustomerId;
        InstalledAssetId = draft.InstalledAssetId;
        StartDate = draft.StartDate;
        EndDate = draft.EndDate;
        RenewalDate = draft.RenewalDate;
        CoverageSummary = draft.CoverageSummary.Trim();
        VisitFrequencyDays = draft.VisitFrequencyDays;
        PreventiveScheduleJson = Normalize(draft.PreventiveScheduleJson);
        SlaResponseHours = draft.SlaResponseHours;
        BillingTermsId = draft.BillingTermsId;
        ContractValueAmount = draft.ContractValueAmount;
        TaxCodeId = draft.TaxCodeId;
        TaxRateSnapshot = draft.TaxRateSnapshot;
        Status = draft.Status.Trim();
        VersionNo = draft.VersionNo <= 0 ? 1 : draft.VersionNo;
        PriorContractId = draft.PriorContractId;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}

public sealed record ServiceContractDraft(
    long CompanyId,
    long? BranchId,
    string ContractNo,
    long CustomerId,
    long? InstalledAssetId,
    DateOnly StartDate,
    DateOnly EndDate,
    DateOnly? RenewalDate,
    string CoverageSummary,
    int? VisitFrequencyDays,
    string? PreventiveScheduleJson,
    int? SlaResponseHours,
    long? BillingTermsId,
    decimal? ContractValueAmount,
    long? TaxCodeId,
    decimal? TaxRateSnapshot,
    string Status,
    int VersionNo,
    long? PriorContractId);

public sealed class ServiceTicket : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private ServiceTicket()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string TicketNo { get; private set; } = string.Empty;
    public long CustomerId { get; private set; }
    public long? ContactId { get; private set; }
    public long? InstalledAssetId { get; private set; }
    public long? ItemId { get; private set; }
    public string? SerialNo { get; private set; }
    public string IssueCategory { get; private set; } = string.Empty;
    public string IssueDescription { get; private set; } = string.Empty;
    public string Priority { get; private set; } = "Medium";
    public string Severity { get; private set; } = "Normal";
    public string Channel { get; private set; } = "Internal";
    public long? SourceIntegrationMessageId { get; private set; }
    public string EntitlementType { get; private set; } = "Unknown";
    public string? EntitlementSource { get; private set; }
    public long? EntitlementPolicyId { get; private set; }
    public long? EntitlementContractId { get; private set; }
    public string? EntitlementSnapshotJson { get; private set; }
    public DateOnly? EntitlementCheckedOn { get; private set; }
    public long? AssignedOwnerUserId { get; private set; }
    public long? AssignedTeamId { get; private set; }
    public DateTimeOffset? TargetResponseOn { get; private set; }
    public DateTimeOffset? TargetResolutionOn { get; private set; }
    public string Status { get; private set; } = "Registered";
    public string? InternalRemarks { get; private set; }
    public string? CustomerFacingRemarks { get; private set; }
    public long? SourceSalesOrderId { get; private set; }
    public long? SourceDispatchId { get; private set; }
    public long? SourceInvoiceId { get; private set; }
    public string? AssetSnapshotJson { get; private set; }
    public string? ReopenReason { get; private set; }
    public DateTimeOffset? ClosedOn { get; private set; }
    public long? ClosedByUserId { get; private set; }
    public string? ClosureReason { get; private set; }

    public static ServiceTicket Create(ServiceTicketDraft draft, EntitlementSnapshot entitlement, string? assetSnapshotJson, long? userId)
    {
        var entity = new ServiceTicket
        {
            CompanyId = draft.CompanyId,
            BranchId = draft.BranchId,
            CreatedOn = DateTimeOffset.UtcNow,
            CreatedByUserId = userId
        };
        entity.UpdateDraft(draft, entitlement, assetSnapshotJson, userId);
        return entity;
    }

    public void UpdateDraft(ServiceTicketDraft draft, EntitlementSnapshot entitlement, string? assetSnapshotJson, long? userId)
    {
        if (IsClosed())
        {
            throw new InvalidOperationException("Closed service tickets cannot be edited without reopen.");
        }

        TicketNo = draft.TicketNo.Trim();
        CustomerId = draft.CustomerId;
        ContactId = draft.ContactId;
        InstalledAssetId = draft.InstalledAssetId;
        ItemId = draft.ItemId;
        SerialNo = Normalize(draft.SerialNo);
        IssueCategory = draft.IssueCategory.Trim();
        IssueDescription = draft.IssueDescription.Trim();
        Priority = draft.Priority.Trim();
        Severity = draft.Severity.Trim();
        Channel = draft.Channel.Trim();
        SourceIntegrationMessageId = draft.SourceIntegrationMessageId;
        AssignedOwnerUserId = draft.AssignedOwnerUserId;
        AssignedTeamId = draft.AssignedTeamId;
        TargetResponseOn = draft.TargetResponseOn;
        TargetResolutionOn = draft.TargetResolutionOn;
        Status = draft.Status.Trim();
        InternalRemarks = Normalize(draft.InternalRemarks);
        CustomerFacingRemarks = Normalize(draft.CustomerFacingRemarks);
        SourceSalesOrderId = draft.SourceSalesOrderId;
        SourceDispatchId = draft.SourceDispatchId;
        SourceInvoiceId = draft.SourceInvoiceId;
        ApplyEntitlement(entitlement, assetSnapshotJson, userId);
    }

    public void Assign(long? ownerUserId, long? teamId, DateTimeOffset? targetResponseOn, DateTimeOffset? targetResolutionOn, long? userId)
    {
        if (IsClosed())
        {
            throw new InvalidOperationException("Closed service tickets cannot be assigned without reopen.");
        }

        AssignedOwnerUserId = ownerUserId;
        AssignedTeamId = teamId;
        TargetResponseOn = targetResponseOn;
        TargetResolutionOn = targetResolutionOn;
        Status = "Assigned";
        Touch(userId);
    }

    public void ChangeStatus(string status, string? reason, long? userId)
    {
        var normalized = status.Trim();
        if (IsClosed() && !string.Equals(normalized, "Reopened", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Closed service tickets cannot change status without reopen.");
        }

        if (string.Equals(normalized, "Closed", StringComparison.OrdinalIgnoreCase))
        {
            if (string.IsNullOrWhiteSpace(reason))
            {
                throw new InvalidOperationException("Closure reason is required.");
            }

            ClosedOn = DateTimeOffset.UtcNow;
            ClosedByUserId = userId;
            ClosureReason = reason.Trim();
        }

        if (string.Equals(normalized, "Reopened", StringComparison.OrdinalIgnoreCase))
        {
            if (string.IsNullOrWhiteSpace(reason))
            {
                throw new InvalidOperationException("Reopen reason is required.");
            }

            ReopenReason = reason.Trim();
            ClosedOn = null;
            ClosedByUserId = null;
            ClosureReason = null;
        }

        Status = normalized;
        Touch(userId);
    }

    private bool IsClosed() => string.Equals(Status, "Closed", StringComparison.OrdinalIgnoreCase);

    private void ApplyEntitlement(EntitlementSnapshot entitlement, string? assetSnapshotJson, long? userId)
    {
        EntitlementType = entitlement.EntitlementType;
        EntitlementSource = entitlement.Source;
        EntitlementPolicyId = entitlement.WarrantyPolicyId;
        EntitlementContractId = entitlement.ServiceContractId;
        EntitlementSnapshotJson = entitlement.SnapshotJson;
        EntitlementCheckedOn = entitlement.CheckedOn;
        AssetSnapshotJson = assetSnapshotJson;
        Touch(userId);
    }

    private void Touch(long? userId)
    {
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}

public sealed record ServiceTicketDraft(
    long CompanyId,
    long? BranchId,
    string TicketNo,
    long CustomerId,
    long? ContactId,
    long? InstalledAssetId,
    long? ItemId,
    string? SerialNo,
    string IssueCategory,
    string IssueDescription,
    string Priority,
    string Severity,
    string Channel,
    long? SourceIntegrationMessageId,
    long? AssignedOwnerUserId,
    long? AssignedTeamId,
    DateTimeOffset? TargetResponseOn,
    DateTimeOffset? TargetResolutionOn,
    string Status,
    string? InternalRemarks,
    string? CustomerFacingRemarks,
    long? SourceSalesOrderId,
    long? SourceDispatchId,
    long? SourceInvoiceId);

public sealed record EntitlementSnapshot(
    string EntitlementType,
    string Source,
    long? WarrantyPolicyId,
    long? ServiceContractId,
    DateOnly? StartDate,
    DateOnly? EndDate,
    DateOnly CheckedOn,
    string SnapshotJson);

public sealed class ServiceVisit : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private ServiceVisit()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public long ServiceTicketId { get; private set; }
    public long? TechnicianUserId { get; private set; }
    public long? TeamId { get; private set; }
    public DateTimeOffset? ScheduledStartOn { get; private set; }
    public DateTimeOffset? ScheduledEndOn { get; private set; }
    public string? VisitAddressSnapshot { get; private set; }
    public DateTimeOffset? TravelStartedOn { get; private set; }
    public DateTimeOffset? WorkStartedOn { get; private set; }
    public DateTimeOffset? WorkEndedOn { get; private set; }
    public string? WorkPerformed { get; private set; }
    public string? Diagnosis { get; private set; }
    public string? Resolution { get; private set; }
    public string? CustomerSignoffName { get; private set; }
    public DateTimeOffset? CustomerSignoffOn { get; private set; }
    public long? EvidenceAttachmentId { get; private set; }
    public long? PhotoEvidenceId { get; private set; }
    public string Status { get; private set; } = "Planned";
    public string? Remarks { get; private set; }

    public static ServiceVisit Create(ServiceVisitDraft draft, long? userId)
    {
        var entity = new ServiceVisit
        {
            CompanyId = draft.CompanyId,
            BranchId = draft.BranchId,
            ServiceTicketId = draft.ServiceTicketId,
            CreatedOn = DateTimeOffset.UtcNow,
            CreatedByUserId = userId
        };
        entity.Update(draft, userId);
        return entity;
    }

    public void Update(ServiceVisitDraft draft, long? userId)
    {
        TechnicianUserId = draft.TechnicianUserId;
        TeamId = draft.TeamId;
        ScheduledStartOn = draft.ScheduledStartOn;
        ScheduledEndOn = draft.ScheduledEndOn;
        VisitAddressSnapshot = Normalize(draft.VisitAddressSnapshot);
        TravelStartedOn = draft.TravelStartedOn;
        WorkStartedOn = draft.WorkStartedOn;
        WorkEndedOn = draft.WorkEndedOn;
        WorkPerformed = Normalize(draft.WorkPerformed);
        Diagnosis = Normalize(draft.Diagnosis);
        Resolution = Normalize(draft.Resolution);
        CustomerSignoffName = Normalize(draft.CustomerSignoffName);
        CustomerSignoffOn = draft.CustomerSignoffOn;
        EvidenceAttachmentId = draft.EvidenceAttachmentId;
        PhotoEvidenceId = draft.PhotoEvidenceId;
        Status = draft.Status.Trim();
        Remarks = Normalize(draft.Remarks);
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}

public sealed record ServiceVisitDraft(
    long CompanyId,
    long? BranchId,
    long ServiceTicketId,
    long? TechnicianUserId,
    long? TeamId,
    DateTimeOffset? ScheduledStartOn,
    DateTimeOffset? ScheduledEndOn,
    string? VisitAddressSnapshot,
    DateTimeOffset? TravelStartedOn,
    DateTimeOffset? WorkStartedOn,
    DateTimeOffset? WorkEndedOn,
    string? WorkPerformed,
    string? Diagnosis,
    string? Resolution,
    string? CustomerSignoffName,
    DateTimeOffset? CustomerSignoffOn,
    long? EvidenceAttachmentId,
    long? PhotoEvidenceId,
    string Status,
    string? Remarks);

public sealed class ServiceSpareMovement : AuditableEntity, ICompanyScoped, IBranchScoped, IWarehouseScoped
{
    private ServiceSpareMovement()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public long? WarehouseId { get; private set; }
    public string MovementNo { get; private set; } = string.Empty;
    public string MovementType { get; private set; } = "Issue";
    public long ServiceTicketId { get; private set; }
    public long? ServiceVisitId { get; private set; }
    public long ItemId { get; private set; }
    public long? ItemRevisionId { get; private set; }
    public long? BinId { get; private set; }
    public long? LotId { get; private set; }
    public long? SerialId { get; private set; }
    public string? SerialNo { get; private set; }
    public long? PcidId { get; private set; }
    public decimal Quantity { get; private set; }
    public string InventoryState { get; private set; } = "Available";
    public long? StockTransactionId { get; private set; }
    public long? ReplacementInstalledAssetId { get; private set; }
    public long? DefectiveInstalledAssetId { get; private set; }
    public string Status { get; private set; } = "Draft";
    public string? ReasonCode { get; private set; }
    public string? Remarks { get; private set; }

    public static ServiceSpareMovement Create(ServiceSpareMovementDraft draft, long? userId)
    {
        var entity = new ServiceSpareMovement
        {
            CompanyId = draft.CompanyId,
            BranchId = draft.BranchId,
            CreatedOn = DateTimeOffset.UtcNow,
            CreatedByUserId = userId
        };
        entity.Update(draft, userId);
        return entity;
    }

    public void Update(ServiceSpareMovementDraft draft, long? userId)
    {
        MovementNo = draft.MovementNo.Trim();
        MovementType = draft.MovementType.Trim();
        ServiceTicketId = draft.ServiceTicketId;
        ServiceVisitId = draft.ServiceVisitId;
        ItemId = draft.ItemId;
        ItemRevisionId = draft.ItemRevisionId;
        WarehouseId = draft.WarehouseId;
        BinId = draft.BinId;
        LotId = draft.LotId;
        SerialId = draft.SerialId;
        SerialNo = Normalize(draft.SerialNo);
        PcidId = draft.PcidId;
        Quantity = draft.Quantity;
        InventoryState = draft.InventoryState.Trim();
        ReplacementInstalledAssetId = draft.ReplacementInstalledAssetId;
        DefectiveInstalledAssetId = draft.DefectiveInstalledAssetId;
        ReasonCode = Normalize(draft.ReasonCode);
        Remarks = Normalize(draft.Remarks);
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void MarkPosted(long? stockTransactionId, long? userId)
    {
        StockTransactionId = stockTransactionId;
        Status = "Posted";
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void MarkFailed(string reason, long? userId)
    {
        Status = "Failed";
        Remarks = string.IsNullOrWhiteSpace(Remarks) ? reason : $"{Remarks}; {reason}";
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}

public sealed record ServiceSpareMovementDraft(
    long CompanyId,
    long? BranchId,
    string MovementNo,
    string MovementType,
    long ServiceTicketId,
    long? ServiceVisitId,
    long ItemId,
    long? ItemRevisionId,
    long WarehouseId,
    long? BinId,
    long? LotId,
    long? SerialId,
    string? SerialNo,
    long? PcidId,
    decimal Quantity,
    string InventoryState,
    long? ReplacementInstalledAssetId,
    long? DefectiveInstalledAssetId,
    string? ReasonCode,
    string? Remarks);

public sealed class WarrantyClaim : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private WarrantyClaim()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string ClaimNo { get; private set; } = string.Empty;
    public long ServiceTicketId { get; private set; }
    public long? InstalledAssetId { get; private set; }
    public long CustomerId { get; private set; }
    public long? ItemId { get; private set; }
    public string? SerialNo { get; private set; }
    public string ClaimType { get; private set; } = "Repair";
    public string EntitlementType { get; private set; } = "Unknown";
    public string? EntitlementSnapshotJson { get; private set; }
    public string ApprovalStatus { get; private set; } = "Draft";
    public string? Disposition { get; private set; }
    public long? ReplacementAssetId { get; private set; }
    public string? CostDecision { get; private set; }
    public string? RejectionReason { get; private set; }
    public string? OverrideReason { get; private set; }
    public string Status { get; private set; } = "Draft";

    public static WarrantyClaim Create(WarrantyClaimDraft draft, long? userId)
    {
        var entity = new WarrantyClaim
        {
            CompanyId = draft.CompanyId,
            BranchId = draft.BranchId,
            CreatedOn = DateTimeOffset.UtcNow,
            CreatedByUserId = userId
        };
        entity.Update(draft, userId);
        return entity;
    }

    public void Update(WarrantyClaimDraft draft, long? userId)
    {
        ClaimNo = draft.ClaimNo.Trim();
        ServiceTicketId = draft.ServiceTicketId;
        InstalledAssetId = draft.InstalledAssetId;
        CustomerId = draft.CustomerId;
        ItemId = draft.ItemId;
        SerialNo = Normalize(draft.SerialNo);
        ClaimType = draft.ClaimType.Trim();
        EntitlementType = draft.EntitlementType.Trim();
        EntitlementSnapshotJson = Normalize(draft.EntitlementSnapshotJson);
        ApprovalStatus = draft.ApprovalStatus.Trim();
        Disposition = Normalize(draft.Disposition);
        ReplacementAssetId = draft.ReplacementAssetId;
        CostDecision = Normalize(draft.CostDecision);
        RejectionReason = Normalize(draft.RejectionReason);
        OverrideReason = Normalize(draft.OverrideReason);
        Status = draft.Status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void Decide(string approvalStatus, string? disposition, string? rejectionReason, string? overrideReason, long? replacementAssetId, long? userId)
    {
        ApprovalStatus = approvalStatus.Trim();
        Disposition = Normalize(disposition);
        RejectionReason = Normalize(rejectionReason);
        OverrideReason = Normalize(overrideReason);
        ReplacementAssetId = replacementAssetId;
        Status = string.Equals(ApprovalStatus, "Approved", StringComparison.OrdinalIgnoreCase) ? "Approved" : "Rejected";
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}

public sealed record WarrantyClaimDraft(
    long CompanyId,
    long? BranchId,
    string ClaimNo,
    long ServiceTicketId,
    long? InstalledAssetId,
    long CustomerId,
    long? ItemId,
    string? SerialNo,
    string ClaimType,
    string EntitlementType,
    string? EntitlementSnapshotJson,
    string ApprovalStatus,
    string? Disposition,
    long? ReplacementAssetId,
    string? CostDecision,
    string? RejectionReason,
    string? OverrideReason,
    string Status);

public sealed class ServiceCharge : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private ServiceCharge()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string ChargeNo { get; private set; } = string.Empty;
    public long ServiceTicketId { get; private set; }
    public long CustomerId { get; private set; }
    public long? CurrencyId { get; private set; }
    public decimal LaborAmount { get; private set; }
    public decimal PartsAmount { get; private set; }
    public decimal TravelAmount { get; private set; }
    public decimal OtherAmount { get; private set; }
    public decimal DiscountAmount { get; private set; }
    public long? TaxCodeId { get; private set; }
    public decimal? TaxRateSnapshot { get; private set; }
    public decimal TaxAmount { get; private set; }
    public decimal TotalAmount { get; private set; }
    public string BillableStatus { get; private set; } = "Billable";
    public string? NonBillableReason { get; private set; }
    public long? ArInvoiceId { get; private set; }
    public string Status { get; private set; } = "Draft";
    public string SnapshotJson { get; private set; } = "{}";

    public static ServiceCharge Create(ServiceChargeDraft draft, long? userId)
    {
        var entity = new ServiceCharge
        {
            CompanyId = draft.CompanyId,
            BranchId = draft.BranchId,
            CreatedOn = DateTimeOffset.UtcNow,
            CreatedByUserId = userId
        };
        entity.Update(draft, userId);
        return entity;
    }

    public void Update(ServiceChargeDraft draft, long? userId)
    {
        ChargeNo = draft.ChargeNo.Trim();
        ServiceTicketId = draft.ServiceTicketId;
        CustomerId = draft.CustomerId;
        CurrencyId = draft.CurrencyId;
        LaborAmount = draft.LaborAmount;
        PartsAmount = draft.PartsAmount;
        TravelAmount = draft.TravelAmount;
        OtherAmount = draft.OtherAmount;
        DiscountAmount = draft.DiscountAmount;
        TaxCodeId = draft.TaxCodeId;
        TaxRateSnapshot = draft.TaxRateSnapshot;
        TaxAmount = draft.TaxAmount;
        TotalAmount = draft.TotalAmount;
        BillableStatus = draft.BillableStatus.Trim();
        NonBillableReason = Normalize(draft.NonBillableReason);
        ArInvoiceId = draft.ArInvoiceId;
        Status = draft.Status.Trim();
        SnapshotJson = string.IsNullOrWhiteSpace(draft.SnapshotJson) ? "{}" : draft.SnapshotJson.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void MarkInvoiceReady(long? userId)
    {
        Status = "InvoiceReady";
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}

public sealed record ServiceChargeDraft(
    long CompanyId,
    long? BranchId,
    string ChargeNo,
    long ServiceTicketId,
    long CustomerId,
    long? CurrencyId,
    decimal LaborAmount,
    decimal PartsAmount,
    decimal TravelAmount,
    decimal OtherAmount,
    decimal DiscountAmount,
    long? TaxCodeId,
    decimal? TaxRateSnapshot,
    decimal TaxAmount,
    decimal TotalAmount,
    string BillableStatus,
    string? NonBillableReason,
    long? ArInvoiceId,
    string Status,
    string SnapshotJson);
