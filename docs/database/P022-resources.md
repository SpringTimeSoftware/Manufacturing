# P022 Work Center, Machine, and Tooling Schema

All tables inherit common columns from `/docs/database/conventions.md` unless noted otherwise.

## Tables

### `resource.WorkCenters`

Purpose: capacity group or production cell used by routings and planning.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `BranchId` | FK to `org.Branches` |
| `WorkCenterCode` | unique within company |
| `WorkCenterName` | display name |
| `DepartmentId` | nullable FK to `org.Departments` |
| `CapacityUomId` | optional FK to `measure.Uoms` for rate units if needed |
| `DefaultShiftPatternCode` | optional |
| `ParallelCapacityUnits` | integer |
| `Status` | `Active`, `Inactive`, `Blocked` |

Unique constraints:

- `UX_WorkCenters_CompanyId_WorkCenterCode`

### `resource.Machines`

Purpose: machine master with live status and planning identity.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `BranchId` | FK to `org.Branches` |
| `WorkCenterId` | FK to `resource.WorkCenters` |
| `MachineCode` | unique within company |
| `MachineName` | display name |
| `CapacityPerHour` | decimal |
| `CurrentStatus` | canonical machine state |
| `DefaultShiftId` | nullable FK to `org.Shifts` |
| `IsUnderMaintenance` | bit |
| `IsSchedulingEnabled` | bit |
| `Status` | `Active`, `Inactive`, `Blocked` |

Unique constraints:

- `UX_Machines_CompanyId_MachineCode`

### `resource.MachineCalendars`

Purpose: planned availability and exception windows for machines.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `BranchId` | FK to `org.Branches` |
| `MachineId` | FK to `resource.Machines` |
| `CalendarDate` | date |
| `ShiftId` | nullable FK to `org.Shifts` |
| `AvailabilityStatus` | `Available`, `Blocked`, `Maintenance`, `Holiday` |
| `AvailableMinutes` | planned minutes |
| `ReasonCode` | nullable |

Unique constraints:

- `UX_MachineCalendars_MachineId_CalendarDate_ShiftId`

### `resource.Tools`

Purpose: constrained tooling resources such as dies, moulds, and fixtures.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `BranchId` | nullable |
| `ToolCode` | unique within company |
| `ToolName` | display name |
| `ToolType` | `Die`, `Mould`, `Fixture`, `Jig`, `Gauge` |
| `CompatibleMachineGroup` | optional metadata |
| `Status` | `Active`, `Inactive`, `Blocked`, `Maintenance` |

Unique constraints:

- `UX_Tools_CompanyId_ToolCode`

## Relationship Summary

- `WorkCenters` 1:n `Machines`
- `Machines` 1:n `MachineCalendars`
- `Departments` 1:n `WorkCenters`

## Notes

- Maintenance-lite behavior is captured through status and calendar exceptions; this is not a full CMMS design.
