# WS10 Service / Warranty / AMC Output

Date: 2026-05-13

Status: BLOCKED

WS10 was not implemented as a service/warranty/AMC product module because the current V1 scope guardrails explicitly exclude field service, warranty, and customer support suite. The repo also has no existing service/warranty/AMC routes, screens, APIs, DB objects, or seeded operational records to deepen.

## Files Changed

- `src/web/src/layout/WS10ServiceExclusion.test.tsx`
- `docs/workstream-progress/WS10/WS10_scope_matrix.csv`
- `docs/workstream-progress/WS10/WS10_action_matrix.csv`
- `docs/workstream-progress/WS10/WS10_field_matrix.csv`
- `docs/workstream-progress/WS10/WS10_api_db_matrix.csv`
- `07-ux-governance/action_truth_matrix.csv`
- `07-governance/screen_field_violation_matrix.csv`
- `07-governance/entity_field_schema_matrix.csv`
- `docs/final-audit/07_screen_issue_register.csv`
- `docs/codex-review-screens/WS10/`
- `docs/codex-progress/README.md`
- `artifacts/review-packs/WS10-review-pack.zip`

## Screens Completed

- None. No service/warranty/AMC screens exist in the implemented V1 app, and no out-of-scope scaffold was introduced.

## Fields Corrected

- No runtime fields were changed.
- Governance matrices now record service-ticket, warranty, AMC, service visit, spare issue, and RMA fields as blocked by scope rather than free-text partial scaffolds.

## Actions Wired / Disabled / Hidden

- Wired: 0
- Disabled with reason: 0
- Hidden / not introduced: 7 action groups
  - New service ticket / Save complaint
  - Search warranty / Open entitlement
  - New AMC contract / Save AMC
  - Create visit / Start task / Complete task
  - Issue spare / Return spare
  - Create RMA / Receive repair / Replace item
  - Refresh service dashboard / Export

## Backend / DB Changes

- No backend or DB changes were made.
- Service-ticket, warranty, AMC, service visit/task, service spare, RMA/repair, and service dashboard APIs/tables are recorded as blocked in `docs/workstream-progress/WS10/WS10_api_db_matrix.csv`.

## UAT Scenarios

- Service ticket registration: BLOCKED by V1 field-service exclusion.
- Warranty lookup by serial/lot/customer/item: BLOCKED by V1 warranty exclusion.
- AMC contract and entitlement check: BLOCKED by V1 service/warranty exclusion.
- Service visit/task lifecycle: BLOCKED by V1 field-service exclusion.
- Spare part issue/return for service: BLOCKED by V1 field-service exclusion.
- RMA/repair/replacement: BLOCKED by V1 customer-support exclusion.
- Service dashboard: BLOCKED by V1 service-suite exclusion.
- Route/menu exclusion guard: PASS through `src/web/src/layout/WS10ServiceExclusion.test.tsx`.

## Top Remaining Blockers

- `docs/architecture/scope-guardrails.md` explicitly excludes field service, warranty, or customer support suite from V1.
- No service/warranty/AMC route, screen, API, DB object, or navigation entry exists.
- Implementing WS10 would introduce a new out-of-scope product suite.
- Product owner must approve a V1 scope change before service/warranty/AMC implementation can begin.

## Validation Results

- `npm run typecheck`: PASS
- `npm test`: PASS, 48 test files / 189 tests
- `npm run build`: PASS
- `npm run build:host`: PASS
- `dotnet build src/server/STS.Mfg.sln`: PASS
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 37 tests
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS

## Screenshot Evidence

Folder: `docs/codex-review-screens/WS10/`

- `dashboard-navigation-no-service-suite.png`
- `service-route-not-found.png`
- `capture-summary.json`

## Review Pack

Path: `artifacts/review-packs/WS10-review-pack.zip`
