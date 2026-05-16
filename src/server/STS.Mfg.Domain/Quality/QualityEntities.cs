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

public sealed class InspectionPlanCharacteristic : AuditableEntity
{
    private InspectionPlanCharacteristic()
    {
    }

    public long InspectionPlanId { get; private set; }
    public int LineNo { get; private set; }
    public string ParameterCode { get; private set; } = string.Empty;
    public string ParameterName { get; private set; } = string.Empty;
    public string CharacteristicType { get; private set; } = string.Empty;
    public string? ExpectedValue { get; private set; }
    public decimal? LowerLimit { get; private set; }
    public decimal? UpperLimit { get; private set; }
    public long? UomId { get; private set; }
    public int SampleSize { get; private set; }
    public bool IsMandatory { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public string? Remarks { get; private set; }

    public static InspectionPlanCharacteristic Create(
        long inspectionPlanId,
        int lineNo,
        string parameterCode,
        string parameterName,
        string characteristicType,
        string? expectedValue,
        decimal? lowerLimit,
        decimal? upperLimit,
        long? uomId,
        int sampleSize,
        bool isMandatory,
        string status,
        string? remarks,
        long? userId)
    {
        var entity = new InspectionPlanCharacteristic { InspectionPlanId = inspectionPlanId, LineNo = lineNo };
        entity.Update(parameterCode, parameterName, characteristicType, expectedValue, lowerLimit, upperLimit, uomId, sampleSize, isMandatory, status, remarks, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string parameterCode,
        string parameterName,
        string characteristicType,
        string? expectedValue,
        decimal? lowerLimit,
        decimal? upperLimit,
        long? uomId,
        int sampleSize,
        bool isMandatory,
        string status,
        string? remarks,
        long? userId)
    {
        ParameterCode = parameterCode.Trim();
        ParameterName = parameterName.Trim();
        CharacteristicType = characteristicType.Trim();
        ExpectedValue = string.IsNullOrWhiteSpace(expectedValue) ? null : expectedValue.Trim();
        LowerLimit = lowerLimit;
        UpperLimit = upperLimit;
        UomId = uomId;
        SampleSize = sampleSize;
        IsMandatory = isMandatory;
        Status = status.Trim();
        Remarks = string.IsNullOrWhiteSpace(remarks) ? null : remarks.Trim();
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
    public string? DefectCategory { get; private set; }
    public string? ContainmentAction { get; private set; }
    public string? RootCause { get; private set; }
    public string? CorrectiveAction { get; private set; }
    public string? PreventiveAction { get; private set; }
    public DateTimeOffset? DispositionReleasedOn { get; private set; }
    public long? DispositionReleasedByUserId { get; private set; }
    public DateTimeOffset? ClosedOn { get; private set; }
    public long? ClosedByUserId { get; private set; }
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
        string? defectCategory,
        string? containmentAction,
        string? rootCause,
        string? correctiveAction,
        string? preventiveAction,
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
        entity.Update(ncrNo, sourceDocumentType, disposition, status, defectCategory, containmentAction, rootCause, correctiveAction, preventiveAction, remarks, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string ncrNo,
        string sourceDocumentType,
        string disposition,
        string status,
        string? defectCategory,
        string? containmentAction,
        string? rootCause,
        string? correctiveAction,
        string? preventiveAction,
        string? remarks,
        long? userId)
    {
        NcrNo = ncrNo.Trim();
        SourceDocumentType = sourceDocumentType.Trim();
        Disposition = disposition.Trim();
        Status = status.Trim();
        DefectCategory = string.IsNullOrWhiteSpace(defectCategory) ? null : defectCategory.Trim();
        ContainmentAction = string.IsNullOrWhiteSpace(containmentAction) ? null : containmentAction.Trim();
        RootCause = string.IsNullOrWhiteSpace(rootCause) ? null : rootCause.Trim();
        CorrectiveAction = string.IsNullOrWhiteSpace(correctiveAction) ? null : correctiveAction.Trim();
        PreventiveAction = string.IsNullOrWhiteSpace(preventiveAction) ? null : preventiveAction.Trim();
        Remarks = string.IsNullOrWhiteSpace(remarks) ? null : remarks.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void ReleaseDisposition(
        string disposition,
        string? containmentAction,
        string? rootCause,
        string? correctiveAction,
        string? preventiveAction,
        string? remarks,
        long? userId)
    {
        Disposition = disposition.Trim();
        ContainmentAction = string.IsNullOrWhiteSpace(containmentAction) ? ContainmentAction : containmentAction.Trim();
        RootCause = string.IsNullOrWhiteSpace(rootCause) ? RootCause : rootCause.Trim();
        CorrectiveAction = string.IsNullOrWhiteSpace(correctiveAction) ? CorrectiveAction : correctiveAction.Trim();
        PreventiveAction = string.IsNullOrWhiteSpace(preventiveAction) ? PreventiveAction : preventiveAction.Trim();
        Remarks = string.IsNullOrWhiteSpace(remarks) ? Remarks : remarks.Trim();
        Status = "DispositionReleased";
        DispositionReleasedOn = DateTimeOffset.UtcNow;
        DispositionReleasedByUserId = userId;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void Close(string? remarks, long? userId)
    {
        Status = "Closed";
        if (!string.IsNullOrWhiteSpace(remarks))
        {
            Remarks = remarks.Trim();
        }

        ClosedOn = DateTimeOffset.UtcNow;
        ClosedByUserId = userId;
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

public sealed class NonConformanceLine : AuditableEntity
{
    private NonConformanceLine()
    {
    }

    public long NonConformanceId { get; private set; }
    public int LineNo { get; private set; }
    public long? ItemId { get; private set; }
    public long? ItemRevisionId { get; private set; }
    public long? LotId { get; private set; }
    public long? SerialId { get; private set; }
    public decimal? AffectedQuantity { get; private set; }
    public long? UomId { get; private set; }
    public string DefectCode { get; private set; } = string.Empty;
    public string DefectDescription { get; private set; } = string.Empty;
    public string Disposition { get; private set; } = string.Empty;
    public string? Remarks { get; private set; }

    public static NonConformanceLine Create(
        long nonConformanceId,
        int lineNo,
        long? itemId,
        long? itemRevisionId,
        long? lotId,
        long? serialId,
        decimal? affectedQuantity,
        long? uomId,
        string defectCode,
        string defectDescription,
        string disposition,
        string? remarks,
        long? userId)
    {
        var entity = new NonConformanceLine { NonConformanceId = nonConformanceId, LineNo = lineNo };
        entity.Update(itemId, itemRevisionId, lotId, serialId, affectedQuantity, uomId, defectCode, defectDescription, disposition, remarks, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        long? itemId,
        long? itemRevisionId,
        long? lotId,
        long? serialId,
        decimal? affectedQuantity,
        long? uomId,
        string defectCode,
        string defectDescription,
        string disposition,
        string? remarks,
        long? userId)
    {
        ItemId = itemId;
        ItemRevisionId = itemRevisionId;
        LotId = lotId;
        SerialId = serialId;
        AffectedQuantity = affectedQuantity;
        UomId = uomId;
        DefectCode = defectCode.Trim();
        DefectDescription = defectDescription.Trim();
        Disposition = disposition.Trim();
        Remarks = string.IsNullOrWhiteSpace(remarks) ? null : remarks.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class CoaCertificate : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private CoaCertificate()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string CoaNo { get; private set; } = string.Empty;
    public long InspectionRecordId { get; private set; }
    public string SourceDocumentType { get; private set; } = string.Empty;
    public long? SourceDocumentId { get; private set; }
    public long? LotId { get; private set; }
    public long? SerialId { get; private set; }
    public string TemplateCode { get; private set; } = string.Empty;
    public int VersionNo { get; private set; }
    public string StoragePath { get; private set; } = string.Empty;
    public string Status { get; private set; } = string.Empty;
    public DateTimeOffset GeneratedOn { get; private set; }
    public long? GeneratedByUserId { get; private set; }
    public DateTimeOffset? IssuedOn { get; private set; }
    public long? IssuedByUserId { get; private set; }
    public string? ReissueReason { get; private set; }

    public static CoaCertificate Create(
        long companyId,
        long branchId,
        string coaNo,
        long inspectionRecordId,
        string sourceDocumentType,
        long? sourceDocumentId,
        long? lotId,
        long? serialId,
        string templateCode,
        int versionNo,
        string storagePath,
        string status,
        string? reissueReason,
        long? userId)
    {
        var entity = new CoaCertificate
        {
            CompanyId = companyId,
            BranchId = branchId,
            InspectionRecordId = inspectionRecordId,
            SourceDocumentId = sourceDocumentId,
            LotId = lotId,
            SerialId = serialId
        };
        entity.Update(coaNo, sourceDocumentType, templateCode, versionNo, storagePath, status, reissueReason, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string coaNo,
        string sourceDocumentType,
        string templateCode,
        int versionNo,
        string storagePath,
        string status,
        string? reissueReason,
        long? userId)
    {
        CoaNo = coaNo.Trim();
        SourceDocumentType = sourceDocumentType.Trim();
        TemplateCode = templateCode.Trim();
        VersionNo = versionNo;
        StoragePath = storagePath.Trim();
        Status = status.Trim();
        ReissueReason = string.IsNullOrWhiteSpace(reissueReason) ? null : reissueReason.Trim();
        GeneratedOn = DateTimeOffset.UtcNow;
        GeneratedByUserId = userId;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void MarkIssued(long? userId)
    {
        Status = "Issued";
        IssuedOn = DateTimeOffset.UtcNow;
        IssuedByUserId = userId;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class CoaCertificateLine : AuditableEntity
{
    private CoaCertificateLine()
    {
    }

    public long CoaCertificateId { get; private set; }
    public int LineNo { get; private set; }
    public string ParameterCode { get; private set; } = string.Empty;
    public string? ExpectedValue { get; private set; }
    public string? ActualValue { get; private set; }
    public string ResultStatus { get; private set; } = string.Empty;
    public string? Remarks { get; private set; }

    public static CoaCertificateLine Create(
        long coaCertificateId,
        int lineNo,
        string parameterCode,
        string? expectedValue,
        string? actualValue,
        string resultStatus,
        string? remarks,
        long? userId)
    {
        var entity = new CoaCertificateLine { CoaCertificateId = coaCertificateId, LineNo = lineNo };
        entity.Update(parameterCode, expectedValue, actualValue, resultStatus, remarks, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string parameterCode, string? expectedValue, string? actualValue, string resultStatus, string? remarks, long? userId)
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
