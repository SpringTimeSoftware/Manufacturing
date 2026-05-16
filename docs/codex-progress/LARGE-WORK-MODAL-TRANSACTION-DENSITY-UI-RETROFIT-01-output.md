# LARGE-WORK-MODAL-TRANSACTION-DENSITY-UI-RETROFIT-01 Output

Date: 2026-05-16
Branch: `main`

## Result

Status: COMPLETE for the UI foundation scope.

This pass changed only shared web UI and high-risk web workspace layout code. No business logic, database contract, commercial calculation, customer defaulting, inventory posting, stock validation, quote-to-SO conversion, or revision snapshot behavior was changed.

## UI Issues Found Before Coding

- Large work modal width was still effectively capped on some workspaces, especially screens that did not pass `ui-modal__panel--item-master`.
- Modal content could be clipped because the workspace body did not own a constrained scroll area.
- Item Master create/edit had a large duplicate modal title/status block, wasting the first viewport.
- `FormShell` could stretch internal grid rows vertically inside tall modal workspaces, creating blank bands before validation and fields.
- Quote and Sales Order headers were one-field-per-row work surfaces inside large cards rather than dense operational forms.
- Desktop transaction grids rendered field labels inside every row, duplicating the table column captions and making line entry taller than necessary.
- Quote and Sales Order did not expose the common transaction quick actions in the modal header; this made actions hard to inspect before later Dispatch/POD flows.
- A trial sticky validation treatment overlapped scrolled quote content; it was removed before final validation.

## Exact Screens Inspected

- Item Master list and create/edit workspace: `/masters/items`, `src/web/src/pages/ItemMasterPages.tsx`
- Quote list and quote draft workspace: `/sales/quotes`, `src/web/src/pages/CommercialPlanningPages.tsx`
- Sales Order list and order draft workspace: `/sales/orders`, `src/web/src/pages/CommercialPlanningPages.tsx`
- Shared modal component: `src/web/src/ui/ModalDialog.tsx`
- Shared ERP component layer: `src/web/src/ui/ErpComponents.tsx`
- Shared form shell: `src/web/src/ui/FormShell.tsx`
- Shared CSS: `src/web/src/styles/base.css`
- Pack contract: `docs/erp_completion_packs_v1/large_work_modal_transaction_density_ui_retrofit_pack_v1/*`

## Exact Screens Changed

- Item Master create/edit modal:
  - Replaced the large status/titlebar body band with compact status chips.
  - Kept centered workspace and sticky footer action bar.
- Quote draft modal:
  - Added large workspace sizing.
  - Added compact transaction quick actions with disabled reasons.
  - Converted header body to dense 12-column transaction layout.
  - Moved default/status chips into compact modal metadata.
  - Kept quote line entry in compact editable grid and shifted required markers to column headers.
- Sales Order draft modal:
  - Added large workspace sizing.
  - Added compact transaction quick actions with disabled reasons.
  - Converted header body to dense 12-column transaction layout.
  - Kept sales order line entry in compact editable grid and shifted required markers to column headers.

## Reusable Components Changed

- `src/web/src/ui/ErpComponents.tsx`
  - `ErpModalWorkspace` now applies `erp-modal-workspace--work`.
  - `ErpModalWorkspace` accepts `quickActions`.
  - Added `ErpTransactionQuickActions`.
  - `ErpTransactionLineColumn` accepts `required`.
  - `ErpTransactionLineGrid` renders required markers in table headers.
  - Lookup/number/decimal/money controls accept `className` for dense grid placement.
- `src/web/src/ui/FormShell.tsx`
  - Added `className` and `bodyClassName` hooks.
- `src/web/src/styles/base.css`
  - Added large work-modal sizing: `width: min(96vw, 1720px)`, `height: min(94vh, 980px)`.
  - Added constrained internal modal scrolling.
  - Added dense 12-column transaction header form layout.
  - Hid per-row field labels inside desktop transaction grids while preserving accessible labels.
  - Tightened transaction grid spacing and added required column marker styling.
  - Prevented `FormShell` row stretching with `align-content: start`.

## Tests Added / Updated

- Added `tests/web/ui-density/LargeWorkModalTransactionDensity.test.tsx`
  - Verifies large work modal sizing, internal scroll containment, dense transaction header grids, required transaction column markers, and no first-line-only quote/SO source pattern.
- Updated `src/web/src/ui/ErpComponents.test.tsx`
  - Verifies work modal class and quick actions.
  - Verifies required transaction column headers.
- Updated `src/web/src/pages/PromptP090P095Pages.test.tsx`
  - Adjusted expected Sales Order header title to the new dense `Sales order controls` label.

## Screenshots / Review Evidence

Folder: `docs/codex-review-screens/LARGE-WORK-MODAL-TRANSACTION-DENSITY-UI-RETROFIT-01/`

Captured PNGs:
- `item-master-list-top.png`
- `item-master-work-modal-overview.png`
- `item-master-work-modal-lower.png`
- `quote-list-top.png`
- `quote-draft-work-modal-overview.png`
- `quote-draft-work-modal-lower.png`
- `sales-order-list-top.png`
- `sales-order-work-modal-overview.png`
- `sales-order-work-modal-lower.png`

Capture config:
- `docs/governance/LARGE-WORK-MODAL-TRANSACTION-DENSITY-UI-RETROFIT-01-screens.json`

## Validation Results

- `npm.cmd run typecheck`: PASS
- `npm.cmd test`: PASS, 68 test files, 247 tests
  - Existing React `act(...)` warnings still appear in one procurement notification-provider test path; no test failed.
- `npm.cmd run audit:erp-completion`: PASS
  - `audit:transaction-lines`: PASS
  - `audit:transaction-line-grid`: PASS
  - `audit:governed-fields`: PASS
  - `audit:numeric-fields`: PASS
  - `audit:action-truth`: PASS
  - `audit:live-data-truth`: PASS
  - `audit:upload-truth`: PASS
  - `audit:menu-route-truth`: PASS
- `npm.cmd run build`: PASS
  - Vite reported the existing large chunk size warning.
- `dotnet build src/server/STS.Mfg.sln`: PASS after stopping the screenshot-hosted `STS.Mfg.Host` process that had locked debug DLLs.
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 54 tests.

Targeted regression tests also passed:
- `src/ui/ErpComponents.test.tsx`
- `tests/web/ui-density/LargeWorkModalTransactionDensity.test.tsx`
- `tests/web/quote-sales-order/QuoteSalesOrderForecastAtpCompletion.test.tsx`
- `tests/web/transaction-line-depth/QuoteMultilineFlow.test.tsx`
- `tests/web/transaction-line-depth/SalesOrderMultilineFlow.test.tsx`
- `src/pages/PromptP090P095Pages.test.tsx`

## Business Logic Files Changed

None.

## Remaining UI Gaps

- Quote/SO quick actions for Email, WhatsApp, Attachments, Notes, Audit, and Print are visible but disabled with business-safe reasons until the corresponding provider/template/attachment workflows are implemented.
- Other transaction-heavy screens inherit the shared modal/grid standards, but this pass only page-tuned Item Master, Quote, and Sales Order as the highest-risk current examples.
- Formal tablet/mobile screenshot coverage was not added in this pass; the CSS includes responsive fallbacks for the dense transaction header layout.

## Safe To Proceed

Yes. It is safe to proceed to Dispatch / Logistics / POD from the UI foundation perspective. Later modules should use `ErpModalWorkspace`, `FormShell` dense transaction body classes, and `ErpTransactionLineGrid` rather than creating new card-heavy transaction editors.
