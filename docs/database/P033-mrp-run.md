# P033 MRP Run Logic and Exception Generation

## Procedure

`planning.sp_MRP_Run`

## Objective

Collect demand, explode BOMs, net stock and supply, apply lead times, generate planning results, and surface exceptions without mutating source demand documents.

## Input Params

- `@CompanyId BIGINT`
- `@BranchId BIGINT`
- `@PlanningHorizonStart DATE`
- `@PlanningHorizonEnd DATE`
- `@RunType NVARCHAR(20)` with values `Full`, `NetChange`, `WhatIf`
- `@TriggeredFromMpsId BIGINT = NULL`
- `@RequestedByUserId BIGINT = NULL`
- `@CorrelationId NVARCHAR(64) = NULL`

## Output

- inserted row in `planning.MrpRuns`
- inserted/updated rows in `planning.MrpRunItems`
- inserted/updated rows in `planning.BoqRequirements`
- inserted/updated rows in `planning.BoqRequirementLines`
- return dataset 1: run summary
- return dataset 2: exception summary by code

## Side Effects

- creates one MRP run record
- writes run-specific result rows
- does not directly create PR, PO, WO, or stock movements

## Idempotency

- not idempotent by default because each execution creates a new run version
- deterministic for the same committed source data and parameters
- reruns should supersede prior planning snapshots rather than overwrite them

## Logic Flow

1. validate company, branch, horizon, and active planning prerequisites
2. create `MrpRuns` header with `Running` status
3. collect demand from:
   - open sales-order lines
   - blanket order releases
   - approved forecast buckets
   - MPS where applicable
4. normalize all demand into planning UOM
5. resolve effective BOM revision and routing for make items
6. perform multi-level BOM explosion for make requirements
7. gather current stock, reservations, open supply, in-transit receipts, and blocked/QC-hold restrictions
8. net available supply against gross requirements by need date
9. classify each shortage into recommended action:
   - `BUY`
   - `MAKE`
   - `TRANSFER`
   - `SUBCONTRACT`
   - `NONE`
10. apply supplier lead times and make-time assumptions to generate need dates and late flags
11. write `MrpRunItems`
12. materialize BOQ headers and lines for actionable shortages
13. write exception records into `MrpRunItems.ExceptionCode` and summary datasets
14. mark run `Completed` or `CompletedWithWarnings`

## Exception Categories

- `MissingBom`
- `MissingReleasedBomRevision`
- `MissingRouting`
- `NegativeAvailableStock`
- `SupplierLeadTimeMissing`
- `PastDueNeedDate`
- `BlockedStockOnly`
- `QcHoldStockOnly`
- `NoDefaultWarehouse`
- `NoValidUomConversion`
- `UnapprovedEngineeringData`

## Locking and Transaction Boundaries

- wrap run-header creation and final status update in a transaction
- use temp tables or staging tables for explosion and netting work
- avoid long serializable locks over entire demand/supply tables
- source transactional tables remain read-only during the run

## Read Models Used

- `reporting.vw_ActiveItems`
- `reporting.vw_ReleasedBomRevisions`
- `reporting.vw_BranchWarehouseDefaults`
- `measure.fn_ResolveItemUomFactor`
- `measure.fn_GetEffectiveBomRevisionId`
