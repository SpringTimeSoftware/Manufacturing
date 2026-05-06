# P038 Job Card Quantity, Downtime, and Complete Logic

## Procedures

- `production.sp_JobCard_LogQty`
- `production.sp_JobCard_LogDowntime`
- `production.sp_JobCard_Complete`

## Objective

Finish the job-card execution state machine with quantity posting, downtime logging, QC gating, and downstream readiness.

## `sp_JobCard_LogQty`

Input params:

- `@JobCardId`
- `@GoodQty DECIMAL(18,6) = 0`
- `@RejectQty DECIMAL(18,6) = 0`
- `@ScrapQty DECIMAL(18,6) = 0`
- `@CatchWeightQty DECIMAL(18,6) = NULL`
- `@ReasonCode = NULL`
- `@RequestedByUserId`

Output:

- updated job-card cumulative quantities
- appended `QtyLogged` event
- return remaining quantity summary

Side effects:

- updates `JobCards.CompletedGoodQty`, `CompletedRejectQty`, `CompletedScrapQty`

Validation:

- card must be `Started`
- total posted quantity cannot exceed allowable completion without explicit tolerance
- reason code required when reject or scrap is posted

Idempotency:

- idempotent only when replay token/correlation is reused; otherwise quantity logging is additive

## `sp_JobCard_LogDowntime`

Input params:

- `@JobCardId`
- `@MachineId`
- `@ReasonCode`
- `@StartOn`
- `@EndOn`
- `@RequestedByUserId`

Output:

- inserted downtime event row
- appended `DowntimeLogged` event

Side effects:

- writes `production.DowntimeEvents`

Validation:

- machine must match job-card machine unless override is approved
- downtime window must be positive

Idempotency:

- idempotent by replay token or exact unique event key if enforced

## `sp_JobCard_Complete`

Input params:

- `@JobCardId`
- `@RequestedByUserId`
- `@CorrelationId = NULL`

Output:

- updated job-card status
- updated work-order operation readiness
- return downstream-ready summary

Side effects:

- appends `Completed` event
- marks next operation ready where applicable

Validation:

- card must be `Started`
- required quantities or completion policy satisfied
- if QC checkpoint required, completion enters `QC_Hold` or remains blocked until inspection outcome

QC Gating Rules:

- if `RequiresQcCheckpoint = 1`, completion is pending until `sp_QC_SaveInspection` passes/release logic runs
- failed inspection routes to `QC_Hold` or rework flow

Idempotency:

- completing an already completed card returns no-op summary rather than creating duplicate downstream readiness
