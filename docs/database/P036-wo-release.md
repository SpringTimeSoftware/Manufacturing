# P036 Work Order Release and Re-Release Logic

## Procedures

- `production.sp_WO_Release`
- `production.sp_WO_ReRelease`

## Objective

Validate engineering, material, capacity, and workflow readiness before a work order becomes executable, and allow controlled recalculation after change.

## Shared Input Params

- `@CompanyId BIGINT`
- `@BranchId BIGINT`
- `@WorkOrderId BIGINT`
- `@RequestedByUserId BIGINT`
- `@CorrelationId NVARCHAR(64) = NULL`

## Output

- updated `production.WorkOrders.Status`
- refreshed `production.WorkOrderOperations` where needed
- return dataset 1: readiness summary
- return dataset 2: blocking reasons

## Side Effects

- may mark work order `Released`
- may regenerate operation rows on re-release
- does not create job cards directly; that remains `sp_JobCard_CreateForWO`

## Idempotency

- `sp_WO_Release` is idempotent for an already released work order and should return a no-op result
- `sp_WO_ReRelease` is idempotent relative to current BOM/routing state if no underlying changes exist

## Readiness Checks

- work order status allows release
- valid released BOM revision exists
- routing or operation definition exists
- linked sales/order/planning source is in valid state
- material readiness evaluated:
  - reserved availability
  - shortage presence
  - blocked/QC-hold restriction
- capacity readiness evaluated:
  - at least one viable machine/work-center path
- workflow approvals complete

## `sp_WO_Release` Flow

1. lock target work order
2. run readiness validations
3. populate or confirm `WorkOrderOperations`
4. set work order status to `Released`
5. record audit and release event summary

## `sp_WO_ReRelease` Flow

1. validate WO is in releasable post-change state
2. re-read effective BOM/routing
3. compare existing operation set to current engineering baseline
4. refresh open operation rows without deleting historical execution already posted
5. recalculate readiness
6. update release status and return diff summary

## Blocking Reasons

- `MissingReleasedBomRevision`
- `MissingRouting`
- `MaterialShortage`
- `BlockedStock`
- `QcHoldStock`
- `NoCapacitySlot`
- `WorkflowPending`
- `InvalidDocumentState`
