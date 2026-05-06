# P025 Engineering Changes and Alternate Item Schema

All tables inherit common columns from `/docs/database/conventions.md` unless noted otherwise.

## Tables

### `engineering.EngineeringChanges`

Purpose: ECO header controlling revision-driven change approval and rollout.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `EcoCode` | unique within company |
| `EcoTitle` | display title |
| `ChangeType` | `BOM`, `Routing`, `Item`, `Mixed` |
| `RequestedByUserId` | requester |
| `RequestedOn` | request time |
| `EffectiveFrom` | nullable |
| `ApprovalStatus` | `Draft`, `PendingApproval`, `Approved`, `Implemented`, `Rejected`, `Cancelled` |
| `ReasonCode` | optional |

Unique constraints:

- `UX_EngineeringChanges_CompanyId_EcoCode`

### `engineering.EngineeringChangeLines`

Purpose: item, BOM, routing, or operation-level impacts under an ECO.

| Column | Notes |
| --- | --- |
| `EngineeringChangeId` | FK to `engineering.EngineeringChanges` |
| `LineNo` | ordering |
| `ImpactType` | `Item`, `BomRevision`, `BomLine`, `Routing`, `RoutingOperation`, `AlternateItem` |
| `TargetEntityId` | referenced entity ID |
| `ActionType` | `Add`, `Update`, `Replace`, `Obsolete`, `Approve` |
| `FromValueSummary` | optional summary |
| `ToValueSummary` | optional summary |
| `EffectiveFrom` | nullable |

Unique constraints:

- `UX_EngineeringChangeLines_EngineeringChangeId_LineNo`

### `engineering.AlternateItems`

Purpose: approved substitute or fallback materials/components.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `PrimaryItemId` | FK to `master.Items` |
| `AlternateItemId` | FK to `master.Items` |
| `ContextType` | `Global`, `Bom`, `BomLine`, `SupplierFallback` |
| `BomId` | nullable FK to `engineering.Boms` |
| `PriorityRank` | lower rank preferred |
| `EffectiveFrom` | nullable |
| `EffectiveTo` | nullable |
| `ApprovalStatus` | `Draft`, `Approved`, `Obsolete` |
| `ReasonCode` | optional |

Unique constraints:

- `UX_AlternateItems_PrimaryItemId_AlternateItemId_ContextType_BomId`

## Relationship Summary

- `EngineeringChanges` 1:n `EngineeringChangeLines`
- `AlternateItems` may be referenced by BOM lines, planning overrides, or procurement fallback logic

## Rules

- Alternate items are not valid until approved.
- Effective-date windows prevent historical orders from drifting to newer substitutions unintentionally.
- ECO implementation never deletes historical revisions or substitution history.
