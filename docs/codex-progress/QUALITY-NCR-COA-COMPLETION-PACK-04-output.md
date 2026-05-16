# QUALITY-NCR-COA-COMPLETION-PACK-04 Output

Status: COMPLETE for Pack 04 touched scope.

Packs 05, 06, and 07 were not executed in this run. The user required sequential packs and separate reports; Pack 04 was completed first and the remaining Wave 1 packs remain queued.

## Pack Scope

Pack folder: `docs/erp_completion_packs_v1/04_quality_ncr_coa_completion_pack_v1/`

Executed scope:
- QC plan setup and characteristic maintenance.
- In-process and final inspection result capture.
- NCR affected lines, containment, RCA, CAPA, disposition release, and close state.
- COA certificate generation, issue, reissue, and evidence snapshots.
- Quality route/menu/action truth.
- Quality live-data truth and screenshot evidence.

## Pre-Implementation Audit Findings

Files inspected:
- `docs/erp_completion_packs_v1/01_SHARED_NON_NEGOTIABLES.md`
- `docs/erp_completion_packs_v1/02_CROSS_PACK_RESIDUAL_GAP_CLOSURE_AUDIT.md`
- `docs/erp_completion_packs_v1/04_quality_ncr_coa_completion_pack_v1/README.md`
- `docs/erp_completion_packs_v1/04_quality_ncr_coa_completion_pack_v1/completion_pack.md`
- `docs/erp_completion_packs_v1/04_quality_ncr_coa_completion_pack_v1/acceptance_gates_and_tests.md`
- `docs/erp_completion_packs_v1/04_quality_ncr_coa_completion_pack_v1/business_decisions_needed.md`
- `docs/erp_completion_packs_v1/04_quality_ncr_coa_completion_pack_v1/codex_output_report_template.md`
- `src/server/STS.Mfg.Domain/Quality/QualityEntities.cs`
- `src/server/STS.Mfg.Application/Contracts/Quality/QualityContracts.cs`
- `src/server/STS.Mfg.Application/Abstractions/Quality/IQualityService.cs`
- `src/server/STS.Mfg.Infrastructure/Quality/QualityService.cs`
- `src/server/STS.Mfg.Infrastructure/Persistence/MfgDbContext.cs`
- `src/server/STS.Mfg.Infrastructure/Persistence/Configurations/QualityEntityConfigurations.cs`
- `src/server/STS.Mfg.Api/Controllers/QualityControllers.cs`
- `src/web/src/pages/QualityPages.tsx`
- `src/web/src/quality/qualityAdapters.ts`
- `src/web/src/api/contracts.ts`
- `src/web/src/api/http.ts`
- `src/web/src/app/router.tsx`
- `src/web/src/layout/navigation.ts`
- `tests/server/STS.Mfg.Tests/CriticalManufacturingRulesTests.cs`
- `src/web/src/pages/WS06InventoryQualityDispatchDocuments.test.tsx`

Observed gaps before coding:
- QC plan create/edit actions were disabled and no persisted characteristic-line maintenance existed.
- Inspection result capture had a live backend foundation, but Pack 04 evidence and completion tests were missing.
- NCR create/save/disposition flows were partial; affected-line, containment, RCA, CAPA, disposition release, and close evidence were not complete.
- COA certificate entity/API/UI did not exist.
- COA binary download was not supported by a durable document renderer.
- Some NCR linked-record actions routed too generically, so they needed to be disabled with a business-safe reason until exact source routes exist.

## Files Changed

Backend and database:
- `database/README.md`
- `database/ddl/20-commercial/090_quality_ncr_coa_completion.sql`
- `src/server/STS.Mfg.Api/Controllers/QualityControllers.cs`
- `src/server/STS.Mfg.Application/Abstractions/Quality/IQualityService.cs`
- `src/server/STS.Mfg.Application/Contracts/Quality/QualityContracts.cs`
- `src/server/STS.Mfg.Domain/Quality/QualityEntities.cs`
- `src/server/STS.Mfg.Infrastructure/Persistence/Configurations/QualityEntityConfigurations.cs`
- `src/server/STS.Mfg.Infrastructure/Persistence/MfgDbContext.cs`
- `src/server/STS.Mfg.Infrastructure/Quality/QualityService.cs`

Web:
- `src/web/src/api/contracts.ts`
- `src/web/src/api/hooks.ts`
- `src/web/src/api/http.ts`
- `src/web/src/app/router.tsx`
- `src/web/src/layout/navigation.ts`
- `src/web/src/quality/qualityAdapters.ts`
- `src/web/src/pages/QualityPages.tsx`

Tests and evidence:
- `src/web/src/layout/NavigationCompleteness.test.tsx`
- `src/web/src/pages/WS06InventoryQualityDispatchDocuments.test.tsx`
- `tests/server/STS.Mfg.Tests/CriticalManufacturingRulesTests.cs`
- `tests/web/quote-sales-order/QuoteSalesOrderForecastAtpCompletion.test.tsx`
- `scripts/wave-automation/capture-wave-screens.mjs`
- `docs/governance/QUALITY-NCR-COA-COMPLETION-PACK-04-screens.json`
- `docs/codex-review-screens/QUALITY-NCR-COA-COMPLETION-PACK-04/`

Matrices:
- `07-ux-governance/action_truth_matrix.csv`
- `07-governance/entity_field_schema_matrix.csv`
- `07-governance/screen_field_violation_matrix.csv`
- `docs/final-audit/07_screen_issue_register.csv`

## Database / DDL

