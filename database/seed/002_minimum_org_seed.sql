DECLARE @now DATETIMEOFFSET(7) = SYSUTCDATETIME();

IF NOT EXISTS (SELECT 1 FROM org.Companies WHERE Id = 1 OR CompanyCode = N'ACME')
BEGIN
    SET IDENTITY_INSERT org.Companies ON;
    INSERT INTO org.Companies
        (Id, CompanyCode, CompanyName, LegalName, TaxRegistrationNo, TimeZoneId, DefaultLanguageId, BaseCurrencyCode, DefaultCalendarCode, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (1, N'ACME', N'Acme Manufacturing', N'Acme Manufacturing Private Limited', NULL, N'Asia/Kolkata', NULL, N'INR', N'IND-MFG-2026', N'Active', @now, NULL, @now, NULL);
    SET IDENTITY_INSERT org.Companies OFF;
END;

IF NOT EXISTS (SELECT 1 FROM org.Shifts WHERE Id = 1 OR (CompanyId = 1 AND BranchId = 11 AND ShiftCode = N'GENERAL'))
BEGIN
    SET IDENTITY_INSERT org.Shifts ON;
    INSERT INTO org.Shifts
        (Id, CompanyId, BranchId, ShiftCode, ShiftName, StartTime, EndTime, CrossesMidnight, BreakMinutes, SequenceNo, CalendarProfileCode, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (1, 1, 11, N'GENERAL', N'General Shift', '08:00', '16:30', 0, 45, 1, N'IND-MFG-2026', N'Active', @now, NULL, @now, NULL);
    SET IDENTITY_INSERT org.Shifts OFF;
END;

IF NOT EXISTS (SELECT 1 FROM org.Shifts WHERE Id = 2 OR (CompanyId = 1 AND BranchId = 12 AND ShiftCode = N'GENERAL'))
BEGIN
    SET IDENTITY_INSERT org.Shifts ON;
    INSERT INTO org.Shifts
        (Id, CompanyId, BranchId, ShiftCode, ShiftName, StartTime, EndTime, CrossesMidnight, BreakMinutes, SequenceNo, CalendarProfileCode, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (2, 1, 12, N'GENERAL', N'General Shift', '08:00', '16:30', 0, 45, 1, N'IND-MFG-2026', N'Active', @now, NULL, @now, NULL);
    SET IDENTITY_INSERT org.Shifts OFF;
END;

IF NOT EXISTS (SELECT 1 FROM org.Branches WHERE Id = 11 OR (CompanyId = 1 AND BranchCode = N'ACME-N'))
BEGIN
    SET IDENTITY_INSERT org.Branches ON;
    INSERT INTO org.Branches
        (Id, CompanyId, BranchCode, BranchName, BranchType, TimeZoneId, DefaultLanguageId, DefaultCalendarCode, DefaultShiftId, DefaultWarehouseId, ContactEmail, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (11, 1, N'ACME-N', N'Acme North Plant', N'Manufacturing', N'Asia/Kolkata', NULL, N'IND-MFG-2026', 1, 101, N'north.plant@acme.local', N'Active', @now, NULL, @now, NULL);
    SET IDENTITY_INSERT org.Branches OFF;
END;

IF NOT EXISTS (SELECT 1 FROM org.Branches WHERE Id = 12 OR (CompanyId = 1 AND BranchCode = N'ACME-S'))
BEGIN
    SET IDENTITY_INSERT org.Branches ON;
    INSERT INTO org.Branches
        (Id, CompanyId, BranchCode, BranchName, BranchType, TimeZoneId, DefaultLanguageId, DefaultCalendarCode, DefaultShiftId, DefaultWarehouseId, ContactEmail, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (12, 1, N'ACME-S', N'Acme South Plant', N'Manufacturing', N'Asia/Kolkata', NULL, N'IND-MFG-2026', 2, 201, N'south.plant@acme.local', N'Active', @now, NULL, @now, NULL);
    SET IDENTITY_INSERT org.Branches OFF;
END;

IF NOT EXISTS (SELECT 1 FROM org.Departments WHERE Id = 301 OR (CompanyId = 1 AND BranchId = 11 AND DepartmentCode = N'PRD'))
BEGIN
    SET IDENTITY_INSERT org.Departments ON;
    INSERT INTO org.Departments
        (Id, CompanyId, BranchId, DepartmentCode, DepartmentName, ParentDepartmentId, ManagerUserId, DepartmentType, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (301, 1, 11, N'PRD', N'Production', NULL, 1004, N'Production', N'Active', @now, NULL, @now, NULL);
    SET IDENTITY_INSERT org.Departments OFF;
END;

IF NOT EXISTS (SELECT 1 FROM org.Departments WHERE Id = 302 OR (CompanyId = 1 AND BranchId = 12 AND DepartmentCode = N'PLN'))
BEGIN
    SET IDENTITY_INSERT org.Departments ON;
    INSERT INTO org.Departments
        (Id, CompanyId, BranchId, DepartmentCode, DepartmentName, ParentDepartmentId, ManagerUserId, DepartmentType, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (302, 1, 12, N'PLN', N'Planning', NULL, 1002, N'Planning', N'Active', @now, NULL, @now, NULL);
    SET IDENTITY_INSERT org.Departments OFF;
END;

IF NOT EXISTS (SELECT 1 FROM org.Departments WHERE Id = 401 OR (CompanyId = 1 AND BranchId = 12 AND DepartmentCode = N'QC'))
BEGIN
    SET IDENTITY_INSERT org.Departments ON;
    INSERT INTO org.Departments
        (Id, CompanyId, BranchId, DepartmentCode, DepartmentName, ParentDepartmentId, ManagerUserId, DepartmentType, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (401, 1, 12, N'QC', N'Quality Control', NULL, 1006, N'Quality', N'Active', @now, NULL, @now, NULL);
    SET IDENTITY_INSERT org.Departments OFF;
END;

IF NOT EXISTS (SELECT 1 FROM org.Warehouses WHERE Id = 101 OR (CompanyId = 1 AND WarehouseCode = N'RM-N'))
BEGIN
    SET IDENTITY_INSERT org.Warehouses ON;
    INSERT INTO org.Warehouses
        (Id, CompanyId, BranchId, WarehouseCode, WarehouseName, WarehouseType, IsDefaultReceivingWarehouse, IsDefaultIssueWarehouse, IsDispatchEnabled, AllowsMixedLots, AllowsNegativeStock, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (101, 1, 11, N'RM-N', N'North Raw Material Store', N'Raw Material', 1, 1, 0, 1, 0, N'Active', @now, NULL, @now, NULL);
    SET IDENTITY_INSERT org.Warehouses OFF;
END;

IF NOT EXISTS (SELECT 1 FROM org.Warehouses WHERE Id = 102 OR (CompanyId = 1 AND WarehouseCode = N'WIP-N'))
BEGIN
    SET IDENTITY_INSERT org.Warehouses ON;
    INSERT INTO org.Warehouses
        (Id, CompanyId, BranchId, WarehouseCode, WarehouseName, WarehouseType, IsDefaultReceivingWarehouse, IsDefaultIssueWarehouse, IsDispatchEnabled, AllowsMixedLots, AllowsNegativeStock, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (102, 1, 11, N'WIP-N', N'North WIP Store', N'WIP', 0, 1, 0, 1, 0, N'Active', @now, NULL, @now, NULL);
    SET IDENTITY_INSERT org.Warehouses OFF;
END;

IF NOT EXISTS (SELECT 1 FROM org.Warehouses WHERE Id = 201 OR (CompanyId = 1 AND WarehouseCode = N'FG-S'))
BEGIN
    SET IDENTITY_INSERT org.Warehouses ON;
    INSERT INTO org.Warehouses
        (Id, CompanyId, BranchId, WarehouseCode, WarehouseName, WarehouseType, IsDefaultReceivingWarehouse, IsDefaultIssueWarehouse, IsDispatchEnabled, AllowsMixedLots, AllowsNegativeStock, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (201, 1, 12, N'FG-S', N'South Finished Goods Dispatch', N'Finished Goods', 0, 0, 1, 0, 0, N'Active', @now, NULL, @now, NULL);
    SET IDENTITY_INSERT org.Warehouses OFF;
END;

IF NOT EXISTS (SELECT 1 FROM org.Bins WHERE Id = 1001 OR (WarehouseId = 101 AND BinCode = N'RM-A-01'))
BEGIN
    SET IDENTITY_INSERT org.Bins ON;
    INSERT INTO org.Bins
        (Id, CompanyId, BranchId, WarehouseId, ParentBinId, BinCode, BinName, BinType, CapacityValue, CapacityUomId, IsDefaultReceiveBin, IsDefaultIssueBin, IsCountCycleRequired, CountCycleDays, IsBlocked, BlockReasonCode, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (1001, 1, 11, 101, NULL, N'RM-A-01', N'Raw Material Aisle 01', N'Rack', NULL, NULL, 1, 0, 1, 30, 0, NULL, N'Active', @now, NULL, @now, NULL);
    SET IDENTITY_INSERT org.Bins OFF;
END;

IF NOT EXISTS (SELECT 1 FROM org.Bins WHERE Id = 1002 OR (WarehouseId = 102 AND BinCode = N'WIP-STAGE-01'))
BEGIN
    SET IDENTITY_INSERT org.Bins ON;
    INSERT INTO org.Bins
        (Id, CompanyId, BranchId, WarehouseId, ParentBinId, BinCode, BinName, BinType, CapacityValue, CapacityUomId, IsDefaultReceiveBin, IsDefaultIssueBin, IsCountCycleRequired, CountCycleDays, IsBlocked, BlockReasonCode, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (1002, 1, 11, 102, NULL, N'WIP-STAGE-01', N'WIP Stage 01', N'Staging', NULL, NULL, 1, 1, 0, NULL, 0, NULL, N'Active', @now, NULL, @now, NULL);
    SET IDENTITY_INSERT org.Bins OFF;
END;

IF NOT EXISTS (SELECT 1 FROM org.Bins WHERE Id = 2001 OR (WarehouseId = 201 AND BinCode = N'FG-DISPATCH-01'))
BEGIN
    SET IDENTITY_INSERT org.Bins ON;
    INSERT INTO org.Bins
        (Id, CompanyId, BranchId, WarehouseId, ParentBinId, BinCode, BinName, BinType, CapacityValue, CapacityUomId, IsDefaultReceiveBin, IsDefaultIssueBin, IsCountCycleRequired, CountCycleDays, IsBlocked, BlockReasonCode, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (2001, 1, 12, 201, NULL, N'FG-DISPATCH-01', N'Finished Goods Dispatch Stage 01', N'Staging', NULL, NULL, 1, 1, 1, 15, 0, NULL, N'Active', @now, NULL, @now, NULL);
    SET IDENTITY_INSERT org.Bins OFF;
END;
