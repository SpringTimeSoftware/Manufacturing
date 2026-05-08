SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE production.sp_Machine_Board
    @CompanyId BIGINT = NULL,
    @BranchId BIGINT = NULL,
    @WarehouseId BIGINT = NULL,
    @DepartmentId BIGINT = NULL,
    @UserId BIGINT = NULL,
    @DateFrom DATETIME2 = NULL,
    @DateTo DATETIME2 = NULL,
    @WorkCenterId BIGINT = NULL,
    @MachineId BIGINT = NULL,
    @MachineStatus NVARCHAR(32) = NULL,
    @ItemId BIGINT = NULL,
    @WorkOrderId BIGINT = NULL,
    @JobCardId BIGINT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @SafeDateFrom DATETIME2 = COALESCE(@DateFrom, DATEADD(day, -1, SYSUTCDATETIME()));
    DECLARE @SafeDateTo DATETIME2 = COALESCE(@DateTo, DATEADD(day, 7, SYSUTCDATETIME()));

    ;WITH ScopedMachines AS
    (
        SELECT
            machine.Id,
            machine.MachineCode,
            machine.MachineName,
            machine.WorkCenterId,
            machine.CurrentStatus,
            machine.CompanyId,
            machine.BranchId
        FROM resource.Machines machine
        WHERE (@CompanyId IS NULL OR machine.CompanyId = @CompanyId)
          AND (@BranchId IS NULL OR machine.BranchId = @BranchId)
          AND (@WorkCenterId IS NULL OR machine.WorkCenterId = @WorkCenterId)
          AND (@MachineId IS NULL OR machine.Id = @MachineId)
          AND (@MachineStatus IS NULL OR machine.CurrentStatus = @MachineStatus)
    ),
    ActiveCards AS
    (
        SELECT
            jobCard.Id,
            jobCard.JobCardNo,
            jobCard.AssignedMachineId,
            workOrder.WorkOrderNo,
            workOrder.ItemId,
            item.ItemCode,
            workOrder.PlannedStartDate,
            workOrder.PlannedEndDate,
            jobCard.Status,
            ROW_NUMBER() OVER
            (
                PARTITION BY jobCard.AssignedMachineId
                ORDER BY
                    CASE WHEN jobCard.Status = N'Started' THEN 0 WHEN jobCard.Status = N'Assigned' THEN 1 ELSE 2 END,
                    jobCard.ModifiedOn DESC,
                    jobCard.Id DESC
            ) AS RowRank
        FROM production.JobCards jobCard
        INNER JOIN production.WorkOrders workOrder ON workOrder.Id = jobCard.WorkOrderId
        INNER JOIN [master].[Items] item ON item.Id = workOrder.ItemId
        WHERE jobCard.AssignedMachineId IS NOT NULL
          AND jobCard.Status IN (N'Started', N'Assigned', N'Paused')
          AND (@CompanyId IS NULL OR jobCard.CompanyId = @CompanyId)
          AND (@BranchId IS NULL OR jobCard.BranchId = @BranchId)
          AND (@ItemId IS NULL OR workOrder.ItemId = @ItemId)
          AND (@WorkOrderId IS NULL OR workOrder.Id = @WorkOrderId)
          AND (@JobCardId IS NULL OR jobCard.Id = @JobCardId)
          AND
          (
              workOrder.PlannedStartDate IS NULL
              OR workOrder.PlannedEndDate IS NULL
              OR CAST(workOrder.PlannedStartDate AS DATETIME2) <= @SafeDateTo
              OR CAST(workOrder.PlannedEndDate AS DATETIME2) >= @SafeDateFrom
          )
    )
    SELECT
        machine.Id AS MachineId,
        machine.MachineCode,
        machine.MachineName,
        machine.WorkCenterId,
        machine.CurrentStatus,
        active.Id AS ActiveJobCardId,
        active.JobCardNo AS ActiveJobCardNo,
        active.WorkOrderNo AS ActiveWorkOrderNo,
        active.ItemCode,
        CASE
            WHEN active.PlannedStartDate IS NULL THEN NULL
            ELSE TODATETIMEOFFSET(CAST(active.PlannedStartDate AS DATETIME2), '+00:00')
        END AS PlannedStartOn,
        CASE
            WHEN active.PlannedEndDate IS NULL THEN NULL
            ELSE TODATETIMEOFFSET(CAST(active.PlannedEndDate AS DATETIME2), '+00:00')
        END AS PlannedEndOn,
        CASE
            WHEN active.Id IS NULL THEN N'Available'
            WHEN active.Status = N'Paused' THEN N'Attention'
            ELSE N'On track'
        END AS RiskStatus,
        COALESCE(queued.QueuedJobCardsJson, N'[]') AS QueuedJobCardsJson
    FROM ScopedMachines machine
    LEFT JOIN ActiveCards active ON active.AssignedMachineId = machine.Id AND active.RowRank = 1
    OUTER APPLY
    (
        SELECT
            queue.Id AS jobCardId,
            queue.JobCardNo AS jobCardNo,
            queue.WorkOrderNo AS workOrderNo,
            queue.ItemCode AS itemCode,
            queue.Status AS status
        FROM ActiveCards queue
        WHERE queue.AssignedMachineId = machine.Id
          AND (active.Id IS NULL OR queue.Id <> active.Id)
        ORDER BY
            CASE WHEN queue.Status = N'Started' THEN 0 WHEN queue.Status = N'Assigned' THEN 1 ELSE 2 END,
            queue.Id
        FOR JSON PATH
    ) queued(QueuedJobCardsJson)
    WHERE (@ItemId IS NULL OR active.ItemId = @ItemId)
      AND (@WorkOrderId IS NULL OR active.WorkOrderNo IS NOT NULL)
      AND (@JobCardId IS NULL OR active.Id = @JobCardId)
    ORDER BY machine.MachineCode;
END;
GO
