# P027 MPS, MRP, and BOQ Requirement Schema

All tables inherit common columns from `/docs/database/conventions.md` unless noted otherwise.

## Tables

### `planning.MasterProductionSchedules`

Purpose: MPS run header or planning version.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `BranchId` | FK to `org.Branches` |
| `MpsCode` | unique within company |
| `PlanningHorizonStart` | date |
| `PlanningHorizonEnd` | date |
| `Status` | canonical MPS status |

Unique constraints:

- `UX_MasterProductionSchedules_CompanyId_MpsCode`

### `planning.MpsLines`

Purpose: item-period planned production quantities.

| Column | Notes |
| --- | --- |
| `MasterProductionScheduleId` | FK to `planning.MasterProductionSchedules` |
| `LineNo` | ordering |
| `ItemId` | FK to `master.Items` |
| `PeriodStart` | bucket start |
| `PeriodEnd` | bucket end |
| `PlannedQuantity` | quantity |
| `PlanningUomId` | FK to `measure.Uoms` |

Unique constraints:

- `UX_MpsLines_MpsId_LineNo`

### `planning.MrpRuns`

Purpose: one execution of MRP logic.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `BranchId` | FK to `org.Branches` |
| `RunCode` | unique within company |
| `RunType` | `Full`, `NetChange`, `WhatIf` |
| `TriggeredFromMpsId` | nullable FK |
| `PlanningHorizonStart` | date |
| `PlanningHorizonEnd` | date |
| `Status` | canonical MRP run status |
| `RunStartedOn` | datetime |
| `RunCompletedOn` | nullable |

Unique constraints:

- `UX_MrpRuns_CompanyId_RunCode`

### `planning.MrpRunItems`

Purpose: item-level MRP result summary.

| Column | Notes |
| --- | --- |
| `MrpRunId` | FK to `planning.MrpRuns` |
| `ItemId` | FK to `master.Items` |
| `DemandSourceType` | `Forecast`, `SalesOrder`, `BlanketRelease`, `Reorder` |
| `GrossRequirementQty` | decimal |
| `NetRequirementQty` | decimal |
| `AvailableQtyAtRun` | decimal |
| `RecommendedAction` | `BUY`, `MAKE`, `TRANSFER`, `SUBCONTRACT`, `NONE` |
| `ExceptionCode` | nullable |

Unique constraints:

- `UX_MrpRunItems_MrpRunId_ItemId_DemandSourceType`

### `planning.BoqRequirements`

Purpose: BOQ requirement header by run and source document.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `BranchId` | FK to `org.Branches` |
| `MrpRunId` | nullable FK to `planning.MrpRuns` |
| `SourceDocumentType` | `SalesOrder`, `Forecast`, `BlanketOrder`, `Manual` |
| `SourceDocumentId` | nullable |
| `Status` | canonical BOQ status |

### `planning.BoqRequirementLines`

Purpose: actionable net requirement lines and planner overrides.

| Column | Notes |
| --- | --- |
| `BoqRequirementId` | FK to `planning.BoqRequirements` |
| `LineNo` | ordering |
| `ItemId` | FK to `master.Items` |
| `RequiredQuantity` | decimal |
| `RequirementUomId` | FK to `measure.Uoms` |
| `NeedByDate` | date |
| `RecommendedAction` | `BUY`, `MAKE`, `TRANSFER`, `SUBCONTRACT`, `NONE` |
| `ApprovedAction` | nullable planner override |
| `OverrideReasonCode` | nullable |
| `OverriddenByUserId` | nullable |
| `Status` | `New`, `Reviewed`, `Approved`, `Converted`, `Closed` |

Unique constraints:

- `UX_BoqRequirementLines_BoqRequirementId_LineNo`

## Relationship Summary

- `MasterProductionSchedules` 1:n `MpsLines`
- `MrpRuns` 1:n `MrpRunItems`
- `BoqRequirements` 1:n `BoqRequirementLines`
