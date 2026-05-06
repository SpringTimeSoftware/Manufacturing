# P063 Output

## Objective Status

- Implemented job-card execution APIs with list/detail, create-for-work-order, assign, start, pause, resume, quantity, downtime, complete, and mobile replay endpoints.

## Deliverables Completed

- Added a `Production` execution service for job-card lifecycle control, machine uniqueness checks, downtime capture, and per-action mobile replay handling
- Added `api/job-cards` list/detail endpoints plus `create-for-work-order`, `assign`, `start`, `pause`, `resume`, `quantities`, `downtime`, `complete`, and `mobile-replay` actions
- Added `api/downtime` list endpoint for machine/job-card downtime history
- Wired work-order execution status updates so started operations move to `InProgress`, QC-gated completion moves the operation to `QC_Hold`, and non-QC completion marks the next operation `Ready`

## Assumptions Captured

- A `create-for-work-order` endpoint was added in this prompt because the requested execution endpoints need a job-card generation entry point after work-order release
- This pass creates one primary job card per work-order operation with `SplitSequenceNo = 1`; split/merge production cards remain future work
- Mobile replay is a lightweight sequential batch endpoint with per-action success or conflict reporting; persistent idempotency-token storage is still deferred
- Quantity logging uses EF-backed aggregate checks against job-card and work-order operation planned quantity, not the future `sp_JobCard_LogQty` implementation
- QC-required completion parks the job card and work-order operation in `QC_Hold` and moves the parent work order to `OnHold` until later quality prompts handle release

## Open Issues / Blockers

- No blocker for `P063`
- `sp_JobCard_CreateForWO`, `sp_JobCard_Assign`, `sp_JobCard_Start`, `sp_JobCard_Pause`, `sp_JobCard_Resume`, `sp_JobCard_LogQty`, `sp_JobCard_LogDowntime`, and `sp_JobCard_Complete` are not implemented yet; this prompt keeps the orchestration in the application service
- Offline replay does not yet persist device operation IDs or idempotency tokens, so duplicate protection is limited to current server state and transition checks
- Live SQL object creation remains deferred until the repository has an ordered migration/procedure pack safe to apply to `Manufacturing_ERP`

## Build / Test / Lint

- Ran `dotnet build src/server/STS.Mfg.sln`
- Ran `dotnet test src/server/STS.Mfg.sln --no-build`
- No lint target is configured in the repository yet

## Next Prompt

- `/02-prompts/P064_production-receipt-scrap-and-rework-apis.md`
