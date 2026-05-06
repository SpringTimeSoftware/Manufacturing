using STS.Mfg.Domain.Abstractions;

namespace STS.Mfg.Domain.Quality;

public sealed class InspectionPlan : AuditableEntity, ICompanyScoped
{
    private InspectionPlan()
    {
    }

    public long? CompanyId { get; private set; }
    public string PlanCode { get; private set; } = string.Empty;
    public string PlanName { get; private set; } = string.Empty;
    public string InspectionType { get; private set; } = string.Empty;
    public long? ItemId { get; private set; }
    public long? OperationId { get; private set; }
    public bool AutoHoldOnFail { get; private set; }
    public bool AutoCreateNcrOnFail { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static InspectionPlan Create(
        long companyId,
        string planCode,
        string planName,
        string inspectionType,
        long? itemId,
        long? operationId,
        bool autoHoldOnFail,
        bool autoCreateNcrOnFail,
        string status,
        long? userId)
    {
        var entity = new InspectionPlan { CompanyId = companyId, ItemId = itemId, OperationId = operationId };
        entity.Update(planCode, planName, inspectionType, autoHoldOnFail, autoCreateNcrOnFail, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string planCode,
        string planName,
        string inspectionType,
        bool autoHoldOnFail,
        bool autoCreateNcrOnFail,
        string status,
        long? userId)
    {
        PlanCode = planCode.Trim();
        PlanName = planName.Trim();
        InspectionType = inspectionType.Trim();
        AutoHoldOnFail = autoHoldOnFail;
        AutoCreateNcrOnFail = autoCreateNcrOnFail;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class InspectionRecord : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private InspectionRecord()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string InspectionNo { get; private set; } = string.Empty;
    public long? InspectionPlanId { get; private set; }
    public string InspectionType { get; private set; } = string.Empty;
    public string SourceDocumentType { get; private set; } = string.Empty;
    public long? SourceDocumentId { get; private set; }
    public long? LotId { get; private set; }
    public long? SerialId { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public string OverallResult { get; private set; } = string.Empty;
    public string? RequestToken { get; private set; }
    public string? Notes { get; private set; }
    public DateTimeOffset? HeldOn { get; private set; }
    public DateTimeOffset? ReleasedOn { get; private set; }

    public static InspectionRecord Create(
        long companyId,
        long branchId,
        string inspectionNo,
        long? inspectionPlanId,
        string inspectionType,
        string sourceDocumentType,
        long? sourceDocumentId,
        long? lotId,
        long? serialId,
        string status,
        string overallResult,
        string? requestToken,
        string? notes,
        long? userId)
    {
        var entity = new InspectionRecord
        {
            CompanyId = companyId,
            BranchId = branchId,
            InspectionPlanId = inspectionPlanId,
            SourceDocumentId = sourceDocumentId,
            LotId = lotId,
            SerialId = serialId
        };
        entity.Update(inspectionNo, inspectionType, sourceDocumentType, status, overallResult, requestToken, notes, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string inspectionNo,
        string inspectionType,
        string sourceDocumentType,
        string status,
        string overallResult,
        string? requestToken,
        string? notes,
        long? userId)
    {
        InspectionNo = inspectionNo.Trim();
        InspectionType = inspectionType.Trim();
        SourceDocumentType = sourceDocumentType.Trim();
        Status = status.Trim();
        OverallResult = overallResult.Trim();
        RequestToken = string.IsNullOrWhiteSpace(requestToken) ? null : requestToken.Trim();
        Notes = string.IsNullOrWhiteSpace(notes) ? null : notes.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void MarkHeld(string? notes, long? userId)
    {
        Status = "Held";
        OverallResult = "Hold";
        HeldOn = DateTimeOffset.UtcNow;
        if (!string.IsNullOrWhiteSpace(notes))
        {
            Notes = notes.Trim();
        }

        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void MarkReleased(string? notes, long? userId)
    {
        Status = "Released";
        OverallResult = "Pass";
        ReleasedOn = DateTimeOffset.UtcNow;
        if (!string.IsNullOrWhiteSpace(notes))
        {
            Notes = notes.Trim();
        }

        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class InspectionResult : AuditableEntity
{
    private InspectionResult()
    {
    }

    public long InspectionRecordId { get; private set; }
    public int LineNo { get; private set; }
    public string ParameterCode { get; private set; } = string.Empty;
    public string? ExpectedValue { get; private set; }
    public string? ActualValue { get; private set; }
    public string ResultStatus { get; private set; } = string.Empty;
    public string? Remarks { get; private set; }

    public static InspectionResult Create(
        long inspectionRecordId,
        int lineNo,
        string parameterCode,
        string? expectedValue,
        string? actualValue,
        string resultStatus,
        string? remarks,
        long? userId)
    {
        var entity = new InspectionResult { InspectionRecordId = inspectionRecordId, LineNo = lineNo };
        entity.Update(parameterCode, expectedValue, actualValue, resultStatus, remarks, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string parameterCode,
        string? expectedValue,
        string? actualValue,
        string resultStatus,
        string? remarks,
        long? userId)
    {
        ParameterCode = parameterCode.Trim();
        ExpectedValue = string.IsNullOrWhiteSpace(expectedValue) ? null : expectedValue.Trim();
        ActualValue = string.IsNullOrWhiteSpace(actualValue) ? null : actualValue.Trim();
        ResultStatus = resultStatus.Trim();
        Remarks = string.IsNullOrWhiteSpace(remarks) ? null : remarks.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class NonConformance : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private NonConformance()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string NcrNo { get; private set; } = string.Empty;
    public string SourceDocumentType { get; private set; } = string.Empty;
    public long? SourceDocumentId { get; private set; }
    public long? LotId { get; private set; }
    public long? SerialId { get; private set; }
    public string Disposition { get; private set; } = string.Empty;
    public string Status { get; private set; } = string.Empty;
    public string? RootCause { get; private set; }
    public long? ReworkOrderId { get; private set; }
    public string? Remarks { get; private set; }

    public static NonConformance Create(
        long companyId,
        long branchId,
        string ncrNo,
        string sourceDocumentType,
        long? sourceDocumentId,
        long? lotId,
        long? serialId,
        string disposition,
        string status,
        string? rootCause,
        long? reworkOrderId,
        string? remarks,
        long? userId)
    {
        var entity = new NonConformance
        {
            CompanyId = companyId,
            BranchId = branchId,
            SourceDocumentId = sourceDocumentId,
            LotId = lotId,
            SerialId = serialId,
            ReworkOrderId = reworkOrderId
        };
        entity.Update(ncrNo, sourceDocumentType, disposition, status, rootCause, remarks, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string ncrNo,
        string sourceDocumentType,
        string disposition,
        string status,
        string? rootCause,
        string? remarks,
        long? userId)
    {
        NcrNo = ncrNo.Trim();
        SourceDocumentType = sourceDocumentType.Trim();
        Disposition = disposition.Trim();
        Status = status.Trim();
        RootCause = string.IsNullOrWhiteSpace(rootCause) ? null : rootCause.Trim();
        Remarks = string.IsNullOrWhiteSpace(remarks) ? null : remarks.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void LinkRework(long? reworkOrderId, long? userId)
    {
        ReworkOrderId = reworkOrderId;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}
