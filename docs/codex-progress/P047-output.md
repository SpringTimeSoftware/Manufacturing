# P047 Output

## Objective Status

- Added policy-based authorization and data-scope helpers for active company/branch context, warehouse/department narrowing, and own/team visibility.

## Deliverables Completed

- Added named authorization policies for authenticated access, platform/company admin, branch operations, warehouse operations, audit read, and diagnostics read
- Added `CurrentUserContext`, `DataScopeContext`, queryable scope extensions, stored-procedure scope builders, and enforcement helpers
- Added `/api/system/context` as a scope-introspection endpoint for backend verification and future admin diagnostics

## Assumptions Captured

- Application handlers and EF queries enforce the active company/branch context first; SQL procedures receive the same scoped inputs through `CreateStoredProcedureScope`
- Own/team visibility is represented by `RecordVisibilityMode` plus team-user IDs rather than a separate permission engine

## Open Issues / Blockers

- None for `P047`

## Build / Test / Lint

- Ran `dotnet build src/server/STS.Mfg.sln`
- Ran `dotnet test src/server/STS.Mfg.sln --no-build`

## Next Prompt

- `/02-prompts/P048_ef-core-dapper-and-stored-procedure-access-pattern.md`
