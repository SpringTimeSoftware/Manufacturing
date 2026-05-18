# SERVICE-WARRANTY-AMC-COMPLETION-PACK-11 Output

Status: COMPLETE for the stated Pack 11 foundation scope.

## Preflight

- Branch: `main`
- Starting commit: `bd3ba8b`
- Starting worktree: clean against `origin/main`
- Dirty-diff classification before coding: none
- Scope control: Pack 11 only. Packs 01-10 were not reworked except for direct service-regression guards in navigation/release tests.

## Audit Findings Before Coding

- No active Service / Warranty / AMC module was found before this run.
- Installed-base/customer asset tracking tables, APIs, UI, and reports were not found.
- Warranty policy, entitlement, warranty claim, AMC/service contract, service ticket, visit/job card, spare issue/return, and service charge models were not found.
- Existing WS10 files classified service as excluded; those guards became obsolete once Pack 11 was accepted.
- Inventory, finance, reporting, mobile, integration, and UDF foundations existed and could be consumed.
- Existing mobile runtime had device trust, scan, photo evidence metadata, and offline queue support, but no service task feed or service tab.
- Service report registry entries were not found.
- Fake/local service actions were not found because service screens were absent; the issue was missing persisted module depth.

## Files Inspected

- `docs/erp_completion_packs_v1/11_service_warranty_amc_completion_pack_v1/README.md`
- `docs/erp_completion_packs_v1/11_service_warranty_amc_completion_pack_v1/completion_pack.md`
- `docs/erp_completion_packs_v1/11_service_warranty_amc_completion_pack_v1/acceptance_gates_and_tests.md`
- `docs/erp_completion_packs_v1/11_service_warranty_amc_completion_pack_v1/codex_prompt.md`
- `docs/erp_completion_packs_v1/11_service_warranty_amc_completion_pack_v1/business_decisions_needed.md`
- `docs/erp_completion_packs_v1/01_SHARED_NON_NEGOTIABLES.md`
- `database/README.md`
- `src/server/STS.Mfg.Infrastructure/Inventory/InventoryService.cs`
- `src/server/STS.Mfg.Infrastructure/Finance/FinanceService.cs`
- `src/server/STS.Mfg.Infrastructure/Reporting/ReportingService.cs`
- `src/server/STS.Mfg.Infrastructure/Mobile/MobileRuntimeService.cs`
- `src/web/src/app/router.tsx`
- `src/web/src/layout/navigation.ts`
- `src/mobile/src/MobileShell.tsx`
- `07-ux-governance/action_truth_matrix.csv`
- `07-governance/screen_field_violation_matrix.csv`

## Files Changed / Created

- Added `database/ddl/20-commercial/170_service_warranty_amc_completion.sql`.
- Added `src/server/STS.Mfg.Domain/ServiceManagement/ServiceManagementEntities.cs`.
- Added `src/server/STS.Mfg.Application/Contracts/ServiceManagement/ServiceManagementContracts.cs`.
- Added `src/server/STS.Mfg.Application/Abstractions/ServiceManagement/IServiceManagementService.cs`.
- Added `src/server/STS.Mfg.Infrastructure/ServiceManagement/ServiceManagementService.cs`.
- Added `src/server/STS.Mfg.Infrastructure/Persistence/Configurations/ServiceManagementEntityConfigurations.cs`.
- Added `src/server/STS.Mfg.Api/Controllers/ServiceManagementControllers.cs`.
- Updated `src/server/STS.Mfg.Infrastructure/Persistence/MfgDbContext.cs`.
- Updated `src/server/STS.Mfg.Infrastructure/DependencyInjection.cs`.
- Updated `src/server/STS.Mfg.Infrastructure/Reporting/ReportingService.cs`.
- Updated `src/server/STS.Mfg.Infrastructure/Mobile/MobileRuntimeService.cs`.
- Updated web contracts/API/router/navigation and added `src/web/src/pages/ServiceWarrantyAmcPages.tsx`.
- Added mobile service screen `src/mobile/src/screens/ServiceFieldScreen.tsx`.
- Replaced old WS10 exclusion test with `src/web/src/layout/WS10ServiceCompletionNavigation.test.tsx`.
- Added `src/web/src/pages/ServiceWarrantyAmcPages.test.tsx`.
- Added `tests/server/STS.Mfg.Tests/ServiceWarrantyAmcServiceTests.cs`.
- Updated `tests/server/STS.Mfg.Tests/MobileBarcodeCameraOfflineServiceTests.cs`.
- Updated governance matrices, final audit register, database README, and host web assets.

