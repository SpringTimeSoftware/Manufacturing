# P043 Order Risk, Stage-Wise, and Executive Dashboard Views

## Procedures

- `reporting.sp_Order_RiskSnapshot`
- `reporting.sp_StageWise_Dashboard`
- supporting executive aggregation views as needed

## Objective

Drive order-delivery risk, cross-functional stage visibility, and executive summary metrics from deterministic business rules.

## `sp_Order_RiskSnapshot`

Input params:

- `@CompanyId`
- `@BranchId = NULL`
- `@DateFrom = NULL`
- `@DateTo = NULL`
- `@CustomerId = NULL`
- `@Status = NULL`

Output columns:

- `SalesOrderId`
- `SalesOrderNo`
- `CustomerName`
- `PromisedDate`
- `CompletionPercent`
- `PendingOperationCount`
- `ShortageCount`
- `SupplierLateCount`
- `QcPendingCount`
- `DispatchReadinessPercent`
- `RiskStatus`
- `PrimaryBlockerCode`

Side effects: none  
Idempotency: yes

## `sp_StageWise_Dashboard`

Input params:

- `@CompanyId`
- `@BranchId = NULL`
- `@AsOfDate = NULL`
- `@CustomerId = NULL`

Output columns:

- `SalesOrderId`
- `SalesOrderNo`
- `CustomerName`
- `StageCode`
- `StageStatus`
- `BlockerCode`
- `OwnerRole`
- `DaysInStage`
- `NextRequiredAction`

Side effects: none  
Idempotency: yes

## Risk Formula Inputs

Risk classification uses deterministic factors from the blueprint:

- due date window
- work-order completion percent
- pending operation count
- BOQ shortage count
- supplier late items
- machine downtime dependency
- QC pending count
- dispatch readiness

## Completion Percent Guidance

- order completion percent should weight production and dispatch state rather than rely on one table only
- partially dispatched orders stay visible until fully shipped or closed

## Blocker Classification

Primary blocker groups:

- `MaterialShortage`
- `SupplierDelay`
- `MachineCapacity`
- `MachineDowntime`
- `QC_Hold`
- `DispatchPending`
- `EngineeringPending`

## Executive Aggregation

The executive layer should aggregate:

- open orders
- overdue orders
- critical shortages
- delayed suppliers
- machine downtime today
- dispatch ready today

These can be exposed through supporting views or one executive summary procedure, provided they remain deterministic and scoped.
