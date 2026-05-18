# CONTROLLED-INTERNAL-UAT-RUNTIME-READINESS-13 Output

Date: 2026-05-18
Status: PASS

## Scope

Controlled internal UAT operating kit only. No new feature pack was started, no new module was added, and no accepted Pack 01-11 business logic was changed.

## Preflight

| Check | Result |
| --- | --- |
| Branch | `main` |
| Starting status | Clean against `origin/main` before Pack 13 document creation |
| Starting commit | `bffbce1` |
| Required final audit baseline | `bffbce1` present |
| Required Pack 11 baseline | `70561de` present in history |
| Final audit output | `docs/codex-progress/FINAL-CROSS-PACK-ACCEPTANCE-UI-WORKFLOW-AUDIT-12-output.md` exists |
| Final audit review pack | `artifacts/review-packs/FINAL-CROSS-PACK-ACCEPTANCE-UI-WORKFLOW-AUDIT-12-review-pack.zip` exists |
| Dirty diff classification | Pack 13 documentation and review evidence only |

## Files Created

- `docs/uat/CONTROLLED-INTERNAL-UAT-MASTER-DATA-SETUP-CHECKLIST.md`
- `docs/uat/CONTROLLED-INTERNAL-UAT-SCRIPTS.md`
- `docs/uat/LIVE-RUNTIME-VERIFICATION-PLAN.md`
- `docs/uat/UAT-BLOCKER-REGISTER.md`
- `docs/uat/ENVIRONMENT-READINESS-CHECKLIST.md`
- `docs/codex-progress/CONTROLLED-INTERNAL-UAT-RUNTIME-READINESS-13-output.md`
- `artifacts/review-packs/CONTROLLED-INTERNAL-UAT-RUNTIME-READINESS-13-review-pack.zip`

## Files Changed

- `docs/codex-progress/README.md`

## Business Logic Changes

None.

No backend, frontend, mobile, database, service, calculation, inventory posting, finance posting, report execution, integration, UDF, or service workflow logic was modified.

## UAT Kit Contents

### Master Data Setup Checklist

Created `docs/uat/CONTROLLED-INTERNAL-UAT-MASTER-DATA-SETUP-CHECKLIST.md`.

The checklist covers:

- Company, legal entity, plant, branch, warehouse, bins, fiscal periods, base currency, exchange rates.
- Users, roles, permissions, override roles, mobile roles, integration/report/UDF admin roles.
- Commercial setup: price lists, discount schemes, tax, payment/trade terms, charges, round-off, customer defaults, sales owner/team/territory.
- Item and inventory setup: item groups, UOM, revisions, bin/lot/serial/PCID tracking, quality/COA flags, stock statuses, valuation policy.
- Customer and supplier setup.
- Procurement, production, quality, dispatch/logistics, finance, reports/dashboard, integrations, mobile, UDF/customization, and Service/Warranty/AMC setup.

Every checklist row includes:

- Required or optional.
- Owner role.
- Setup screen/API.
- Sample value needed.
- Blocking impact if missing.
- Validation method.

### Controlled Internal UAT Scripts

Created `docs/uat/CONTROLLED-INTERNAL-UAT-SCRIPTS.md`.

Scripts cover:

- Admin setup.
- Sales-to-Cash.
- Procure-to-Pay.
- Inventory traceability.
- Production execution.
- Quality/NCR/COA.
- Dispatch/POD.
- Finance/GL/AP/AR/Tax/Valuation.
- Reports/Dashboard.
- Integrations/send/outbound ledger.
- Mobile scan/offline/sync.
- UDF/customization.
- Service/Warranty/AMC.

Mandatory end-to-end UAT flows A-H are included:

- Sales-to-Cash.
- Procure-to-Pay.
- Inventory Traceability.
- Production.
- Quality-to-Dispatch.
- Service/Warranty/AMC.
- Mobile Offline.
- Integration Runtime.

Each script includes objective, prerequisite master data, user role, steps, expected result, data records to create, screenshots/evidence required, pass/fail criteria, and severity definitions.

### Live Runtime Verification Plan

Created `docs/uat/LIVE-RUNTIME-VERIFICATION-PLAN.md`.

The plan covers:

- Email provider.
- WhatsApp provider.
- SMS provider.
- CRM.
- Webhooks.
- AI.
- Barcode/scanner.
- Camera/photo evidence.
- Offline/network-loss.
- Deployment/runtime.

### UAT Blocker Register

Created `docs/uat/UAT-BLOCKER-REGISTER.md`.

Initial state:

- No P0/P1 blockers were found during readiness-kit creation.
- Register is ready for UAT execution and includes the requested columns: blocker id, date, module, workflow, role, severity, summary, reproduction steps, expected result, actual result, screenshot/evidence path, owner, status, fix commit, retest result, and decision.

