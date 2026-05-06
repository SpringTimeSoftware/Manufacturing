using STS.Mfg.Domain.Abstractions;

namespace STS.Mfg.Domain.Organization;

public sealed class Company : AuditableEntity, ICompanyScoped
{
    private Company()
    {
    }

    public long? CompanyId => Id;
    public string CompanyCode { get; private set; } = string.Empty;
    public string CompanyName { get; private set; } = string.Empty;
    public string LegalName { get; private set; } = string.Empty;
    public string? TaxRegistrationNo { get; private set; }
    public string TimeZoneId { get; private set; } = string.Empty;
    public long? DefaultLanguageId { get; private set; }
    public string? BaseCurrencyCode { get; private set; }
    public string? DefaultCalendarCode { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static Company Create(
        string companyCode,
        string companyName,
        string legalName,
        string? taxRegistrationNo,
        string timeZoneId,
        long? defaultLanguageId,
        string? baseCurrencyCode,
        string? defaultCalendarCode,
        string status,
        long? userId)
    {
        var entity = new Company();
        entity.Update(companyCode, companyName, legalName, taxRegistrationNo, timeZoneId, defaultLanguageId, baseCurrencyCode, defaultCalendarCode, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string companyCode,
        string companyName,
        string legalName,
        string? taxRegistrationNo,
        string timeZoneId,
        long? defaultLanguageId,
        string? baseCurrencyCode,
        string? defaultCalendarCode,
        string status,
        long? userId)
    {
        CompanyCode = companyCode.Trim();
        CompanyName = companyName.Trim();
        LegalName = legalName.Trim();
        TaxRegistrationNo = string.IsNullOrWhiteSpace(taxRegistrationNo) ? null : taxRegistrationNo.Trim();
        TimeZoneId = timeZoneId.Trim();
        DefaultLanguageId = defaultLanguageId;
        BaseCurrencyCode = string.IsNullOrWhiteSpace(baseCurrencyCode) ? null : baseCurrencyCode.Trim();
        DefaultCalendarCode = string.IsNullOrWhiteSpace(defaultCalendarCode) ? null : defaultCalendarCode.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class Branch : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private Branch()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId => Id;
    public string BranchCode { get; private set; } = string.Empty;
    public string BranchName { get; private set; } = string.Empty;
    public string BranchType { get; private set; } = string.Empty;
    public string TimeZoneId { get; private set; } = string.Empty;
    public long? DefaultLanguageId { get; private set; }
    public string? DefaultCalendarCode { get; private set; }
    public long? DefaultShiftId { get; private set; }
    public long? DefaultWarehouseId { get; private set; }
    public string? ContactEmail { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static Branch Create(
        long companyId,
        string branchCode,
        string branchName,
        string branchType,
        string timeZoneId,
        long? defaultLanguageId,
        string? defaultCalendarCode,
        long? defaultShiftId,
        long? defaultWarehouseId,
        string? contactEmail,
        string status,
        long? userId)
    {
        var entity = new Branch { CompanyId = companyId };
        entity.Update(branchCode, branchName, branchType, timeZoneId, defaultLanguageId, defaultCalendarCode, defaultShiftId, defaultWarehouseId, contactEmail, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string branchCode,
        string branchName,
        string branchType,
        string timeZoneId,
        long? defaultLanguageId,
        string? defaultCalendarCode,
        long? defaultShiftId,
        long? defaultWarehouseId,
        string? contactEmail,
        string status,
        long? userId)
    {
        BranchCode = branchCode.Trim();
        BranchName = branchName.Trim();
        BranchType = branchType.Trim();
        TimeZoneId = timeZoneId.Trim();
        DefaultLanguageId = defaultLanguageId;
        DefaultCalendarCode = string.IsNullOrWhiteSpace(defaultCalendarCode) ? null : defaultCalendarCode.Trim();
        DefaultShiftId = defaultShiftId;
        DefaultWarehouseId = defaultWarehouseId;
        ContactEmail = string.IsNullOrWhiteSpace(contactEmail) ? null : contactEmail.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class Department : AuditableEntity, ICompanyScoped, IBranchScoped, IUserOwnedRecord
{
    private Department()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string DepartmentCode { get; private set; } = string.Empty;
    public string DepartmentName { get; private set; } = string.Empty;
    public long? ParentDepartmentId { get; private set; }
    public long? ManagerUserId { get; private set; }
    public string DepartmentType { get; private set; } = string.Empty;
    public string Status { get; private set; } = string.Empty;
    public long? OwnerUserId => ManagerUserId;

    public static Department Create(
        long companyId,
        long? branchId,
        string departmentCode,
        string departmentName,
        long? parentDepartmentId,
        long? managerUserId,
        string departmentType,
        string status,
        long? userId)
    {
        var entity = new Department { CompanyId = companyId, BranchId = branchId };
        entity.Update(departmentCode, departmentName, parentDepartmentId, managerUserId, departmentType, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string departmentCode,
        string departmentName,
        long? parentDepartmentId,
        long? managerUserId,
        string departmentType,
        string status,
        long? userId)
    {
        DepartmentCode = departmentCode.Trim();
        DepartmentName = departmentName.Trim();
        ParentDepartmentId = parentDepartmentId;
        ManagerUserId = managerUserId;
        DepartmentType = departmentType.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class Shift : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private Shift()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public string ShiftCode { get; private set; } = string.Empty;
    public string ShiftName { get; private set; } = string.Empty;
    public TimeOnly StartTime { get; private set; }
    public TimeOnly EndTime { get; private set; }
    public bool CrossesMidnight { get; private set; }
    public int BreakMinutes { get; private set; }
    public int SequenceNo { get; private set; }
    public string? CalendarProfileCode { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static Shift Create(
        long companyId,
        long? branchId,
        string shiftCode,
        string shiftName,
        TimeOnly startTime,
        TimeOnly endTime,
        bool crossesMidnight,
        int breakMinutes,
        int sequenceNo,
        string? calendarProfileCode,
        string status,
        long? userId)
    {
        var entity = new Shift { CompanyId = companyId, BranchId = branchId };
        entity.Update(shiftCode, shiftName, startTime, endTime, crossesMidnight, breakMinutes, sequenceNo, calendarProfileCode, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string shiftCode,
        string shiftName,
        TimeOnly startTime,
        TimeOnly endTime,
        bool crossesMidnight,
        int breakMinutes,
        int sequenceNo,
        string? calendarProfileCode,
        string status,
        long? userId)
    {
        ShiftCode = shiftCode.Trim();
        ShiftName = shiftName.Trim();
        StartTime = startTime;
        EndTime = endTime;
        CrossesMidnight = crossesMidnight;
        BreakMinutes = breakMinutes;
        SequenceNo = sequenceNo;
        CalendarProfileCode = string.IsNullOrWhiteSpace(calendarProfileCode) ? null : calendarProfileCode.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class Warehouse : AuditableEntity, ICompanyScoped, IBranchScoped, IWarehouseScoped
{
    private Warehouse()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public long? WarehouseId => Id;
    public string WarehouseCode { get; private set; } = string.Empty;
    public string WarehouseName { get; private set; } = string.Empty;
    public string WarehouseType { get; private set; } = string.Empty;
    public bool IsDefaultReceivingWarehouse { get; private set; }
    public bool IsDefaultIssueWarehouse { get; private set; }
    public bool IsDispatchEnabled { get; private set; }
    public bool AllowsMixedLots { get; private set; }
    public bool AllowsNegativeStock { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static Warehouse Create(
        long companyId,
        long branchId,
        string warehouseCode,
        string warehouseName,
        string warehouseType,
        bool isDefaultReceivingWarehouse,
        bool isDefaultIssueWarehouse,
        bool isDispatchEnabled,
        bool allowsMixedLots,
        bool allowsNegativeStock,
        string status,
        long? userId)
    {
        var entity = new Warehouse { CompanyId = companyId, BranchId = branchId };
        entity.Update(warehouseCode, warehouseName, warehouseType, isDefaultReceivingWarehouse, isDefaultIssueWarehouse, isDispatchEnabled, allowsMixedLots, allowsNegativeStock, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string warehouseCode,
        string warehouseName,
        string warehouseType,
        bool isDefaultReceivingWarehouse,
        bool isDefaultIssueWarehouse,
        bool isDispatchEnabled,
        bool allowsMixedLots,
        bool allowsNegativeStock,
        string status,
        long? userId)
    {
        WarehouseCode = warehouseCode.Trim();
        WarehouseName = warehouseName.Trim();
        WarehouseType = warehouseType.Trim();
        IsDefaultReceivingWarehouse = isDefaultReceivingWarehouse;
        IsDefaultIssueWarehouse = isDefaultIssueWarehouse;
        IsDispatchEnabled = isDispatchEnabled;
        AllowsMixedLots = allowsMixedLots;
        AllowsNegativeStock = allowsNegativeStock;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class Bin : AuditableEntity, ICompanyScoped, IBranchScoped, IWarehouseScoped
{
    private Bin()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public long? WarehouseId { get; private set; }
    public long? ParentBinId { get; private set; }
    public string BinCode { get; private set; } = string.Empty;
    public string BinName { get; private set; } = string.Empty;
    public string BinType { get; private set; } = string.Empty;
    public decimal? CapacityValue { get; private set; }
    public long? CapacityUomId { get; private set; }
    public bool IsDefaultReceiveBin { get; private set; }
    public bool IsDefaultIssueBin { get; private set; }
    public bool IsCountCycleRequired { get; private set; }
    public int? CountCycleDays { get; private set; }
    public bool IsBlocked { get; private set; }
    public string? BlockReasonCode { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static Bin Create(
        long companyId,
        long branchId,
        long warehouseId,
        long? parentBinId,
        string binCode,
        string binName,
        string binType,
        decimal? capacityValue,
        long? capacityUomId,
        bool isDefaultReceiveBin,
        bool isDefaultIssueBin,
        bool isCountCycleRequired,
        int? countCycleDays,
        bool isBlocked,
        string? blockReasonCode,
        string status,
        long? userId)
    {
        var entity = new Bin { CompanyId = companyId, BranchId = branchId, WarehouseId = warehouseId };
        entity.Update(parentBinId, binCode, binName, binType, capacityValue, capacityUomId, isDefaultReceiveBin, isDefaultIssueBin, isCountCycleRequired, countCycleDays, isBlocked, blockReasonCode, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        long? parentBinId,
        string binCode,
        string binName,
        string binType,
        decimal? capacityValue,
        long? capacityUomId,
        bool isDefaultReceiveBin,
        bool isDefaultIssueBin,
        bool isCountCycleRequired,
        int? countCycleDays,
        bool isBlocked,
        string? blockReasonCode,
        string status,
        long? userId)
    {
        ParentBinId = parentBinId;
        BinCode = binCode.Trim();
        BinName = binName.Trim();
        BinType = binType.Trim();
        CapacityValue = capacityValue;
        CapacityUomId = capacityUomId;
        IsDefaultReceiveBin = isDefaultReceiveBin;
        IsDefaultIssueBin = isDefaultIssueBin;
        IsCountCycleRequired = isCountCycleRequired;
        CountCycleDays = countCycleDays;
        IsBlocked = isBlocked;
        BlockReasonCode = string.IsNullOrWhiteSpace(blockReasonCode) ? null : blockReasonCode.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}