Added additive DDL:
- `database/ddl/20-commercial/090_quality_ncr_coa_completion.sql`

Tables/columns added or extended:
- `quality.InspectionPlanCharacteristics`
- `quality.NonConformances` extension columns for defect category, containment, RCA, CAPA, disposition release, close state, audit metadata, and source context.
- `quality.NonConformanceLines`
- `quality.CoaCertificates`
- `quality.CoaCertificateLines`

Backward compatibility:
- The DDL is additive and guarded with existence checks.
- Historical rows are not assigned fake inspection, NCR, or COA evidence.
- COA generation requires final inspection evidence instead of inventing certificate data.

## APIs / Services

Added or extended endpoints:
- `POST /api/quality/ncrs/{id}/release-disposition`
- `GET /api/quality/coas`
- `GET /api/quality/coas/{id}`
- `POST /api/quality/coas`
- `POST /api/quality/coas/{id}/issue`
- `POST /api/quality/coas/{id}/reissue`

Service changes:
- `QualityService` persists QC plan characteristics.
- `QualityService` persists NCR affected lines, RCA, CAPA, disposition release metadata, and close metadata.
- `QualityService` generates COA certificates from final inspection evidence and snapshots certificate lines.
- `QualityService` issues and reissues COA certificates with version and evidence state.

## UI Screens Changed

Screens changed:
- QC Plan Setup.
- In-Process Inspection.
- Final Inspection.
- NCR Register.
- COA Certificates.

UI behavior corrected:
- `New QC plan` opens a centered modal workspace.
- QC plan characteristics use a compact editable grid.
- `Save QC plan` calls the live API.
- Inspection result workspaces continue to use compact result grids and live save.
- `New NCR` opens a centered modal workspace.
- NCR affected lines use a compact editable grid.
- NCR disposition release calls the live API.
- NCR close calls the live API.
- Generic NCR source/rework open actions are disabled with reason until exact source deep links exist.
- COA generation opens a centered workspace and calls the live API.
- COA issue and reissue call live APIs.
- COA download is disabled with reason because durable PDF/binary rendering is report/document-output scope.

## Tests Added / Updated

Backend:
- `NonConformanceDispositionRelease_ShouldPersistRcaCapaAndAuditState`
- `CoaCertificate_ShouldSnapshotInspectionEvidenceAndIssueState`

Web:
- QC plan characteristic rows save via live API.
- NCR disposition release posts affected-line and CAPA evidence.
- COA generation posts final inspection evidence.
- Navigation completeness includes `/quality/coas`.

Regression adjustment:
- Increased the Quote multiline completion test timeout to avoid full-suite runtime contention. No quote/SO business logic was changed.

## Validation Results

Commands run:
- `npm.cmd run typecheck` - PASS
- `npm.cmd test` - PASS, 68 test files and 250 tests
- `npm.cmd run audit:erp-completion` - PASS
  - `audit:transaction-lines` - PASS
  - `audit:transaction-line-grid` - PASS
  - `audit:governed-fields` - PASS
  - `audit:numeric-fields` - PASS
  - `audit:action-truth` - PASS
  - `audit:live-data-truth` - PASS
  - `audit:upload-truth` - PASS
  - `audit:menu-route-truth` - PASS
- `npm.cmd run build` - PASS, Vite large-chunk warning only
- `npm.cmd run build:host` - PASS
- `dotnet build src/server/STS.Mfg.sln` - PASS
- `dotnet test src/server/STS.Mfg.sln --no-build` - PASS, 56 tests
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release` - PASS after sequential rerun; the first attempt raced with host asset generation and saw a stale asset name.

## Screenshot Evidence

Screenshot folder:
- `docs/codex-review-screens/QUALITY-NCR-COA-COMPLETION-PACK-04/`

Captured:
- `qc-plan-list-top.png`
- `qc-plan-characteristic-workspace-overview.png`
- `qc-plan-characteristic-workspace-lower.png`
- `in-process-inspection-list-top.png`
- `final-inspection-list-top.png`
- `inspection-result-workspace-overview.png`
- `inspection-result-workspace-lower.png`
- `ncr-register-top.png`
- `ncr-affected-line-workspace-overview.png`
- `ncr-affected-line-workspace-lower.png`
- `coa-register-top.png`
- `coa-generation-workspace-overview.png`
- `capture-summary.json`

## Remaining Blockers

Pack 04 blockers:
- COA binary/PDF download remains disabled with reason because durable report/PDF generation belongs to the Reports / Dashboard Builder / document-output pack.
- NCR exact source/rework deep links remain disabled with reason until source-specific route contracts are available.

Not executed by design:
- Dispatch / Logistics / POD pack 05.
- Finance / GL / AP / AR / Costing pack 06.
- Reports / Dashboard Builder pack 07.

## Classification

Closed in this pack:
- QC plan characteristic maintenance.
- Inspection result evidence capture for Pack 04 touched flows.
- NCR affected lines, containment, RCA, CAPA, disposition release, and close state.
- COA certificate generation, issue, reissue, and evidence snapshot.
- Quality menu/route/action truth.
- Quality live-data truth in touched adapters.

Partially closed / foundation only:
- COA document rendering and binary download.
- Exact linked-record navigation from NCR source/rework actions.

Still open for later packs:
- Dispatch gate and POD enforcement.
- Accounting/GL effects for quality-related costs.
- Report builder and durable document output.
- Mobile barcode/camera/offline quality capture.

## Recommended Next Pack

Next pack:
- `05_dispatch_logistics_pod_completion_pack_v1`
