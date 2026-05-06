# P039 Stock Issue, Return, Transfer, and Reservation Logic

## Procedures

- `inventory.sp_Stock_IssueToWO`
- `inventory.sp_Stock_ReturnFromWO`
- `inventory.sp_Stock_Transfer`
- reservation recalculation helper pipeline

## Objective

Control stock issue, return, transfer, and reservation logic with full traceability and restrictions for blocked or QC-held stock.

## `sp_Stock_IssueToWO`

Input params:

- `@CompanyId`
- `@BranchId`
- `@WorkOrderId`
- `@JobCardId = NULL`
- `@IssueLinesJson`
- `@RequestedByUserId`

Output:

- inserted `StockTransactions`
- updated `StockBalances`
- updated reservation consumption summary

Validation:

- source warehouse/bin exists and is active
- lot/serial requirements satisfy item traceability mode
- sufficient available quantity exists
- blocked, quarantined, or QC-hold stock cannot issue without approved override

Idempotency:

- idempotent by replay token on the issued line set

## `sp_Stock_ReturnFromWO`

Input params:

- `@CompanyId`
- `@BranchId`
- `@WorkOrderId`
- `@ReturnLinesJson`
- `@RequestedByUserId`

Output:

- return `StockTransactions`
- updated `StockBalances`
- release/adjust reservations if needed

Validation:

- cannot return more than issued minus consumed
- traceability identifiers must match issued context or approved substitution rules

Idempotency:

- idempotent by replay token

## `sp_Stock_Transfer`

Input params:

- `@CompanyId`
- `@BranchId`
- `@TransferLinesJson`
- `@RequestedByUserId`

Output:

- paired ledger movements or one transfer movement model, depending final implementation choice
- updated `StockBalances`

Validation:

- destination bin/warehouse active and not blocked
- source quantity available
- lot/serial continuity preserved

## Reservation Recalculation Rules

- reservations are recalculated after issue, return, transfer, receipt, and WO/JC closure events
- priority order:
  1. QC hold and blocked stock excluded from available pool
  2. exact lot/serial reservations
  3. work-order or job-card reservations
  4. sales-order allocations

## Side Effects

- writes immutable stock ledger rows
- updates current stock balance snapshots
- may adjust reservation statuses

## Idempotency Summary

- stock movement procedures are idempotent only with a stable request token or equivalent dedupe key
