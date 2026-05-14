using STS.Mfg.Domain.Abstractions;

namespace STS.Mfg.Domain.SalesPlanning;

public sealed class Quote : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private Quote()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string QuoteNo { get; private set; } = string.Empty;
    public long CustomerId { get; private set; }
    public long? CustomerAddressId { get; private set; }
    public DateOnly QuoteDate { get; private set; }
    public DateOnly? ExpiryDate { get; private set; }
    public string PriorityCode { get; private set; } = string.Empty;
    public string Status { get; private set; } = string.Empty;
    public string? CustomerSpecRef { get; private set; }

    public static Quote Create(long companyId, long branchId, string quoteNo, long customerId, long? customerAddressId, DateOnly quoteDate, DateOnly? expiryDate, string priorityCode, string status, string? customerSpecRef, long? userId)
    {
        var entity = new Quote { CompanyId = companyId, BranchId = branchId, CustomerId = customerId, CustomerAddressId = customerAddressId };
        entity.Update(quoteNo, quoteDate, expiryDate, priorityCode, status, customerSpecRef, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string quoteNo, DateOnly quoteDate, DateOnly? expiryDate, string priorityCode, string status, string? customerSpecRef, long? userId)
    {
        QuoteNo = quoteNo.Trim();
        QuoteDate = quoteDate;
        ExpiryDate = expiryDate;
        PriorityCode = priorityCode.Trim();
        Status = status.Trim();
        CustomerSpecRef = string.IsNullOrWhiteSpace(customerSpecRef) ? null : customerSpecRef.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class QuoteLine : AuditableEntity
{
    private QuoteLine()
    {
    }

    public long QuoteId { get; private set; }
    public int LineNo { get; private set; }
    public long ItemId { get; private set; }
    public long? ItemVariantId { get; private set; }
    public long OrderUomId { get; private set; }
    public decimal Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal DiscountPercent { get; private set; }
    public decimal DiscountAmount { get; private set; }
    public decimal TaxPercent { get; private set; }
    public decimal TaxAmount { get; private set; }
    public decimal LineAmount { get; private set; }
    public string MakeType { get; private set; } = string.Empty;
    public DateOnly? PromisedDate { get; private set; }
    public string PriorityCode { get; private set; } = string.Empty;
    public string? CustomerSpecRef { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static QuoteLine Create(long quoteId, int lineNo, long itemId, long? itemVariantId, long orderUomId, decimal quantity, decimal unitPrice, decimal discountPercent, decimal taxPercent, string makeType, DateOnly? promisedDate, string priorityCode, string? customerSpecRef, string status, long? userId)
    {
        var entity = new QuoteLine { QuoteId = quoteId, LineNo = lineNo, ItemId = itemId, ItemVariantId = itemVariantId, OrderUomId = orderUomId };
        entity.Update(quantity, unitPrice, discountPercent, taxPercent, makeType, promisedDate, priorityCode, customerSpecRef, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(decimal quantity, decimal unitPrice, decimal discountPercent, decimal taxPercent, string makeType, DateOnly? promisedDate, string priorityCode, string? customerSpecRef, string status, long? userId)
    {
        Quantity = quantity;
        UnitPrice = unitPrice;
        DiscountPercent = discountPercent;
        TaxPercent = taxPercent;
        var grossAmount = decimal.Round(quantity * unitPrice, 2, MidpointRounding.AwayFromZero);
        DiscountAmount = decimal.Round(grossAmount * discountPercent / 100m, 2, MidpointRounding.AwayFromZero);
        var taxableAmount = grossAmount - DiscountAmount;
        TaxAmount = decimal.Round(taxableAmount * taxPercent / 100m, 2, MidpointRounding.AwayFromZero);
        LineAmount = taxableAmount + TaxAmount;
        MakeType = makeType.Trim();
        PromisedDate = promisedDate;
        PriorityCode = priorityCode.Trim();
        CustomerSpecRef = string.IsNullOrWhiteSpace(customerSpecRef) ? null : customerSpecRef.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class SalesOrder : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private SalesOrder()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string SalesOrderNo { get; private set; } = string.Empty;
    public long CustomerId { get; private set; }
    public long? BillToAddressId { get; private set; }
    public long? ShipToAddressId { get; private set; }
    public DateOnly OrderDate { get; private set; }
    public DateOnly? PromisedDate { get; private set; }
    public string PriorityCode { get; private set; } = string.Empty;
    public string Status { get; private set; } = string.Empty;
    public long? SourceQuoteId { get; private set; }

    public static SalesOrder Create(long companyId, long branchId, string salesOrderNo, long customerId, long? billToAddressId, long? shipToAddressId, DateOnly orderDate, DateOnly? promisedDate, string priorityCode, string status, long? sourceQuoteId, long? userId)
    {
        var entity = new SalesOrder { CompanyId = companyId, BranchId = branchId, CustomerId = customerId, BillToAddressId = billToAddressId, ShipToAddressId = shipToAddressId, SourceQuoteId = sourceQuoteId };
        entity.Update(salesOrderNo, orderDate, promisedDate, priorityCode, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string salesOrderNo, DateOnly orderDate, DateOnly? promisedDate, string priorityCode, string status, long? userId)
    {
        SalesOrderNo = salesOrderNo.Trim();
        OrderDate = orderDate;
        PromisedDate = promisedDate;
        PriorityCode = priorityCode.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class SalesOrderLine : AuditableEntity
{
    private SalesOrderLine()
    {
    }

    public long SalesOrderId { get; private set; }
    public int LineNo { get; private set; }
    public long ItemId { get; private set; }
    public long? ItemVariantId { get; private set; }
    public long OrderUomId { get; private set; }
    public decimal Quantity { get; private set; }
    public string MakeType { get; private set; } = string.Empty;
    public DateOnly? PromisedDate { get; private set; }
    public string PriorityCode { get; private set; } = string.Empty;
    public string? CustomerSpecRef { get; private set; }
    public DateOnly? RequestedShipDate { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static SalesOrderLine Create(long salesOrderId, int lineNo, long itemId, long? itemVariantId, long orderUomId, decimal quantity, string makeType, DateOnly? promisedDate, string priorityCode, string? customerSpecRef, DateOnly? requestedShipDate, string status, long? userId)
    {
        var entity = new SalesOrderLine { SalesOrderId = salesOrderId, LineNo = lineNo, ItemId = itemId, ItemVariantId = itemVariantId, OrderUomId = orderUomId };
        entity.Update(quantity, makeType, promisedDate, priorityCode, customerSpecRef, requestedShipDate, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(decimal quantity, string makeType, DateOnly? promisedDate, string priorityCode, string? customerSpecRef, DateOnly? requestedShipDate, string status, long? userId)
    {
        Quantity = quantity;
        MakeType = makeType.Trim();
        PromisedDate = promisedDate;
        PriorityCode = priorityCode.Trim();
        CustomerSpecRef = string.IsNullOrWhiteSpace(customerSpecRef) ? null : customerSpecRef.Trim();
        RequestedShipDate = requestedShipDate;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class BlanketOrder : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private BlanketOrder()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string BlanketOrderNo { get; private set; } = string.Empty;
    public long CustomerId { get; private set; }
    public DateOnly StartDate { get; private set; }
    public DateOnly EndDate { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static BlanketOrder Create(long companyId, long? branchId, string blanketOrderNo, long customerId, DateOnly startDate, DateOnly endDate, string status, long? userId)
    {
        var entity = new BlanketOrder { CompanyId = companyId, BranchId = branchId, CustomerId = customerId };
        entity.Update(blanketOrderNo, startDate, endDate, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string blanketOrderNo, DateOnly startDate, DateOnly endDate, string status, long? userId)
    {
        BlanketOrderNo = blanketOrderNo.Trim();
        StartDate = startDate;
        EndDate = endDate;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class BlanketOrderSchedule : AuditableEntity
{
    private BlanketOrderSchedule()
    {
    }

    public long BlanketOrderId { get; private set; }
    public int LineNo { get; private set; }
    public long ItemId { get; private set; }
    public DateOnly ScheduleDate { get; private set; }
    public decimal Quantity { get; private set; }
    public long OrderUomId { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static BlanketOrderSchedule Create(long blanketOrderId, int lineNo, long itemId, DateOnly scheduleDate, decimal quantity, long orderUomId, string status, long? userId)
    {
        var entity = new BlanketOrderSchedule { BlanketOrderId = blanketOrderId, LineNo = lineNo, ItemId = itemId, OrderUomId = orderUomId };
        entity.Update(scheduleDate, quantity, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(DateOnly scheduleDate, decimal quantity, string status, long? userId)
    {
        ScheduleDate = scheduleDate;
        Quantity = quantity;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class DemandForecast : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private DemandForecast()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string ForecastCode { get; private set; } = string.Empty;
    public string ForecastName { get; private set; } = string.Empty;
    public string PeriodType { get; private set; } = string.Empty;
    public string Status { get; private set; } = string.Empty;

    public static DemandForecast Create(long companyId, long? branchId, string forecastCode, string forecastName, string periodType, string status, long? userId)
    {
        var entity = new DemandForecast { CompanyId = companyId, BranchId = branchId };
        entity.Update(forecastCode, forecastName, periodType, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string forecastCode, string forecastName, string periodType, string status, long? userId)
    {
        ForecastCode = forecastCode.Trim();
        ForecastName = forecastName.Trim();
        PeriodType = periodType.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class DemandForecastLine : AuditableEntity
{
    private DemandForecastLine()
    {
    }

    public long DemandForecastId { get; private set; }
    public int LineNo { get; private set; }
    public long ItemId { get; private set; }
    public DateOnly ForecastPeriodStart { get; private set; }
    public DateOnly ForecastPeriodEnd { get; private set; }
    public decimal Quantity { get; private set; }
    public long ForecastUomId { get; private set; }

    public static DemandForecastLine Create(long demandForecastId, int lineNo, long itemId, DateOnly forecastPeriodStart, DateOnly forecastPeriodEnd, decimal quantity, long forecastUomId, long? userId)
    {
        var entity = new DemandForecastLine { DemandForecastId = demandForecastId, LineNo = lineNo, ItemId = itemId, ForecastUomId = forecastUomId };
        entity.Update(forecastPeriodStart, forecastPeriodEnd, quantity, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(DateOnly forecastPeriodStart, DateOnly forecastPeriodEnd, decimal quantity, long? userId)
    {
        ForecastPeriodStart = forecastPeriodStart;
        ForecastPeriodEnd = forecastPeriodEnd;
        Quantity = quantity;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class MasterProductionSchedule : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private MasterProductionSchedule()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string MpsCode { get; private set; } = string.Empty;
    public DateOnly PlanningHorizonStart { get; private set; }
    public DateOnly PlanningHorizonEnd { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static MasterProductionSchedule Create(long companyId, long branchId, string mpsCode, DateOnly planningHorizonStart, DateOnly planningHorizonEnd, string status, long? userId)
    {
        var entity = new MasterProductionSchedule { CompanyId = companyId, BranchId = branchId };
        entity.Update(mpsCode, planningHorizonStart, planningHorizonEnd, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string mpsCode, DateOnly planningHorizonStart, DateOnly planningHorizonEnd, string status, long? userId)
    {
        MpsCode = mpsCode.Trim();
        PlanningHorizonStart = planningHorizonStart;
        PlanningHorizonEnd = planningHorizonEnd;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class MpsLine : AuditableEntity
{
    private MpsLine()
    {
    }

    public long MasterProductionScheduleId { get; private set; }
    public int LineNo { get; private set; }
    public long ItemId { get; private set; }
    public DateOnly PeriodStart { get; private set; }
    public DateOnly PeriodEnd { get; private set; }
    public decimal PlannedQuantity { get; private set; }
    public long PlanningUomId { get; private set; }

    public static MpsLine Create(long masterProductionScheduleId, int lineNo, long itemId, DateOnly periodStart, DateOnly periodEnd, decimal plannedQuantity, long planningUomId, long? userId)
    {
        var entity = new MpsLine { MasterProductionScheduleId = masterProductionScheduleId, LineNo = lineNo, ItemId = itemId, PlanningUomId = planningUomId };
        entity.Update(periodStart, periodEnd, plannedQuantity, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(DateOnly periodStart, DateOnly periodEnd, decimal plannedQuantity, long? userId)
    {
        PeriodStart = periodStart;
        PeriodEnd = periodEnd;
        PlannedQuantity = plannedQuantity;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class MrpRun : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private MrpRun()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string RunCode { get; private set; } = string.Empty;
    public string RunType { get; private set; } = string.Empty;
    public long? TriggeredFromMpsId { get; private set; }
    public DateOnly PlanningHorizonStart { get; private set; }
    public DateOnly PlanningHorizonEnd { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public DateTimeOffset RunStartedOn { get; private set; }
    public DateTimeOffset? RunCompletedOn { get; private set; }

    public static MrpRun Create(long companyId, long branchId, string runCode, string runType, long? triggeredFromMpsId, DateOnly planningHorizonStart, DateOnly planningHorizonEnd, string status, DateTimeOffset runStartedOn, DateTimeOffset? runCompletedOn, long? userId)
    {
        var entity = new MrpRun { CompanyId = companyId, BranchId = branchId, TriggeredFromMpsId = triggeredFromMpsId };
        entity.Update(runCode, runType, planningHorizonStart, planningHorizonEnd, status, runStartedOn, runCompletedOn, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string runCode, string runType, DateOnly planningHorizonStart, DateOnly planningHorizonEnd, string status, DateTimeOffset runStartedOn, DateTimeOffset? runCompletedOn, long? userId)
    {
        RunCode = runCode.Trim();
        RunType = runType.Trim();
        PlanningHorizonStart = planningHorizonStart;
        PlanningHorizonEnd = planningHorizonEnd;
        Status = status.Trim();
        RunStartedOn = runStartedOn;
        RunCompletedOn = runCompletedOn;
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class MrpRunItem : AuditableEntity
{
    private MrpRunItem()
    {
    }

    public long MrpRunId { get; private set; }
    public long ItemId { get; private set; }
    public string DemandSourceType { get; private set; } = string.Empty;
    public decimal GrossRequirementQty { get; private set; }
    public decimal NetRequirementQty { get; private set; }
    public decimal AvailableQtyAtRun { get; private set; }
    public string RecommendedAction { get; private set; } = string.Empty;
    public string? ExceptionCode { get; private set; }

    public static MrpRunItem Create(long mrpRunId, long itemId, string demandSourceType, decimal grossRequirementQty, decimal netRequirementQty, decimal availableQtyAtRun, string recommendedAction, string? exceptionCode, long? userId)
    {
        var entity = new MrpRunItem { MrpRunId = mrpRunId, ItemId = itemId };
        entity.Update(demandSourceType, grossRequirementQty, netRequirementQty, availableQtyAtRun, recommendedAction, exceptionCode, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string demandSourceType, decimal grossRequirementQty, decimal netRequirementQty, decimal availableQtyAtRun, string recommendedAction, string? exceptionCode, long? userId)
    {
        DemandSourceType = demandSourceType.Trim();
        GrossRequirementQty = grossRequirementQty;
        NetRequirementQty = netRequirementQty;
        AvailableQtyAtRun = availableQtyAtRun;
        RecommendedAction = recommendedAction.Trim();
        ExceptionCode = string.IsNullOrWhiteSpace(exceptionCode) ? null : exceptionCode.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class BoqRequirement : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private BoqRequirement()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public long? MrpRunId { get; private set; }
    public string SourceDocumentType { get; private set; } = string.Empty;
    public long? SourceDocumentId { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static BoqRequirement Create(long companyId, long branchId, long? mrpRunId, string sourceDocumentType, long? sourceDocumentId, string status, long? userId)
    {
        var entity = new BoqRequirement { CompanyId = companyId, BranchId = branchId, MrpRunId = mrpRunId, SourceDocumentId = sourceDocumentId };
        entity.Update(sourceDocumentType, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string sourceDocumentType, string status, long? userId)
    {
        SourceDocumentType = sourceDocumentType.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class BoqRequirementLine : AuditableEntity, IUserOwnedRecord
{
    private BoqRequirementLine()
    {
    }

    public long BoqRequirementId { get; private set; }
    public int LineNo { get; private set; }
    public long ItemId { get; private set; }
    public decimal RequiredQuantity { get; private set; }
    public long RequirementUomId { get; private set; }
    public DateOnly NeedByDate { get; private set; }
    public string RecommendedAction { get; private set; } = string.Empty;
    public string? ApprovedAction { get; private set; }
    public string? OverrideReasonCode { get; private set; }
    public long? OverriddenByUserId { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public long? OwnerUserId => OverriddenByUserId;

    public static BoqRequirementLine Create(long boqRequirementId, int lineNo, long itemId, decimal requiredQuantity, long requirementUomId, DateOnly needByDate, string recommendedAction, string? approvedAction, string? overrideReasonCode, long? overriddenByUserId, string status, long? userId)
    {
        var entity = new BoqRequirementLine { BoqRequirementId = boqRequirementId, LineNo = lineNo, ItemId = itemId, RequirementUomId = requirementUomId };
        entity.Update(requiredQuantity, needByDate, recommendedAction, approvedAction, overrideReasonCode, overriddenByUserId, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(decimal requiredQuantity, DateOnly needByDate, string recommendedAction, string? approvedAction, string? overrideReasonCode, long? overriddenByUserId, string status, long? userId)
    {
        RequiredQuantity = requiredQuantity;
        NeedByDate = needByDate;
        RecommendedAction = recommendedAction.Trim();
        ApprovedAction = string.IsNullOrWhiteSpace(approvedAction) ? null : approvedAction.Trim();
        OverrideReasonCode = string.IsNullOrWhiteSpace(overrideReasonCode) ? null : overrideReasonCode.Trim();
        OverriddenByUserId = overriddenByUserId;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class PlanningPlan : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private PlanningPlan()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string PlanCode { get; private set; } = string.Empty;
    public string PlanName { get; private set; } = string.Empty;
    public string PlanType { get; private set; } = string.Empty;
    public DateOnly HorizonStart { get; private set; }
    public DateOnly HorizonEnd { get; private set; }
    public int FirmFenceDays { get; private set; }
    public int ForecastFenceDays { get; private set; }
    public bool IncludeForecast { get; private set; }
    public bool IncludeCapacity { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static PlanningPlan Create(long companyId, long branchId, string planCode, string planName, string planType, DateOnly horizonStart, DateOnly horizonEnd, int firmFenceDays, int forecastFenceDays, bool includeForecast, bool includeCapacity, string status, long? userId)
    {
        var entity = new PlanningPlan { CompanyId = companyId, BranchId = branchId };
        entity.Update(planCode, planName, planType, horizonStart, horizonEnd, firmFenceDays, forecastFenceDays, includeForecast, includeCapacity, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string planCode, string planName, string planType, DateOnly horizonStart, DateOnly horizonEnd, int firmFenceDays, int forecastFenceDays, bool includeForecast, bool includeCapacity, string status, long? userId)
    {
        PlanCode = planCode.Trim();
        PlanName = planName.Trim();
        PlanType = planType.Trim();
        HorizonStart = horizonStart;
        HorizonEnd = horizonEnd;
        FirmFenceDays = firmFenceDays;
        ForecastFenceDays = forecastFenceDays;
        IncludeForecast = includeForecast;
        IncludeCapacity = includeCapacity;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class PlanningSnapshot : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private PlanningSnapshot()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public long? PlanningPlanId { get; private set; }
    public long? MrpRunId { get; private set; }
    public string SnapshotCode { get; private set; } = string.Empty;
    public string SnapshotType { get; private set; } = string.Empty;
    public string InputHash { get; private set; } = string.Empty;
    public string OutputHash { get; private set; } = string.Empty;
    public int DemandLineCount { get; private set; }
    public int SupplyLineCount { get; private set; }
    public int ExceptionCount { get; private set; }
    public decimal PlannedQuantity { get; private set; }
    public DateTimeOffset CapturedOn { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static PlanningSnapshot Create(long companyId, long branchId, long? planningPlanId, long? mrpRunId, string snapshotCode, string snapshotType, string inputHash, string outputHash, int demandLineCount, int supplyLineCount, int exceptionCount, decimal plannedQuantity, string status, long? userId)
    {
        var entity = new PlanningSnapshot { CompanyId = companyId, BranchId = branchId, PlanningPlanId = planningPlanId, MrpRunId = mrpRunId };
        entity.Update(snapshotCode, snapshotType, inputHash, outputHash, demandLineCount, supplyLineCount, exceptionCount, plannedQuantity, status, userId);
        entity.CapturedOn = DateTimeOffset.UtcNow;
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string snapshotCode, string snapshotType, string inputHash, string outputHash, int demandLineCount, int supplyLineCount, int exceptionCount, decimal plannedQuantity, string status, long? userId)
    {
        SnapshotCode = snapshotCode.Trim();
        SnapshotType = snapshotType.Trim();
        InputHash = inputHash.Trim();
        OutputHash = outputHash.Trim();
        DemandLineCount = demandLineCount;
        SupplyLineCount = supplyLineCount;
        ExceptionCount = exceptionCount;
        PlannedQuantity = plannedQuantity;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class PlannedOrder : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private PlannedOrder()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public long? PlanningPlanId { get; private set; }
    public long? MrpRunId { get; private set; }
    public long? BoqRequirementLineId { get; private set; }
    public string PlannedOrderNo { get; private set; } = string.Empty;
    public string OrderType { get; private set; } = string.Empty;
    public long ItemId { get; private set; }
    public decimal Quantity { get; private set; }
    public long UomId { get; private set; }
    public DateOnly PlannedStartDate { get; private set; }
    public DateOnly PlannedDueDate { get; private set; }
    public long? SourceWarehouseId { get; private set; }
    public long? TargetWarehouseId { get; private set; }
    public long? BomRevisionId { get; private set; }
    public long? RoutingId { get; private set; }
    public bool IsFirm { get; private set; }
    public bool IsReleased { get; private set; }
    public bool IsExpedite { get; private set; }
    public string PeggingSourceType { get; private set; } = string.Empty;
    public long? PeggingSourceId { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public long? TargetDocumentId { get; private set; }
    public string? TargetDocumentType { get; private set; }

    public static PlannedOrder Create(long companyId, long branchId, long? planningPlanId, long? mrpRunId, long? boqRequirementLineId, string plannedOrderNo, string orderType, long itemId, decimal quantity, long uomId, DateOnly plannedStartDate, DateOnly plannedDueDate, long? sourceWarehouseId, long? targetWarehouseId, long? bomRevisionId, long? routingId, bool isFirm, bool isExpedite, string peggingSourceType, long? peggingSourceId, string status, long? userId)
    {
        var entity = new PlannedOrder
        {
            CompanyId = companyId,
            BranchId = branchId,
            PlanningPlanId = planningPlanId,
            MrpRunId = mrpRunId,
            BoqRequirementLineId = boqRequirementLineId
        };
        entity.Update(plannedOrderNo, orderType, itemId, quantity, uomId, plannedStartDate, plannedDueDate, sourceWarehouseId, targetWarehouseId, bomRevisionId, routingId, isFirm, isExpedite, peggingSourceType, peggingSourceId, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string plannedOrderNo, string orderType, long itemId, decimal quantity, long uomId, DateOnly plannedStartDate, DateOnly plannedDueDate, long? sourceWarehouseId, long? targetWarehouseId, long? bomRevisionId, long? routingId, bool isFirm, bool isExpedite, string peggingSourceType, long? peggingSourceId, string status, long? userId)
    {
        PlannedOrderNo = plannedOrderNo.Trim();
        OrderType = orderType.Trim();
        ItemId = itemId;
        Quantity = quantity;
        UomId = uomId;
        PlannedStartDate = plannedStartDate;
        PlannedDueDate = plannedDueDate;
        SourceWarehouseId = sourceWarehouseId;
        TargetWarehouseId = targetWarehouseId;
        BomRevisionId = bomRevisionId;
        RoutingId = routingId;
        IsFirm = isFirm;
        IsExpedite = isExpedite;
        PeggingSourceType = peggingSourceType.Trim();
        PeggingSourceId = peggingSourceId;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void Firm(long? userId)
    {
        IsFirm = true;
        Status = "Firm";
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    public void MarkConverted(string targetDocumentType, long targetDocumentId, long? userId)
    {
        TargetDocumentType = targetDocumentType.Trim();
        TargetDocumentId = targetDocumentId;
        IsReleased = true;
        Status = "Converted";
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class ShortageAction : AuditableEntity, ICompanyScoped, IBranchScoped, IUserOwnedRecord
{
    private ShortageAction()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public long? PlannedOrderId { get; private set; }
    public long? MrpRunItemId { get; private set; }
    public long ItemId { get; private set; }
    public decimal ShortageQuantity { get; private set; }
    public string ActionType { get; private set; } = string.Empty;
    public long? OwnerUserId { get; private set; }
    public DateOnly DueDate { get; private set; }
    public string ReasonCode { get; private set; } = string.Empty;
    public string Status { get; private set; } = string.Empty;
    public string ResolutionNote { get; private set; } = string.Empty;

    public static ShortageAction Create(long companyId, long branchId, long? plannedOrderId, long? mrpRunItemId, long itemId, decimal shortageQuantity, string actionType, long? ownerUserId, DateOnly dueDate, string reasonCode, string status, string resolutionNote, long? userId)
    {
        var entity = new ShortageAction { CompanyId = companyId, BranchId = branchId, PlannedOrderId = plannedOrderId, MrpRunItemId = mrpRunItemId };
        entity.Update(itemId, shortageQuantity, actionType, ownerUserId, dueDate, reasonCode, status, resolutionNote, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(long itemId, decimal shortageQuantity, string actionType, long? ownerUserId, DateOnly dueDate, string reasonCode, string status, string resolutionNote, long? userId)
    {
        ItemId = itemId;
        ShortageQuantity = shortageQuantity;
        ActionType = actionType.Trim();
        OwnerUserId = ownerUserId;
        DueDate = dueDate;
        ReasonCode = reasonCode.Trim();
        Status = status.Trim();
        ResolutionNote = resolutionNote.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}
