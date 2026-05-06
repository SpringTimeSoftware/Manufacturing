# P062 Output

## Objective Status

- Implemented work-order lifecycle APIs with CRUD, release/re-release/cancel/close actions, generated operation rows, and a readiness snapshot endpoint.

## Deliverables Completed

- Added a `Production` work-order module with `WorkOrders` and `WorkOrderOperations` domain entities plus EF mappings
- Added `api/work-orders` list/detail/create/update endpoints and `release`, `re-release`, `cancel`, `close`, and `readiness` actions
- Implemented readiness evaluation across released BOM presence, routing or BOM-operation availability, linked sales-order state, material availability, blocked/QC-hold exposure, and machine/work-center capacity path checks
- Implemented operation regeneration on release and re-release while preserving non-replaceable operation rows for later execution history compatibility

## Assumptions Captured

- Work-order edits are limited to pre-release states in this pass; released, in-progress, completed, closed, and cancelled work orders are not directly editable
- Release and re-release generate or refresh `WorkOrderOperations` only; job-card creation remains explicitly deferred to `P063`
- Material readiness uses EF-backed stock balance and reservation aggregation, not the future stored-procedure implementation from `/docs/database/P036-wo-release.md`
- Workflow readiness is represented by work-order status (`PendingRelease` or equivalent non-draft state) because a dedicated approval engine is not implemented yet

## Open Issues / Blockers

- No blocker for `P062`
- `sp_WO_Release` and `sp_WO_ReRelease` are not implemented yet; readiness and operation refresh logic currently live in the application service
- Re-release preserves only non-replaceable operation rows by status and does not yet diff against downstream job-card execution history because job cards are not implemented until the next prompt
- Live SQL object creation is still deferred because the repository does not yet contain an ordered migration/procedure pack to apply safely to `Manufacturing_ERP`

## Build / Test / Lint

- Ran `dotnet build src/server/STS.Mfg.sln`
- Ran `dotnet test src/server/STS.Mfg.sln --no-build`
- No lint target is configured in the repository yet

## Next Prompt

- `/02-prompts/P063_job-card-and-downtime-apis.md`
