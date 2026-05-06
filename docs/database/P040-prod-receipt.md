# P040 Production Receipt, Scrap, and Rework Logic

## Procedure

`production.sp_ProdReceipt_Create`

## Objective

Post finished or intermediate output, update stock ledger and completion progress, and route scrap or rework consistently.

## Input Params

- `@CompanyId`
- `@BranchId`
- `@WorkOrderId`
- `@JobCardId = NULL`
- `@ReceiptLinesJson`
- `@RequestedByUserId`
- `@CorrelationId = NULL`

## Output

- created `ProductionReceipts` and `ProductionReceiptLines`
- inserted inventory ledger rows
- updated work-order/job-card progress
- return receipt summary and traceability identifiers

## Side Effects

- writes production receipt documents
- writes `inventory.StockTransactions`
- updates `inventory.StockBalances`
- may create or update lots/serials
- may create rework records or scrap entries based on disposition

## Idempotency

- idempotent by receipt request token
- duplicate replay must not create duplicate stock or lots

## Logic Flow

1. validate WO/JC status and remaining producible quantity
2. validate output item, UOM, and traceability requirements
3. create lot/serial rows as required
4. create production receipt header and lines
5. post stock ledger receipt movement into WIP or FG destination
6. update job-card or work-order completion percentages
7. if scrap reported:
   - write scrap entry
   - update scrap totals
8. if rework required:
   - write rework record or mark quantity for rework flow

## Consistency Rules

- stock ledger, receipt document, and WO/JC progress must commit in one transaction
- quantity cannot exceed remaining producible quantity without controlled override
- QC-required output may receipt into hold state or QC warehouse/bin rather than immediately available FG
