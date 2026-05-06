# P023 Operation and Routing Schema

All tables inherit common columns from `/docs/database/conventions.md` unless noted otherwise.

## Tables

### `resource.Operations`

Purpose: reusable standard operation definitions.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `OperationCode` | unique within company |
| `OperationName` | display name |
| `OperationType` | `Production`, `Inspection`, `Subcontract`, `Packaging` |
| `DefaultWorkCenterId` | nullable FK to `resource.WorkCenters` |
| `DefaultSetupMinutes` | decimal |
| `DefaultRunMinutesPerUnit` | decimal |
| `DefaultTeardownMinutes` | decimal |
| `AllowsOverlap` | bit |
| `IsOutsideProcessing` | bit |
| `RequiresQcCheckpoint` | bit |
| `Status` | `Active`, `Inactive` |

Unique constraints:

- `UX_Operations_CompanyId_OperationCode`

### `resource.Routings`

Purpose: reusable routing header for a manufactured item family or process.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `RoutingCode` | unique within company |
| `RoutingName` | display name |
| `OutputItemId` | nullable FK to `master.Items` |
| `RevisionCode` | optional internal routing revision |
| `Status` | `Draft`, `Approved`, `Released`, `Obsolete` |

Unique constraints:

- `UX_Routings_CompanyId_RoutingCode`

### `resource.RoutingOperations`

Purpose: ordered operation sequence inside a routing.

| Column | Notes |
| --- | --- |
| `RoutingId` | FK to `resource.Routings` |
| `SequenceNo` | operation order |
| `OperationId` | FK to `resource.Operations` |
| `WorkCenterId` | nullable override FK |
| `ToolId` | nullable FK |
| `SetupMinutes` | override |
| `RunMinutesPerUnit` | override |
| `TeardownMinutes` | override |
| `OverlapPercent` | nullable |
| `IsOutsideProcessing` | bit |
| `RequiresQcCheckpoint` | bit |
| `Status` | `Active`, `Inactive` |

Unique constraints:

- `UX_RoutingOperations_RoutingId_SequenceNo`

## Relationship Summary

- `Operations` may be reused across many `RoutingOperations`
- `Routings` 1:n `RoutingOperations`

## Rules

- `IsOutsideProcessing` on a routing step must align with procurement/subcontract logic.
- QC checkpoints can be inherited from `Operations` and overridden on `RoutingOperations`.
