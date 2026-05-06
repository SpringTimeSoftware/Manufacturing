# P037 Job Card Create, Assign, Start, Pause, and Resume Logic

## Procedures

- `production.sp_JobCard_CreateForWO`
- `production.sp_JobCard_Assign`
- `production.sp_JobCard_Start`
- `production.sp_JobCard_Pause`
- `production.sp_JobCard_Resume`

## Objective

Establish the first half of the execution state machine with legal transitions, assignment rules, and active-machine protection.

## Shared State Rules

- valid lifecycle: `Created -> Assigned -> Started -> Paused -> Started -> Completed -> Closed`
- `QC_Hold` is entered by quality logic, not directly by assign/start procedures
- illegal transitions must fail with conflict-level error codes

## `sp_JobCard_CreateForWO`

Input params:

- `@CompanyId`
- `@BranchId`
- `@WorkOrderId`
- `@RequestedByUserId`
- `@CorrelationId = NULL`

Output:

- created `JobCards`
- created initial `JobCardEvents` of type `Assigned` or `Created`

Side effects:

- inserts one or more job cards from WO operations

Idempotency:

- idempotent per work-order operation when cards already exist and no explicit split/regeneration flag is supplied

## `sp_JobCard_Assign`

Input params:

- `@JobCardId`
- `@MachineId = NULL`
- `@OperatorUserId = NULL`
- `@ShiftId = NULL`
- `@RequestedByUserId`

Output:

- updated job card assignment fields
- appended `JobCardEvents` row

Side effects:

- changes status from `Created` to `Assigned` when appropriate

Idempotency:

- idempotent when requested assignment matches current assignment

## `sp_JobCard_Start`

Input params:

- `@JobCardId`
- `@MachineId`
- `@OperatorUserId`
- `@EventOn = NULL`
- `@RequestedByUserId`

Output:

- updated job card status to `Started`
- appended `Started` event

Validation:

- job card must be `Assigned` or resumable from `Paused` through the resume proc only
- machine must belong to allowed work center or approved assignment
- no other active started card on that machine

Idempotency:

- safe no-op only if the same job card is already started on the same machine and operator context

## `sp_JobCard_Pause`

Input params:

- `@JobCardId`
- `@ReasonCode`
- `@Remarks = NULL`
- `@RequestedByUserId`

Output:

- updated job card status to `Paused`
- appended `Paused` event

Validation:

- only `Started` cards can be paused
- reason code required

Idempotency:

- not repeatable without effect; second pause on already paused card returns conflict/no-op result

## `sp_JobCard_Resume`

Input params:

- `@JobCardId`
- `@MachineId = NULL`
- `@OperatorUserId = NULL`
- `@RequestedByUserId`

Output:

- updated status to `Started`
- appended `Resumed` event

Validation:

- only `Paused` cards can resume
- machine uniqueness check reruns
- blocked or QC-hold cards cannot resume

Idempotency:

- no-op only when resume target already matches a started state created by the same replay token or correlation
