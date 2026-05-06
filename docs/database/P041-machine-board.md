# P041 Machine Board and Occupancy Queries

## Procedures

- `production.sp_Machine_Board`
- `production.sp_Machine_Calendar`

## Objective

Serve the lane-board and occupancy-calendar screens with filterable, read-optimized result sets.

## `sp_Machine_Board`

Input params:

- `@CompanyId`
- `@BranchId`
- `@DateFrom`
- `@DateTo`
- `@WorkCenterId = NULL`
- `@MachineId = NULL`
- `@MachineStatus = NULL`
- `@ItemId = NULL`
- `@WorkOrderId = NULL`
- `@JobCardId = NULL`

Output columns:

- `MachineId`
- `MachineCode`
- `MachineName`
- `WorkCenterId`
- `CurrentStatus`
- `ActiveJobCardId`
- `ActiveJobCardNo`
- `ActiveWorkOrderNo`
- `ItemCode`
- `PlannedStartOn`
- `PlannedEndOn`
- `RiskStatus`
- `QueuedJobCardsJson`

Side effects: none  
Idempotency: yes

## `sp_Machine_Calendar`

Input params:

- `@CompanyId`
- `@BranchId`
- `@DateFrom`
- `@DateTo`
- `@WorkCenterId = NULL`
- `@MachineId = NULL`
- `@Status = NULL`

Output columns:

- `BucketDate`
- `ShiftId`
- `MachineId`
- `MachineCode`
- `WorkCenterId`
- `AvailableMinutes`
- `BookedMinutes`
- `UtilizationPercent`
- `OverloadPercent`
- `PrimaryJobCardNo`
- `OccupancyStatus`

Side effects: none  
Idempotency: yes

## Read Model Rules

- board query prioritizes current and next jobs with concise risk/status payloads
- calendar query prioritizes bucket occupancy by day/shift
- both queries must support branch/work-center/machine filtering without requiring raw UI joins

## Source Tables

- `resource.Machines`
- `resource.MachineCalendars`
- `production.JobCards`
- `production.WorkOrders`
- `planning.CapacityBuckets`
- `production.DowntimeEvents`
