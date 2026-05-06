# P148 - UAT Scripts, Demo Data Refresh, And Acceptance Matrix

## Scope Completed

- Added a role-wise UAT and acceptance matrix covering setup, planning, production, quality, dispatch, dashboards, admin, and mobile action flows.
- Added a guarded demo reset seed script for UAT-only volatile records.
- Preserved production data safety by requiring an explicit SQLCMD confirmation variable before reset logic can run.

## Files Changed

- `/docs/uat/role-wise-uat-and-acceptance-matrix.md`
- `/database/seed/004_uat_demo_reset.sql`
- `/docs/codex-progress/README.md`

## Validation

- `npm run typecheck`: passed.
- `npm test`: passed, 17 files and 70 tests.
- `npm run build`: passed; Vite reported the existing chunk-size warning.
- `npm run build:host`: passed; Vite reported the existing chunk-size warning.
- `dotnet build C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln`: passed.
- `dotnet test C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln --no-build`: passed, 12 tests.
- `dotnet publish C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.Host\STS.Mfg.Host.csproj -c Release`: passed.

## Risks And Follow-Ups

- The demo reset script intentionally covers demo-scoped volatile tables only; broader master or transactional resets would violate the non-destructive cutover rules.

## Next Prompt

- `/02-prompts/P149_final-design-qa-against-reference-ui-and-production-readiness-review.md`