## DDL / Tables / Columns

Additive DDL creates schema `service` and these tables:

- `service.InstalledAssets`: customer, customer site/contact, item, item revision, serial/lot/PCID, SO/dispatch/invoice source refs, install/commissioning/warranty dates, contract ref, status, location/remarks, legacy marker, audit.
- `service.WarrantyPolicies`: item/item-group/customer-group applicability, duration, start trigger, coverage flags, exclusions, claim limit, status, audit.
- `service.ServiceContracts`: customer, installed asset, contract dates, renewal, coverage, visit cadence, SLA, billing/tax/value snapshot, status, version/prior contract, audit.
- `service.ServiceTickets`: customer/contact/asset/item/serial, issue category, priority/severity/channel, entitlement snapshot, owner/team, SLA targets, lifecycle status, remarks, source refs, close/reopen audit.
- `service.ServiceVisits`: ticket, technician/team, schedule/travel/work timestamps, work performed, diagnosis, resolution, signoff, evidence references, status, audit.
- `service.ServiceSpareMovements`: ticket/visit, item/revision, warehouse/bin/lot/serial/PCID, quantity, stock status, replacement/defective asset refs, stock transaction ref, status, reason, audit.
- `service.WarrantyClaims`: ticket/asset/customer/item/serial, claim type, entitlement snapshot, approval/disposition, replacement asset, cost decision, rejection/override reasons, status, audit.
- `service.ServiceCharges`: ticket/customer, labor/parts/travel/other/discount/tax/total snapshot, tax code/rate, billable status, AR invoice ref, status, audit.

No historical fake assets, warranties, tickets, or charges are backfilled.

## APIs / Services

- Added `/api/service/dashboard`.
- Added `/api/service/installed-assets` create/update/list.
- Added `/api/service/warranty-policies` create/update/list.
- Added `/api/service/contracts` create/update/list.
- Added `/api/service/entitlement`.
- Added `/api/service/tickets` create/update/list/get plus assign/status actions.
- Added `/api/service/visits` create/update/list.
- Added `/api/service/spares/issue` and `/api/service/spares/return`.
- Added `/api/service/warranty-claims` create/list plus decision action.
- Added `/api/service/charges` create/list plus invoice-ready action.
- Service spare issue/return calls accepted inventory posting APIs; bin/lot/serial/PCID and quality/blocked stock enforcement remains server-side.
- Service charge invoice-ready handoff preserves persisted charge/tax snapshot and does not recalculate from current masters.

## UI / Mobile Screens

- Web routes added:
  - `/service/dashboard`
  - `/service/installed-assets`
  - `/service/warranty-policies`
  - `/service/contracts`
  - `/service/tickets`
  - `/service/visits`
  - `/service/spares`
  - `/service/warranty-claims`
  - `/service/charges`
  - `/service/reports`
- Mobile:
  - Added `Service` tab.
  - Live service ticket tasks are returned by `/api/mobile/tasks`.
  - `SERVICE:` / `TICKET:` barcode prefixes resolve persisted service tickets.
  - Service completion queues durable `MobileServiceVisitComplete` offline operations.
  - Service evidence records metadata through the mobile evidence API.
  - Mobile spare issue remains disabled with reason until item/bin/lot/serial/PCID payload selection is available.

## Tests Added / Updated

- `tests/server/STS.Mfg.Tests/ServiceWarrantyAmcServiceTests.cs`
- `tests/server/STS.Mfg.Tests/MobileBarcodeCameraOfflineServiceTests.cs`
- `src/web/src/pages/ServiceWarrantyAmcPages.test.tsx`
- `src/web/src/layout/WS10ServiceCompletionNavigation.test.tsx`
- `src/web/src/layout/NavigationCompleteness.test.tsx`
- `src/web/src/layout/WS11ReleaseHardening.test.tsx`
- `src/mobile/test/mobile-action-flow-coverage.json`

