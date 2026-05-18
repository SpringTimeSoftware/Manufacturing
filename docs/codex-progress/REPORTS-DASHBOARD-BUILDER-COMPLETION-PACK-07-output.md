# REPORTS-DASHBOARD-BUILDER-COMPLETION-PACK-07 Output

Status: COMPLETE for the Pack 07 foundation scope.

## Preflight

- Branch: `main`.
- Pack 06 checkpoint was created before Pack 07: `f933221 Complete finance GL AP AR costing pack`.
- Worktree was clean after the Pack 06 checkpoint.
- Pack 07 dirty files are reporting/dashboard/document-output changes only.

## Audit Findings Before Coding

- Existing `/reports/catalog` used a generic integration export queue, not persisted report runs or generated-output records.
- Existing `/reports/saved-views` was static saved-view data with disabled persistence.
- Existing `/reports/print-pack` generated browser-only CSV/Excel/print/label output from mock data.
- COA download remained disabled from Pack 04 because the report/document renderer was not yet available.
- `integration.ExportJobs` existed, but there was no governed report registry, report run, generated output, dashboard definition, dashboard widget, or download audit model.
- Report permissions and finance report separation were not enforced through reporting APIs.

## Files Inspected

- `docs/erp_completion_packs_v1/07_reports_dashboard_builder_completion_pack_v1/README.md`
- `docs/erp_completion_packs_v1/07_reports_dashboard_builder_completion_pack_v1/completion_pack.md`
- `docs/erp_completion_packs_v1/07_reports_dashboard_builder_completion_pack_v1/acceptance_gates_and_tests.md`
- `docs/erp_completion_packs_v1/07_reports_dashboard_builder_completion_pack_v1/business_decisions_needed.md`
- `src/web/src/pages/WS07Pages.tsx`
- `src/web/src/pages/PrintPackPage.tsx`
- `src/web/src/pages/QualityPages.tsx`
- `src/web/src/api/contracts.ts`
- `src/web/src/api/http.ts`
- `src/server/STS.Mfg.Infrastructure/Persistence/MfgDbContext.cs`
- `src/server/STS.Mfg.Infrastructure/DependencyInjection.cs`
- finance, inventory, quality, dispatch, procurement, production domain read models used by reporting datasets.

## Files Changed Or Created

- Added DDL: `database/ddl/20-commercial/130_reports_dashboard_builder_completion.sql`.
- Added backend reporting domain/contracts/service/controller:
  - `src/server/STS.Mfg.Domain/Reporting/ReportingEntities.cs`
  - `src/server/STS.Mfg.Application/Contracts/Reporting/ReportingContracts.cs`
  - `src/server/STS.Mfg.Application/Abstractions/Reporting/IReportingService.cs`
  - `src/server/STS.Mfg.Infrastructure/Reporting/ReportingService.cs`
  - `src/server/STS.Mfg.Infrastructure/Persistence/Configurations/ReportingEntityConfigurations.cs`
  - `src/server/STS.Mfg.Api/Controllers/ReportingController.cs`
- Updated `MfgDbContext` and dependency injection for reporting entities/service.
- Updated web API contracts/client for `/api/reporting`.
- Replaced print-pack mock/export-registry behavior with registered report run/output/download workflow.
- Updated report catalog/dashboard builder UI to use live reporting APIs.
- Wired COA download to `QUALITY-COA-REGISTER` report run and generated-output download.
- Trimmed `src/web/src/reporting/exportRegistry.ts` to pure delimiter utility only.
- Updated Pack 07/COA tests and governance matrices.
- Build host assets were regenerated under `src/server/STS.Mfg.Host/wwwroot/`.

## Tables / APIs Added