### Environment Readiness Checklist

Created `docs/uat/ENVIRONMENT-READINESS-CHECKLIST.md`.

The checklist covers:

- Git commit baseline.
- DB migration baseline.
- IIS publish path.
- Backend, web, and mobile health checks.
- Auth/login roles.
- Database backup and restore drill.
- Log folder/access.
- API error logging.
- Provider credentials and callback URLs.
- Device list, scanner/camera availability.
- Test users and master data.
- Rollback plan.

## Optional Seed/Test Data

No UAT seed fixture was added.

Reason: the request allowed seed data only if safe and already supported. This readiness pass intentionally avoids creating fake provider credentials, fake sent states, or business data that could pollute production-like environments. The UAT kit instead requires explicit business-owned master-data setup.

## Validation Command Results

| Command | Result |
| --- | --- |
| `npm.cmd run typecheck` | PASS |
| `npm.cmd test` | PASS: 72 test files, 270 tests. Existing non-failing React `act(...)` warnings appeared in finance/P2P frontend tests. |
| `npm.cmd run audit:erp-completion` | PASS: transaction-lines, transaction-line-grid, governed-fields, numeric-fields, action-truth, live-data-truth, upload-truth, and menu-route-truth gates passed. |
| `npm.cmd run build` | PASS. Vite built 178 modules. Chunk-size warning remains for large `index` bundle. |
| `npm.cmd run build:host` | PASS. Host copy script completed. |
| `dotnet build src/server/STS.Mfg.sln` | PASS: 0 errors, 1 existing analyzer warning in `MobileBarcodeCameraOfflineServiceTests.cs` for `xUnit2031`. |
| `dotnet test src/server/STS.Mfg.sln --no-build` | PASS: 100 tests. |
| `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release` | PASS. Published to `src/server/STS.Mfg.Host/bin/Release/net9.0/publish/`. |
| `npm.cmd --prefix src/mobile run typecheck` | PASS |
| `npm.cmd --prefix src/mobile run test:coverage-plan` | PASS: validated 8 mobile action-flow coverage entries. |

## P0/P1 Blockers Found

None during document creation and validation.

## Controlled Internal UAT Readiness

Controlled internal UAT can start after business owners populate the required master data and environment owners complete runtime readiness checks.

## Production Pilot Readiness

Production pilot remains blocked until:

- Business master data is configured and signed off.
- Sandbox/live provider credentials are configured and verified.
- Real scanner/camera/offline device tests pass.
- IIS deployment, API health, logging, backup, and restore drill pass.
- Role-wise UAT scripts are executed.
- UAT blocker register has no open P0/P1 blockers.

## Business Master Data Still Needed

- Company/legal entity, branches/plants, fiscal years and periods.
- Warehouses, bins, stock statuses, base currency, exchange rates.
- Users, roles, permissions, approval/override roles.
- Price lists, discount schemes, tax categories/codes/rates, payment/trade terms, commercial charge policies.
- Customer and supplier profiles, contacts, tax registrations, commercial defaults.
- Item groups, UOM, item revisions, inventory tracking policies, valuation/cost policy.
- BOMs, routings, work centers, job card/operation setup.
- QC plans, inspection characteristics, NCR/CAPA/disposition rules, COA policy.
- Dispatch/logistics policies, carriers, POD policy, staging/bin rules.
- COA/posting profiles, AP/AR/GRIR/COGS/WIP/tax/round-off accounts, open fiscal periods.
- Report/dashboard permissions and generated-output permissions.
- UDF definitions, placements, custom objects/screens.
- Installed asset source rules, warranty policies, AMC contracts, SLA targets, technicians, spare warehouses.

## Provider, Device, and Runtime Inputs Still Needed

- Email SMTP/API credential references and sender identity.
- WhatsApp BSP credentials, business number, approved templates, callback URL.
- SMS gateway credentials and sender ID.
- CRM tenant/org, object mappings, external-id mapping rules.
- Webhook public callback URL and signing secret references.
- AI provider/model credential references.
- Registered trusted mobile devices, scanner devices, camera devices.
- Network-loss/offline test setup.
- IIS publish path, API URL, log path, backup path, and restore target.

## Recommended Next Action

1. Assign business owners to the master-data setup checklist.
2. Complete environment readiness and provider/device runtime checks.
3. Run the Admin setup UAT first.
4. Execute the role-wise UAT scripts in sequence.
5. Log every issue in `docs/uat/UAT-BLOCKER-REGISTER.md`.
6. Fix P0 blockers before continuing UAT; fix P1 blockers before accepting the affected workflow.

## Acceptance Gate Result

PASS.

The controlled internal UAT operating kit was created, the repository still validates, no business logic was changed, no fake completion states were introduced, and production pilot blockers are explicitly listed as runtime/business setup dependencies.
