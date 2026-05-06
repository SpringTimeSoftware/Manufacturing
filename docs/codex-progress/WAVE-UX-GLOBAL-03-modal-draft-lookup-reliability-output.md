# Wave UX-GLOBAL-03 Modal, Draft Action, And Lookup Reliability Enforcement Output

Date: 2026-04-23

## Scope

This pass enforced global modal, action, and lookup reliability across currently implemented web deep-edit/action surfaces without backend, database, sidebar, or domain expansion changes.

## Files Changed

- `/07-ux-governance/global_action_modal_lookup_matrix.csv`
- `/docs/codex-progress/README.md`
- `/docs/codex-progress/WAVE-UX-GLOBAL-03-modal-draft-lookup-reliability-output.md`
- `/src/web/src/pages/AdminPages.tsx`
- `/src/web/src/pages/CommercialPlanningPages.tsx`
- `/src/web/src/pages/DashboardPages.tsx`
- `/src/web/src/pages/DispatchPages.tsx`
- `/src/web/src/pages/EngineeringContinuationPages.tsx`
- `/src/web/src/pages/EngineeringPages.tsx`
- `/src/web/src/pages/InventoryPages.tsx`
- `/src/web/src/pages/ItemMasterPages.tsx`
- `/src/web/src/pages/MasterDataUxGlobal02.test.tsx`
- `/src/web/src/pages/MasterPages.tsx`
- `/src/web/src/pages/MeasurementPages.tsx`
- `/src/web/src/pages/OperationsPages.tsx`
- `/src/web/src/pages/OrganizationPages.tsx`
- `/src/web/src/pages/PartnerPages.tsx`
- `/src/web/src/pages/PlanningContinuationPages.tsx`
- `/src/web/src/pages/PlanningPages.tsx`
- `/src/web/src/pages/ProcurementPages.tsx`
- `/src/web/src/pages/ProductionOutputPages.tsx`
- `/src/web/src/pages/PromptP084P089Pages.test.tsx`
- `/src/web/src/pages/PromptP090P095Pages.test.tsx`
- `/src/web/src/pages/PromptP096P101Pages.test.tsx`
- `/src/web/src/pages/QualityPages.tsx`
- `/src/web/src/pages/WaveUxGlobal03ModalReliability.test.tsx`

## Enforcement Summary

- Action/modal/lookup matrix created with 66 classified rows across 62 screen names.
- 64 action surfaces received explicit UI/copy/action reliability fixes or classifications.
- 47 matrix rows now use centered `ErpModalWorkspace` as the deep editor/detail pattern.
- 43 unique deep editor screen names are recorded with centered modal workspaces.
- 63 action surfaces are disabled with a business-safe reason instead of appearing active.
- 0 additional draft actions were made real in this pass; already-real draft flows from earlier waves were preserved.
- 2 platform review surfaces remain preview drawers and are explicitly classified as lightweight preview/audit contexts.

## Modal And Action Fixes

- Converted or confirmed centered modal workspaces for platform admin, commercial planning, procurement, production output, quality, dispatch, planning, engineering, inventory, operations, organization, and platform setup deep details.
- Replaced scattered buttons with governed `ErpActionBar` groups on affected action surfaces.
- Disabled unavailable create, save, upload, export, approve, release, submit, run, and review actions with concise business-safe reasons.
- Kept Dashboard and Platform preview drawers only where they are lightweight read-only review surfaces.

## Lookup Enforcement

- Added or confirmed governed lookup/select behavior on affected controlled fields including supplier, customer, priority, login policy, branch scope, device trust, department type, warehouse type, currency, calendar, issue method, run type, conversion status, machine, location, movement type, return reason, inventory state, route, disposition, traceability, vehicle, and procurement status.
- Remaining lookup gaps are recorded as workflow/master-source dependencies in `/07-ux-governance/global_action_modal_lookup_matrix.csv`.

## Content Cleanup

- Removed production-facing weak labels including `Workspace data`, `Setup planned`, `governed setup`, and `internal only`.
- Replaced user-facing drawer-pattern helper wording with business-facing preview/workspace wording.
- Remaining matches for adapter/mock/fallback/source words are source identifiers, imports, or negative test regexes rather than visible UI copy.

## Remaining Top Action/Lookup Violations

1. Quote create/save remains blocked by commercial workflow enablement.
2. Sales order create/release remains blocked by order-entry/release workflow enablement.
3. Blanket order create/save remains blocked by contract workflow enablement.
4. Forecast import remains blocked by forecast import service.
5. ATP simulation remains blocked by ATP service.
6. Procurement PR/PO/subcontract create/save/approval remains blocked by procurement workflow enablement.
7. Production receipt/scrap/rework posting remains blocked by execution posting workflows.
8. Quality plan authoring, inspection capture, and NCR workflow remain blocked by quality mutation workflows.
9. Dispatch pack, shipment, and dispatch scheduling remain blocked by dispatch workflow enablement.
10. MRP execution, planned-order release, BOQ authoring, and capacity scheduling remain blocked by planning services.
11. Engineering BOM, ECO, routing, operation standard, alternate, and document mutations remain blocked by engineering workflows and document storage.
12. Inventory balance, issue, return, transfer, and trace export remain blocked by inventory posting/export workflows.
13. Production work order, job card, machine assignment, occupancy, shift production, and downtime RCA actions remain blocked by execution/scheduling workflows.
14. Organization company, branch, department, warehouse, bin, and shift mutation actions remain blocked by organization approval workflows.
15. Platform approval drawer remains a lightweight preview/audit context until approval decision workflow expansion.

## Validation

- `npm run typecheck -- --pretty false`: PASS.
- `npm test -- --run`: PASS, 29 test files and 112 tests.
- `npm run build`: PASS. Vite reported the existing large chunk warning.
- `npm run build:host`: PASS. Vite reported the existing large chunk warning.
- Backend validation was not required because no backend/database code was changed.

## Project Run Status

- Backend running at `http://localhost:5102`; `/api/health/ready` returned HTTP 200 Healthy.
- Web dev server running at `http://127.0.0.1:5173`; root returned HTTP 200.
- Mobile Metro running at `http://127.0.0.1:8081`; `/status` returned `packager-status:running`.

## Exact Next Recommended Wave

Wave 5: Engineering And Planning Depth.