- Tables: `reporting.ReportDefinitions`, `reporting.ReportRuns`, `reporting.ReportOutputs`, `reporting.DashboardDefinitions`, `reporting.DashboardWidgets`.
- APIs:
  - `GET /api/reporting/definitions`
  - `GET /api/reporting/definitions/{id}`
  - `POST /api/reporting/definitions`
  - `POST /api/reporting/definitions/{id}/run`
  - `GET /api/reporting/runs`
  - `GET /api/reporting/outputs`
  - `GET /api/reporting/outputs/{id}/download`
  - `GET /api/reporting/dashboards`
  - `POST /api/reporting/dashboards`
  - `GET /api/reporting/dashboards/{id}/data`

## Reports / Dashboards Hardened

- Built-in reports include sales quote/SO registers, commercial snapshot audit, procurement PO/GRN/supplier invoice registers, inventory balance/movement/traceability, production work-order/job-card registers, quality NCR/COA registers, dispatch shipment/POD registers, and finance GL/tax/valuation/AR ledgers.
- Generated output records persist status, checksum, content type, size, storage path, download count, and last download audit fields.
- Dashboard definitions and widgets persist layout, report references, dataset source, refresh cadence, and drilldown route.
- Finance reports enforce finance/management roles.
- Report run/download paths use persisted datasets and do not use browser-only mock exports.

## Tests Added Or Updated

- Added `tests/server/STS.Mfg.Tests/ReportsDashboardBuilderServiceTests.cs`.
- Updated `src/web/src/pages/WS07MobileIntegrationsAiReporting.test.tsx` for report run/generated-output and dashboard API flows.
- Updated `src/web/src/pages/WS06InventoryQualityDispatchDocuments.test.tsx` for COA report output download.
- Updated `src/web/src/pages/PromptP116P123Pages.test.tsx` for the registered document-output print pack.

## Validation Results

- `npm.cmd run typecheck`: PASS. Log: `artifacts/logs/pack07-typecheck.log`.
- `npm.cmd test`: PASS, 69 files / 257 tests. Log: `artifacts/logs/pack07-npm-test.log`.
- `npm.cmd run audit:erp-completion`: PASS. Log: `artifacts/logs/pack07-audit-erp-completion.log`.
- `npm.cmd run build`: PASS with existing Vite chunk-size warning. Log: `artifacts/logs/pack07-web-build.log`.
- `npm.cmd run build:host`: PASS. Log: `artifacts/logs/pack07-build-host.log`.
- `dotnet build src/server/STS.Mfg.sln`: PASS, 0 warnings / 0 errors. Log: `artifacts/logs/pack07-dotnet-build.log`.
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 75 tests. Log: `artifacts/logs/pack07-dotnet-test.log`.
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS with existing Vite chunk-size warning. Log: `artifacts/logs/pack07-dotnet-publish.log`.

## Screenshots

Folder: `docs/codex-review-screens/REPORTS-DASHBOARD-BUILDER-COMPLETION-PACK-07/`

- `report-catalog.png`
- `dashboard-builder.png`
- `print-pack-document-output.png`
- `coa-report-output.png`

## Review Pack

- `artifacts/review-packs/REPORTS-DASHBOARD-BUILDER-COMPLETION-PACK-07-review-pack.zip`

## Remaining Boundaries

- Scheduled report execution is still disabled with reason until a background scheduling policy/worker is implemented.
- Dashboard role publication remains disabled with reason until dashboard assignment workflow is implemented.
- Provider-based document delivery remains deferred to the integrations delivery pack.
- External carrier/e-way provider documents remain out of this pack unless provider credentials and contracts are configured later.

## Pack 07 Classification

- Closed: report registry, report run history, generated output/download audit, document print/export foundation, COA certificate output, dispatch/POD document dataset, quote/SO/PO/GRN document dataset, production traveler/job-card dataset, inventory traceability export dataset, finance report datasets, tax ledger export, dashboard builder, dashboard widgets, drilldowns with stored routes, report permissions.
- Partially closed/foundation only: report templates, scheduled reports, provider-based document delivery, dashboard role publication.
- Still later-pack scope: mobile report access, live external delivery providers, advanced visual report designer.

Safe to proceed to Wave 2 Packs 08-11: yes, after this Pack 07 commit is pushed.