## Validation Results

- `npm.cmd run typecheck`: PASS.
- `npm.cmd test`: PASS, 72 files, 270 tests.
- `npm.cmd run audit:erp-completion`: PASS.
- `npm.cmd run build`: PASS. Vite chunk-size warning only.
- `npm.cmd run build:host`: PASS.
- `dotnet build src/server/STS.Mfg.sln`: PASS.
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 100 tests.
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS after clearing stale Host release static-web-assets cache.
- `npm.cmd --prefix src/mobile run typecheck`: PASS.
- `npm.cmd --prefix src/mobile run test:coverage-plan`: PASS, 8 mobile action-flow entries.

## Screenshots

Folder: `docs/codex-review-screens/SERVICE-WARRANTY-AMC-COMPLETION-PACK-11/`

- `service-dashboard.png`
- `installed-assets.png`
- `service-tickets.png`
- `spare-issue-return.png`
- `warranty-claims.png`
- `service-charges.png`
- `amc-contracts.png`
- `service-reports.png`

## Review Pack

Path: `artifacts/review-packs/SERVICE-WARRANTY-AMC-COMPLETION-PACK-11-review-pack.zip`

## Live Actions

- Installed asset create/update.
- Warranty policy create/update.
- AMC/service contract create/update.
- Service ticket create/update/assign/status close/reopen.
- Service visit create/update with diagnosis/resolution/signoff/evidence metadata.
- Service spare issue/return through inventory validation/posting.
- Warranty claim create/approve/reject.
- Service charge create and invoice-ready handoff.
- Service report catalog links.
- Mobile service ticket lookup, queued completion, and evidence metadata.

## Disabled Actions With Reasons

- Customer credit note/refund from warranty claim remains disabled/absent until customer return/credit-note flow exists.
- Binary customer signature/photo upload remains metadata-only or disabled when runtime storage is unavailable.
- Mobile service spare issue is disabled until mobile tracking payload selection can supply item/bin/lot/serial/PCID safely.
- Full service AR invoice posting from charge is an invoice-ready handoff boundary unless Pack 06 finance posting profile/tax setup is configured.

## Classification

A. Closed in this phase:
- Installed base.
- Customer asset/serial tracking foundation.
- Warranty policy.
- Warranty entitlement snapshot.
- Warranty claim foundation.
- AMC/service contract.
- Service ticket/case workflow.
- Field-service visit/job card foundation.
- Technician assignment by user/team ids.
- Spare issue.
- Spare return.
- Replacement asset linkage foundation.
- Service charge estimate/snapshot.
- Service inventory posting.
- Service reports/dashboard.
- Service integrations extension points through outbound/message/report foundations.
- Service/Warranty/AMC UDF placement readiness through Pack 10 runtime panel.

B. Partially closed / foundation only:
- Preventive maintenance schedule.
- Service invoice / AR handoff.
- Service finance/accounting handoff.
- Service mobile workflow.
- Service evidence/signoff.
- Service integrations/notifications.
- SLA/response tracking.

C. Still open for later runtime/business decisions:
- Customer return / credit note dependency.
- Native signature capture and binary upload runtime verification.
- Mobile spare issue tracking payload UX.
- Advanced technician route/capacity scheduling.
- Runtime field validation beyond current P0 contracts.

## Regression Status

- Pack 04 Quality/NCR/COA regression coverage: PASS through full web/server suites.
- Pack 05 Dispatch/POD regression coverage: PASS through full web/server suites.
- Pack 06 Finance regression coverage: PASS through full web/server suites.
- Pack 07 Reports regression coverage: PASS through full web/server suites.
- Pack 08 Integrations regression coverage: PASS through full web/server suites.
- Pack 09 Mobile regression coverage: PASS through backend targeted tests and mobile typecheck/coverage plan.
- Pack 10 UDF regression coverage: PASS through web UDF runtime tests and full typecheck/build.
- Phase 01/02/03 commercial/customer/inventory regressions: PASS through full web/server suites and ERP audit gates.

The remaining 8-pack foundation sequence is closed for foundation scope. Remaining items above are runtime adapters, business policy decisions, or later operational depth rather than fake/local-only foundations.
