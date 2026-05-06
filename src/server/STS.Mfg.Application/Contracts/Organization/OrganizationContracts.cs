using STS.Mfg.Application.Contracts;

namespace STS.Mfg.Application.Contracts.Organization;

public sealed record OrganizationFilter(
    int Page = 1,
    int PageSize = 25,
    string? Search = null,
    string? Status = null,
    long? CompanyId = null,
    long? BranchId = null) : QueryFilter(Page, PageSize, Search, Status);

public sealed record CompanyDto(
    long Id,
    string CompanyCode,
    string CompanyName,
    string LegalName,
    string? TaxRegistrationNo,
    string TimeZoneId,
    long? DefaultLanguageId,
    string? BaseCurrencyCode,
    string? DefaultCalendarCode,
    string Status);

public sealed record CompanyUpsertRequest(
    string CompanyCode,
    string CompanyName,
    string LegalName,
    string? TaxRegistrationNo,
    string TimeZoneId,
    long? DefaultLanguageId,
    string? BaseCurrencyCode,
    string? DefaultCalendarCode,
    string Status);

public sealed record BranchDto(
    long Id,
    long CompanyId,
    string BranchCode,
    string BranchName,
    string BranchType,
    string TimeZoneId,
    long? DefaultLanguageId,
    string? DefaultCalendarCode,
    long? DefaultShiftId,
    long? DefaultWarehouseId,
    string? ContactEmail,
    string Status);

public sealed record BranchUpsertRequest(
    long CompanyId,
    string BranchCode,
    string BranchName,
    string BranchType,
    string TimeZoneId,
    long? DefaultLanguageId,
    string? DefaultCalendarCode,
    long? DefaultShiftId,
    long? DefaultWarehouseId,
    string? ContactEmail,
    string Status);

public sealed record DepartmentDto(
    long Id,
    long CompanyId,
    long? BranchId,
    string DepartmentCode,
    string DepartmentName,
    long? ParentDepartmentId,
    long? ManagerUserId,
    string DepartmentType,
    string Status);

public sealed record DepartmentUpsertRequest(
    long CompanyId,
    long? BranchId,
    string DepartmentCode,
    string DepartmentName,
    long? ParentDepartmentId,
    long? ManagerUserId,
    string DepartmentType,
    string Status);

public sealed record ShiftDto(
    long Id,
    long CompanyId,
    long? BranchId,
    string ShiftCode,
    string ShiftName,
    TimeOnly StartTime,
    TimeOnly EndTime,
    bool CrossesMidnight,
    int BreakMinutes,
    int SequenceNo,
    string? CalendarProfileCode,
    string Status);

public sealed record ShiftUpsertRequest(
    long CompanyId,
    long? BranchId,
    string ShiftCode,
    string ShiftName,
    TimeOnly StartTime,
    TimeOnly EndTime,
    bool CrossesMidnight,
    int BreakMinutes,
    int SequenceNo,
    string? CalendarProfileCode,
    string Status);

public sealed record WarehouseDto(
    long Id,
    long CompanyId,
    long BranchId,
    string WarehouseCode,
    string WarehouseName,
    string WarehouseType,
    bool IsDefaultReceivingWarehouse,
    bool IsDefaultIssueWarehouse,
    bool IsDispatchEnabled,
    bool AllowsMixedLots,
    bool AllowsNegativeStock,
    string Status);

public sealed record WarehouseUpsertRequest(
    long CompanyId,
    long BranchId,
    string WarehouseCode,
    string WarehouseName,
    string WarehouseType,
    bool IsDefaultReceivingWarehouse,
    bool IsDefaultIssueWarehouse,
    bool IsDispatchEnabled,
    bool AllowsMixedLots,
    bool AllowsNegativeStock,
    string Status);

public sealed record BinDto(
    long Id,
    long CompanyId,
    long BranchId,
    long WarehouseId,
    long? ParentBinId,
    string BinCode,
    string BinName,
    string BinType,
    decimal? CapacityValue,
    long? CapacityUomId,
    bool IsDefaultReceiveBin,
    bool IsDefaultIssueBin,
    bool IsCountCycleRequired,
    int? CountCycleDays,
    bool IsBlocked,
    string? BlockReasonCode,
    string Status);

public sealed record BinUpsertRequest(
    long CompanyId,
    long BranchId,
    long WarehouseId,
    long? ParentBinId,
    string BinCode,
    string BinName,
    string BinType,
    decimal? CapacityValue,
    long? CapacityUomId,
    bool IsDefaultReceiveBin,
    bool IsDefaultIssueBin,
    bool IsCountCycleRequired,
    int? CountCycleDays,
    bool IsBlocked,
    string? BlockReasonCode,
    string Status);
