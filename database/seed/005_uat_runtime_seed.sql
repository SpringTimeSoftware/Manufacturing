SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;

DECLARE @now DATETIMEOFFSET(7) = SYSUTCDATETIME();
DECLARE @today DATE = CONVERT(date, @now);
DECLARE @routingOperationId BIGINT =
(
    SELECT TOP (1) Id
    FROM resource.RoutingOperations
    WHERE RoutingId = 53001 AND SequenceNo = 10
    ORDER BY Id
);

IF NOT EXISTS (SELECT 1 FROM sales.SalesOrders WHERE Id = 80001 OR (CompanyId = 1 AND SalesOrderNo = N'SO-UAT-0001'))
BEGIN
    SET IDENTITY_INSERT sales.SalesOrders ON;
    INSERT INTO sales.SalesOrders
        (Id, CompanyId, BranchId, SalesOrderNo, CustomerId, BillToAddressId, ShipToAddressId, OrderDate, PromisedDate, PriorityCode, Status, SourceQuoteId, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (80001, 1, 12, N'SO-UAT-0001', 20001, NULL, NULL, DATEADD(day, -2, @today), DATEADD(day, 5, @today), N'High', N'Committed', NULL, @now, 1008, @now, 1008);
    SET IDENTITY_INSERT sales.SalesOrders OFF;
END;

IF NOT EXISTS (SELECT 1 FROM sales.SalesOrderLines WHERE Id = 80002 OR (SalesOrderId = 80001 AND [LineNo] = 10))
BEGIN
    SET IDENTITY_INSERT sales.SalesOrderLines ON;
    INSERT INTO sales.SalesOrderLines
        (Id, SalesOrderId, [LineNo], ItemId, ItemVariantId, OrderUomId, Quantity, MakeType, PromisedDate, PriorityCode, CustomerSpecRef, RequestedShipDate, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (80002, 80001, 10, 10002, NULL, 1, 25.000000, N'Make', DATEADD(day, 5, @today), N'High', N'DRW-BR-001/A', DATEADD(day, 4, @today), N'Open', @now, 1008, @now, 1008);
    SET IDENTITY_INSERT sales.SalesOrderLines OFF;
END;

IF NOT EXISTS (SELECT 1 FROM planning.MasterProductionSchedules WHERE Id = 81001 OR (CompanyId = 1 AND MpsCode = N'MPS-UAT-0001'))
BEGIN
    SET IDENTITY_INSERT planning.MasterProductionSchedules ON;
    INSERT INTO planning.MasterProductionSchedules
        (Id, CompanyId, BranchId, MpsCode, PlanningHorizonStart, PlanningHorizonEnd, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (81001, 1, 11, N'MPS-UAT-0001', @today, DATEADD(day, 14, @today), N'Released', @now, 1002, @now, 1002);
    SET IDENTITY_INSERT planning.MasterProductionSchedules OFF;
END;

IF NOT EXISTS (SELECT 1 FROM planning.MpsLines WHERE Id = 81002 OR (MasterProductionScheduleId = 81001 AND [LineNo] = 10))
BEGIN
    SET IDENTITY_INSERT planning.MpsLines ON;
    INSERT INTO planning.MpsLines
        (Id, MasterProductionScheduleId, [LineNo], ItemId, PeriodStart, PeriodEnd, PlannedQuantity, PlanningUomId, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (81002, 81001, 10, 10002, @today, DATEADD(day, 7, @today), 25.000000, 1, @now, 1002, @now, 1002);
    SET IDENTITY_INSERT planning.MpsLines OFF;
END;

IF NOT EXISTS (SELECT 1 FROM planning.MrpRuns WHERE Id = 82001 OR (CompanyId = 1 AND RunCode = N'MRP-UAT-0001'))
BEGIN
    SET IDENTITY_INSERT planning.MrpRuns ON;
    INSERT INTO planning.MrpRuns
        (Id, CompanyId, BranchId, RunCode, RunType, TriggeredFromMpsId, PlanningHorizonStart, PlanningHorizonEnd, Status, RunStartedOn, RunCompletedOn, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (82001, 1, 11, N'MRP-UAT-0001', N'NetChange', 81001, @today, DATEADD(day, 14, @today), N'Completed', DATEADD(minute, -30, @now), DATEADD(minute, -25, @now), @now, 1002, @now, 1002);
    SET IDENTITY_INSERT planning.MrpRuns OFF;
END;

IF NOT EXISTS (SELECT 1 FROM planning.MrpRunItems WHERE Id = 82002 OR (MrpRunId = 82001 AND ItemId = 10001 AND DemandSourceType = N'BOM'))
BEGIN
    SET IDENTITY_INSERT planning.MrpRunItems ON;
    INSERT INTO planning.MrpRunItems
        (Id, MrpRunId, ItemId, DemandSourceType, GrossRequirementQty, NetRequirementQty, AvailableQtyAtRun, RecommendedAction, ExceptionCode, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (82002, 82001, 10001, N'BOM', 37.500000, 12.500000, 25.000000, N'Buy', N'SHORT-RM', @now, 1002, @now, 1002);
    SET IDENTITY_INSERT planning.MrpRunItems OFF;
END;

IF NOT EXISTS (SELECT 1 FROM planning.BoqRequirements WHERE Id = 83001 OR (CompanyId = 1 AND SourceDocumentType = N'MRP' AND SourceDocumentId = 82001))
BEGIN
    SET IDENTITY_INSERT planning.BoqRequirements ON;
    INSERT INTO planning.BoqRequirements
        (Id, CompanyId, BranchId, MrpRunId, SourceDocumentType, SourceDocumentId, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (83001, 1, 11, 82001, N'MRP', 82001, N'Reviewed', @now, 1002, @now, 1002);
    SET IDENTITY_INSERT planning.BoqRequirements OFF;
END;

IF NOT EXISTS (SELECT 1 FROM planning.BoqRequirementLines WHERE Id = 83002 OR (BoqRequirementId = 83001 AND [LineNo] = 10))
BEGIN
    SET IDENTITY_INSERT planning.BoqRequirementLines ON;
    INSERT INTO planning.BoqRequirementLines
        (Id, BoqRequirementId, [LineNo], ItemId, RequiredQuantity, RequirementUomId, NeedByDate, RecommendedAction, ApprovedAction, OverrideReasonCode, OverriddenByUserId, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (83002, 83001, 10, 10001, 12.500000, 2, DATEADD(day, 3, @today), N'Buy', N'Buy', NULL, 1002, N'Reviewed', @now, 1002, @now, 1002);
    SET IDENTITY_INSERT planning.BoqRequirementLines OFF;
END;

IF NOT EXISTS (SELECT 1 FROM production.WorkOrders WHERE Id = 90001 OR (CompanyId = 1 AND WorkOrderNo = N'WO-UAT-0001'))
BEGIN
    SET IDENTITY_INSERT production.WorkOrders ON;
    INSERT INTO production.WorkOrders
        (Id, CompanyId, BranchId, WorkOrderNo, SalesOrderLineId, ItemId, BomRevisionId, RoutingId, PlannedQuantity, ProductionUomId, PlannedStartDate, PlannedEndDate, Status, Remarks, ReleasedOn, ClosedOn, CancelledOn, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (90001, 1, 11, N'WO-UAT-0001', 80002, 10002, 60002, 53001, 25.000000, 1, @today, DATEADD(day, 3, @today), N'Released', N'UAT runtime seed work order for bracket flow.', @now, NULL, NULL, @now, 1002, @now, 1002);
    SET IDENTITY_INSERT production.WorkOrders OFF;
END;

IF NOT EXISTS (SELECT 1 FROM production.WorkOrderOperations WHERE Id = 90002 OR (WorkOrderId = 90001 AND SequenceNo = 10))
BEGIN
    SET IDENTITY_INSERT production.WorkOrderOperations ON;
    INSERT INTO production.WorkOrderOperations
        (Id, WorkOrderId, SequenceNo, OperationId, RoutingOperationId, WorkCenterId, PlannedQuantity, CompletedQuantity, RequiresQcCheckpoint, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (90002, 90001, 10, 51001, @routingOperationId, 50001, 25.000000, 5.000000, 1, N'Ready', @now, 1002, @now, 1002);
    SET IDENTITY_INSERT production.WorkOrderOperations OFF;
END;

IF NOT EXISTS (SELECT 1 FROM production.JobCards WHERE Id = 90003 OR (CompanyId = 1 AND JobCardNo = N'JC-UAT-0001'))
BEGIN
    SET IDENTITY_INSERT production.JobCards ON;
    INSERT INTO production.JobCards
        (Id, CompanyId, BranchId, JobCardNo, WorkOrderId, WorkOrderOperationId, ParentJobCardId, SplitSequenceNo, AssignedMachineId, AssignedOperatorUserId, ShiftId, PlannedQuantity, CompletedGoodQty, CompletedRejectQty, CompletedScrapQty, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (90003, 1, 11, N'JC-UAT-0001', 90001, 90002, NULL, 1, 52001, 1005, 1, 25.000000, 5.000000, 0.000000, 0.000000, N'Assigned', @now, 1004, @now, 1004);
    SET IDENTITY_INSERT production.JobCards OFF;
END;

IF NOT EXISTS (SELECT 1 FROM production.JobCardEvents WHERE JobCardId = 90003 AND EventType = N'Assigned')
BEGIN
    INSERT INTO production.JobCardEvents
        (CompanyId, BranchId, JobCardId, EventType, MachineId, OperatorUserId, EventOn, Quantity, ReasonCode, Remarks, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (1, 11, 90003, N'Assigned', 52001, 1005, @now, NULL, NULL, N'UAT runtime seed assignment.', @now, 1004, @now, 1004);
END;

IF NOT EXISTS (SELECT 1 FROM production.DowntimeEvents WHERE Id = 90004 OR (JobCardId = 90003 AND ReasonCode = N'SETUP-WAIT'))
BEGIN
    SET IDENTITY_INSERT production.DowntimeEvents ON;
    INSERT INTO production.DowntimeEvents
        (Id, CompanyId, BranchId, JobCardId, MachineId, ReasonCode, StartOn, EndOn, DurationMinutes, Remarks, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (90004, 1, 11, 90003, 52001, N'SETUP-WAIT', DATEADD(minute, -75, @now), DATEADD(minute, -45, @now), 30.00, N'UAT runtime seed downtime proof.', @now, 1004, @now, 1004);
    SET IDENTITY_INSERT production.DowntimeEvents OFF;
END;

IF NOT EXISTS (SELECT 1 FROM inventory.Lots WHERE Id = 70001 OR (CompanyId = 1 AND ItemId = 10002 AND LotNo = N'DEMO-LOT-001'))
BEGIN
    SET IDENTITY_INSERT inventory.Lots ON;
    INSERT INTO inventory.Lots
        (Id, CompanyId, ItemId, LotNo, ManufacturedOn, ExpiryOn, LotStatus, CatchWeightQty, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (70001, 1, 10002, N'DEMO-LOT-001', DATEADD(day, -1, @today), NULL, N'Available', NULL, @now, 1004, @now, 1004);
    SET IDENTITY_INSERT inventory.Lots OFF;
END;

IF NOT EXISTS (SELECT 1 FROM inventory.StockBalances WHERE Id = 70002 OR (CompanyId = 1 AND BranchId = 12 AND WarehouseId = 201 AND BinId = 2001 AND ItemId = 10002 AND LotId = 70001))
BEGIN
    SET IDENTITY_INSERT inventory.StockBalances ON;
    INSERT INTO inventory.StockBalances
        (Id, CompanyId, BranchId, WarehouseId, ItemId, ItemVariantId, BinId, LotId, SerialId, OnHandQty, ReservedQty, QcHoldQty, BlockedQty, InTransitQty, CatchWeightQty, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (70002, 1, 12, 201, 10002, NULL, 2001, 70001, NULL, 25.000000, 5.000000, 0.000000, 0.000000, 0.000000, NULL, @now, 1004, @now, 1004);
    SET IDENTITY_INSERT inventory.StockBalances OFF;
END;

IF NOT EXISTS (SELECT 1 FROM inventory.StockTransactions WHERE Id = 70003 OR (CompanyId = 1 AND TransactionNo = N'UAT-STK-0001'))
BEGIN
    SET IDENTITY_INSERT inventory.StockTransactions ON;
    INSERT INTO inventory.StockTransactions
        (Id, CompanyId, BranchId, TransactionNo, TransactionType, PostingDate, ItemId, ItemVariantId, FromWarehouseId, FromBinId, ToWarehouseId, ToBinId, LotId, SerialId, Quantity, CatchWeightQty, InventoryState, SourceDocumentType, SourceDocumentId, Remarks, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (70003, 1, 12, N'UAT-STK-0001', N'ProductionReceipt', @today, 10002, NULL, NULL, NULL, 201, 2001, 70001, NULL, 25.000000, NULL, N'Available', N'UAT-DEMO', 90001, N'UAT runtime seed receipt into finished goods.', @now, 1004, @now, 1004);
    SET IDENTITY_INSERT inventory.StockTransactions OFF;
END;

IF NOT EXISTS (SELECT 1 FROM dispatch.PackLists WHERE Id = 95001 OR (CompanyId = 1 AND PackListNo = N'PK-UAT-0001'))
BEGIN
    SET IDENTITY_INSERT dispatch.PackLists ON;
    INSERT INTO dispatch.PackLists
        (Id, CompanyId, BranchId, PackListNo, SalesOrderId, PlannedShipDate, Status, Remarks, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (95001, 1, 12, N'PK-UAT-0001', 80001, DATEADD(day, 4, @today), N'Packed', N'UAT runtime seed pack list.', @now, 1007, @now, 1007);
    SET IDENTITY_INSERT dispatch.PackLists OFF;
END;

IF NOT EXISTS (SELECT 1 FROM dispatch.PackListLines WHERE Id = 95002 OR (PackListId = 95001 AND [LineNo] = 10))
BEGIN
    SET IDENTITY_INSERT dispatch.PackListLines ON;
    INSERT INTO dispatch.PackListLines
        (Id, PackListId, [LineNo], SalesOrderLineId, ItemId, ItemVariantId, WarehouseId, BinId, LotId, SerialId, PackedQuantity, PackUomId, PackageRef, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (95002, 95001, 10, 80002, 10002, NULL, 201, 2001, 70001, NULL, 20.000000, 1, N'CARTON-UAT-001', N'Packed', @now, 1007, @now, 1007);
    SET IDENTITY_INSERT dispatch.PackListLines OFF;
END;

IF NOT EXISTS (SELECT 1 FROM dispatch.Shipments WHERE Id = 96001 OR (CompanyId = 1 AND ShipmentNo = N'SHP-UAT-0001'))
BEGIN
    SET IDENTITY_INSERT dispatch.Shipments ON;
    INSERT INTO dispatch.Shipments
        (Id, CompanyId, BranchId, ShipmentNo, PackListId, CustomerId, DispatchDate, VehicleRef, TrackingRef, SealNo, ProofNotes, Status, LoadedOn, DeliveredOn, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (96001, 1, 12, N'SHP-UAT-0001', 95001, 20001, DATEADD(day, 4, @today), N'MH12-UAT-001', N'UAT-TRACK-001', N'SEAL-UAT-001', N'UAT runtime seed dispatch proof.', N'Loaded', DATEADD(minute, -20, @now), NULL, @now, 1007, @now, 1007);
    SET IDENTITY_INSERT dispatch.Shipments OFF;
END;

IF NOT EXISTS (SELECT 1 FROM dispatch.ShipmentLines WHERE Id = 96002 OR (ShipmentId = 96001 AND [LineNo] = 10))
BEGIN
    SET IDENTITY_INSERT dispatch.ShipmentLines ON;
    INSERT INTO dispatch.ShipmentLines
        (Id, ShipmentId, [LineNo], PackListLineId, SalesOrderLineId, ItemId, ItemVariantId, WarehouseId, BinId, LotId, SerialId, ShippedQuantity, ShipUomId, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (96002, 96001, 10, 95002, 80002, 10002, NULL, 201, 2001, 70001, NULL, 20.000000, 1, N'Loaded', @now, 1007, @now, 1007);
    SET IDENTITY_INSERT dispatch.ShipmentLines OFF;
END;

IF NOT EXISTS (SELECT 1 FROM inventory.StockTransactions WHERE Id = 96003 OR (CompanyId = 1 AND TransactionNo = N'UAT-SHP-0001'))
BEGIN
    SET IDENTITY_INSERT inventory.StockTransactions ON;
    INSERT INTO inventory.StockTransactions
        (Id, CompanyId, BranchId, TransactionNo, TransactionType, PostingDate, ItemId, ItemVariantId, FromWarehouseId, FromBinId, ToWarehouseId, ToBinId, LotId, SerialId, Quantity, CatchWeightQty, InventoryState, SourceDocumentType, SourceDocumentId, Remarks, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (96003, 1, 12, N'UAT-SHP-0001', N'ShipmentIssue', DATEADD(day, 4, @today), 10002, NULL, 201, 2001, NULL, NULL, 70001, NULL, -20.000000, NULL, N'Issued', N'Shipment', 96001, N'UAT runtime seed dispatch issue.', @now, 1007, @now, 1007);
    SET IDENTITY_INSERT inventory.StockTransactions OFF;
END;
