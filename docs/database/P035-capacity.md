# P035 Capacity Rebuild and Overload Logic

## Procedure

`planning.sp_Capacity_Rebuild`

## Objective

Recompute required and available load across work center, machine, shift, and date buckets for RCCP/CRP read models.

## Input Params

- `@CompanyId BIGINT`
- `@BranchId BIGINT`
- `@DateFrom DATE`
- `@DateTo DATE`
- `@BucketType NVARCHAR(20)` with values `Day`, `Shift`, `Week`
- `@RequestedByUserId BIGINT = NULL`
- `@CorrelationId NVARCHAR(64) = NULL`

## Output

- refreshed capacity snapshot rows in `planning.CapacityPlans` and `planning.CapacityBuckets`
- return dataset 1: bucket load summary
- return dataset 2: overload summary and alternative-slot candidates

## Side Effects

- rebuilds capacity buckets for the requested horizon
- does not reschedule jobs automatically

## Idempotency

- idempotent for the same committed scheduling and calendar state because it rebuilds derived buckets

## Logic Flow

1. validate date range and branch scope
2. collect available capacity from:
   - machine calendars
   - shift definitions
   - maintenance/blocked statuses
   - parallel capacity units on work centers
3. collect required load from:
   - released work-order operations
   - assigned job cards
   - queued routing operations not yet started
4. bucket load by date and optionally shift
5. calculate:
   - required minutes
   - available minutes
   - utilization percent
   - overload percent
6. identify alternative slots:
   - same work center different machine
   - nearest future bucket with capacity
7. write/rebuild capacity plan outputs

## Output Columns For Capacity View

- `BucketDate`
- `ShiftId`
- `WorkCenterId`
- `MachineId`
- `RequiredMinutes`
- `AvailableMinutes`
- `UtilizationPercent`
- `OverloadPercent`
- `AlternativeSlotDate`
- `AlternativeMachineId`

## Transaction and Performance Notes

- treat capacity buckets as derived snapshot data
- rebuild in batch, preferably using staging tables then merge/replace
- avoid per-row cursor updates for large horizons
