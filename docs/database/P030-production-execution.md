# P030 Work Order, Job Card, and Shift Handover Schema

All tables inherit common columns from `/docs/database/conventions.md` unless noted otherwise.

## Tables

### `production.WorkOrders`

Purpose: production authorization header.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `BranchId` | FK to `org.Branches` |
| `WorkOrderNo` | unique within company |
| `SalesOrderLineId` | nullable FK to `sales.SalesOrderLines` |
| `ItemId` | FK to `master.Items` |
| `BomRevisionId` | FK to `engineering.BomRevisions` |
| `RoutingId` | nullable FK to `resource.Routings` |
| `PlannedQuantity` | decimal |
| `ProductionUomId` | FK to `measure.Uoms` |
| `PlannedStartDate` | nullable |
| `PlannedEndDate` | nullable |
| `Status` | canonical work-order status |

Unique constraints:

- `UX_WorkOrders_CompanyId_WorkOrderNo`

### `production.WorkOrderOperations`

Purpose: operation rows generated for a work order.

| Column | Notes |
| --- | --- |
| `WorkOrderId` | FK to `production.WorkOrders` |
| `SequenceNo` | operation order |
| `OperationId` | FK to `resource.Operations` |
| `RoutingOperationId` | nullable FK |
| `WorkCenterId` | nullable FK |
| `PlannedQuantity` | decimal |
| `CompletedQuantity` | decimal |
| `RequiresQcCheckpoint` | bit |
| `Status` | `Pending`, `Ready`, `InProgress`, `Completed`, `QC_Hold`, `Cancelled` |

Unique constraints:

- `UX_WorkOrderOperations_WorkOrderId_SequenceNo`

### `production.JobCards`

Purpose: executable operation-level shop-floor tasks.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `BranchId` | FK to `org.Branches` |
| `JobCardNo` | unique within company |
| `WorkOrderId` | FK to `production.WorkOrders` |
| `WorkOrderOperationId` | FK to `production.WorkOrderOperations` |
| `ParentJobCardId` | nullable self-reference for split cards |
| `SplitSequenceNo` | nullable |
| `AssignedMachineId` | nullable FK to `resource.Machines` |
| `AssignedOperatorUserId` | nullable |
| `ShiftId` | nullable FK to `org.Shifts` |
| `PlannedQuantity` | decimal |
| `CompletedGoodQty` | decimal |
| `CompletedRejectQty` | decimal |
| `CompletedScrapQty` | decimal |
| `Status` | canonical job-card status |

Unique constraints:

- `UX_JobCards_CompanyId_JobCardNo`
- `UX_JobCards_WorkOrderOperationId_SplitSequenceNo`
- filtered unique active-machine constraint: one active `Started` job card per machine unless parallel capacity is later introduced

### `production.JobCardEvents`

Purpose: immutable execution timeline.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `BranchId` | FK to `org.Branches` |
| `JobCardId` | FK to `production.JobCards` |
| `EventType` | `Assigned`, `Started`, `Paused`, `Resumed`, `QtyLogged`, `DowntimeLogged`, `QC_Hold`, `QC_Released`, `Completed`, `Closed` |
| `MachineId` | nullable FK |
| `OperatorUserId` | nullable |
| `EventOn` | datetime |
| `Quantity` | nullable |
| `ReasonCode` | nullable |
| `Remarks` | nullable |

### `production.ShiftHandovers`

Purpose: shift-to-shift summary and pending issue transfer.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `BranchId` | FK to `org.Branches` |
| `ShiftId` | FK to `org.Shifts` |
| `HandoverDate` | date |
| `FromSupervisorUserId` | nullable |
| `ToSupervisorUserId` | nullable |
| `SummaryNotes` | text |
| `PendingIssueCount` | integer |
| `Status` | `Draft`, `Submitted`, `Acknowledged` |

Unique constraints:

- `UX_ShiftHandovers_BranchId_ShiftId_HandoverDate`

## Relationship Summary

- `WorkOrders` 1:n `WorkOrderOperations`
- `WorkOrderOperations` 1:n `JobCards`
- `JobCards` 1:n `JobCardEvents`
