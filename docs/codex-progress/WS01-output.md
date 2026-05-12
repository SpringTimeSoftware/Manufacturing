# WS01 Runtime / UAT / Seed Truth Output

Date: 2026-05-13

## Status

WS01 runtime, UAT seed-truth, and evidence-console scope is complete for the current workstream. Full role workflow acceptance remains outside WS01 and is carried by downstream workflow-depth workstreams.

## Files Changed

- `package.json`
- `src/server/STS.Mfg.Api/Controllers/SystemController.cs`
- `src/server/STS.Mfg.Host/wwwroot/index.html`
- `src/server/STS.Mfg.Host/wwwroot/assets/*`
- `src/web/src/api/contracts.ts`
- `src/web/src/api/http.ts`
- `src/web/src/app/router.tsx`
- `src/web/src/help/helpContent.ts`
- `src/web/src/layout/AppShell.tsx`
- `src/web/src/layout/NavigationCompleteness.test.tsx`
- `src/web/src/layout/navigation.ts`
- `src/web/src/pages/RuntimeUatPage.tsx`
- `src/web/src/pages/RuntimeUatPage.test.tsx`
- `src/web/src/runtime/ws01RuntimeProbe.ts`
- `tests/server/STS.Mfg.Tests/AuthServiceTests.cs`
- `07-ux-governance/action_truth_matrix.csv`
- `07-governance/screen_field_violation_matrix.csv`
- `docs/final-audit/07_screen_issue_register.csv`
- `docs/help/HELP_ACTION_REGISTRY.csv`
- `docs/help/HELP_SCREEN_REGISTRY.csv`
- `docs/workstream-progress/WS01/WS01_scope_matrix.csv`
- `docs/workstream-progress/WS01/WS01_uat_probe_matrix.csv`
- `docs/uat/LOCALHOST_SMOKE_TEST_REPORT.md`
- `docs/uat/LOCALHOST_ROLE_WISE_UAT_RESULTS.md`
- `database/README.md`

## Screens Completed

| Screen | Route | Status | Evidence |
| --- | --- | --- | --- |
| Runtime UAT | `/platform/runtime-uat` | COMPLETE | Searchable evidence grid, governed role/status filters, Run checks, Export evidence, centered detail modal, screen help, and role-aware navigation are implemented. |

## Actions Wired / Disabled / Hidden

| Action | Final state | Notes |
| --- | --- | --- |
| Run checks | WORKING | Calls live health, readiness, context, notification, approval, representative role APIs, seed proof, and deployment checks. |
| Export evidence | WORKING / DISABLED WITH REASON | Exports filtered CSV when rows exist; disabled with visible reason when no evidence rows are available. |
| Open screen | WORKING / DISABLED WITH REASON | Opens exact probe route when route context exists; API-only checks are disabled with a visible business reason. |

## Data And Seed Truth

- Live authenticated Runtime UAT probes show API results or explicit failure rows; no silent operational baseline rows are injected on API failure.
- UAT seed proof was rerun against `STS_Mfg_Bootstrap` with configured local attachment storage.
- Branch-12 UAT proof shows 18 PASS, 10 PARTIAL role-context rows, and 0 FAIL on the Runtime UAT console.
- `database/README.md` remains the source for ordered DDL/procedure/seed application through `seed/005_uat_runtime_seed.sql`.

## Validation Results

| Command | Result |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm test` | PASS, 40 files / 168 tests |
| `npm run build` | PASS, with existing Vite chunk-size warning |
| `npm run build:host` | PASS |
| `dotnet build src/server/STS.Mfg.sln` | PASS |
| `dotnet test src/server/STS.Mfg.sln --no-build` | PASS, 32 tests |
| `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release` | PASS |

## Screenshots

Stored under `docs/codex-review-screens/WS01/`:

- `01-runtime-uat-page.png`
- `02-runtime-uat-disabled-open-modal.png`
- `03-runtime-uat-linked-screen-modal.png`
- `04-runtime-uat-help.png`

## Remaining Blockers

- No WS01 runtime/build blocker remains.
- Full role-wise business acceptance remains PARTIAL because workflow-depth items such as write lifecycle, approval/audit depth, irreversible transaction posting, and mobile execution belong to downstream workstreams.

## Review Pack

`artifacts/review-packs/WS01-review-pack.zip`
