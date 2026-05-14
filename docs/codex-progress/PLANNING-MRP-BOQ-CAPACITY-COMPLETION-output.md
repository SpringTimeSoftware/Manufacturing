# Planning / MPS / MRP / BOQ / Capacity Completion Output

Status: COMPLETE for the pack's in-repo P0 scope.

## Implemented

- Added `/planning/workspace` for MPS/MRP/BOQ/capacity closeout review.
- Added compact-grid sections for snapshots, planned orders, pegging, shortages, and capacity buckets.
- Added additive backend/API/DB foundation for planning plans, snapshots, planned orders, planned order conversion, and shortage actions.
- Wired live plan save, manual planned-order save, purchase planned-order conversion, work-order conversion with released-BOM prerequisite, and shortage action save.
- Preserved explicit demo mode and blocked silent seeded live fallback.
- Added tests for planning workspace evidence, conversion action truth, compact forecast grid, and multiline MPS save.
- Updated workbook Current_Mapping and Gap_Template evidence tabs.
- Updated action, field, entity, and screen issue matrices.

## Gated Dependencies

- Recurring MRP scheduler remains disabled with reason because the approved background scheduler service is not part of this repo.
- Transfer planned-order conversion remains disabled with reason until transfer-order posting exists.
- Planning document/evidence upload remains disabled with reason until saved planning-document metadata authorization exists.
- Work-order conversion requires a persisted planned order with released BOM/routing revision.

## Validation Results

- `cmd /c npm run typecheck`: PASS
- `cmd /c npm test`: PASS, 66 files / 235 tests
- `cmd /c npm run audit:erp-completion`: PASS
- `cmd /c npm run build`: PASS
- `cmd /c npm run build:host`: PASS
- `dotnet build src/server/STS.Mfg.sln`: PASS
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 37 tests
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS

## Evidence

- Workbook: `docs/erp_completion_packs_v1/planning_mrp_boq_capacity_completion_pack_v1/planning_mrp_boq_capacity_benchmark_workbook_v1.xlsx`
- Review folder: `docs/erp_completion_packs_v1/planning_mrp_boq_capacity_completion_pack_v1/review/`
- Screenshot folder: `docs/erp_completion_packs_v1/planning_mrp_boq_capacity_completion_pack_v1/review/screenshots/`
- Review pack: `artifacts/review-packs/PLANNING-MRP-BOQ-CAPACITY-COMPLETION-review-pack.zip`
