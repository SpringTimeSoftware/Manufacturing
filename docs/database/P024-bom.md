# P024 BOM and Revision Schema

All tables inherit common columns from `/docs/database/conventions.md` unless noted otherwise.

## Tables

### `engineering.Boms`

Purpose: BOM header identity for an item.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `ItemId` | FK to `master.Items` |
| `BomCode` | unique within company |
| `BomName` | display name |
| `CurrentReleasedRevisionId` | nullable FK to `engineering.BomRevisions` |
| `Status` | `Active`, `Inactive`, `Obsolete` |

Unique constraints:

- `UX_Boms_CompanyId_BomCode`
- `UX_Boms_CompanyId_ItemId`

### `engineering.BomRevisions`

Purpose: controlled revision versions of a BOM.

| Column | Notes |
| --- | --- |
| `BomId` | FK to `engineering.Boms` |
| `RevisionCode` | unique within BOM |
| `EffectiveFrom` | nullable |
| `EffectiveTo` | nullable |
| `ApprovalStatus` | `Draft`, `PendingApproval`, `Approved`, `Released`, `Obsolete`, `Rejected` |
| `RoutingId` | nullable FK to `resource.Routings` |
| `ChangeSummary` | optional |
| `IsPhantomParentAllowed` | bit |

Unique constraints:

- `UX_BomRevisions_BomId_RevisionCode`

### `engineering.BomLines`

Purpose: component lines under a BOM revision.

| Column | Notes |
| --- | --- |
| `BomRevisionId` | FK to `engineering.BomRevisions` |
| `SequenceNo` | ordering |
| `ComponentItemId` | FK to `master.Items` |
| `QuantityPer` | required quantity |
| `IssueUomId` | FK to `measure.Uoms` |
| `ScrapPercent` | component scrap allowance |
| `IssueMethod` | `Manual`, `Backflush`, `Hybrid` |
| `IsPhantom` | bit |
| `AlternateItemId` | nullable FK to `engineering.AlternateItems` added after P025 |
| `EffectiveFrom` | nullable |
| `EffectiveTo` | nullable |

Unique constraints:

- `UX_BomLines_BomRevisionId_SequenceNo`

### `engineering.BomOperations`

Purpose: revision-linked operation requirements used to generate work-order operations and job cards.

| Column | Notes |
| --- | --- |
| `BomRevisionId` | FK to `engineering.BomRevisions` |
| `SequenceNo` | ordering |
| `RoutingOperationId` | nullable FK to `resource.RoutingOperations` |
| `OperationId` | nullable FK to `resource.Operations` |
| `SetupMinutes` | override |
| `RunMinutesPerUnit` | override |
| `TeardownMinutes` | override |
| `RequiresQcCheckpoint` | bit |
| `IsOptional` | bit |

Unique constraints:

- `UX_BomOperations_BomRevisionId_SequenceNo`

## Approval and Obsolete Rules

- Only one released revision should be active for a BOM in a given effective period.
- Obsoleting a revision must not delete historical work-order references.
- Revisions move through `Draft -> PendingApproval -> Approved -> Released` and later `Obsolete` or `Rejected`.

## Relationship Summary

- `Boms` 1:n `BomRevisions`
- `BomRevisions` 1:n `BomLines`
- `BomRevisions` 1:n `BomOperations`
