# P034 BOQ Convert to PR and WO Logic

## Procedure

`planning.sp_BOQ_ConvertToPRandWO`

## Objective

Convert approved BOQ requirement lines into procurement and production action documents while preserving traceability, partial conversion, and planner overrides.

## Input Params

- `@CompanyId BIGINT`
- `@BranchId BIGINT`
- `@BoqRequirementId BIGINT`
- `@LineIdsJson NVARCHAR(MAX)` selected line IDs
- `@RequestedByUserId BIGINT`
- `@CorrelationId NVARCHAR(64) = NULL`

## Output

- updated BOQ line statuses and conversion references
- created PR headers/lines where action is `BUY` or `SUBCONTRACT`
- created WO headers where action is `MAKE`
- return dataset 1: created document summary
- return dataset 2: skipped/rejected line reasons

## Side Effects

- creates `procurement.PurchaseRequisitions` and `PurchaseRequisitionLines`
- creates `production.WorkOrders`
- updates `planning.BoqRequirementLines.Status`, `ApprovedAction`, and source-link references

## Idempotency

- idempotent per BOQ line when conversion references already exist
- rerun should skip previously converted lines unless explicit re-open workflow exists

## Logic Flow

1. validate BOQ header and selected lines belong to company/branch and are approved
2. lock selected BOQ lines for conversion
3. reject lines already converted or closed
4. group lines by approved action and compatible header grouping rules
5. create or reuse one PR header for grouped procurement lines when appropriate
6. create PR lines for `BUY` and `SUBCONTRACT`
7. create WO headers for `MAKE`
8. mark `TRANSFER` lines as pending transfer workflow if transfer document model is not yet introduced
9. update BOQ line status:
   - `Converted` when fully converted
   - `PartiallyConverted` when line split occurs
10. stamp source-trace fields on created documents

## Read-Only Lock Rules

- converted BOQ lines become read-only for quantity/action edits
- only explicit workflow reversal can reopen a converted line
- override action must be frozen at the time of conversion

## Traceability Fields

Recommended linkage columns on created lines/headers:

- `SourceBoqRequirementLineId`
- `SourceMrpRunId`
- `SourceDocumentType`
- `SourceDocumentId`

## Transaction Boundary

- one transaction for BOQ-line locking, document creation, and status updates
- failure rolls back all creations within the call
