# Wave UX-GLOBAL-01 Output

Date: 2026-04-22

## Scope

Created a global ERP UI/UX governance layer and applied it as a pilot to Item Master plus representative Organization and Planning screens. This pass did not add domain features and did not change backend, database, seed, or auth behavior.

## Reusable Components

- Added `ErpActionBar` for primary, secondary, utility, and danger action groups with disabled reasons.
- Added `ErpFilterBar` for compact governed search and filter rows.
- Added `ErpLookupField` for master-linked controlled selects with free text blocked by default.
- Added `ErpStatusChip` for fixed-height aligned status chips.
- Added `ErpGrid` for dense grid wrapping and chip alignment.
- Added `ErpModalWorkspace` for large centered sticky-header/footer workspaces.
- Added `ErpValidationSummary` for compact expandable validation.
- Added `ErpEmptyState` for compact business-facing empty states.

## Pilot Application

- Item Master now uses governed action bar, filter bar, dense grid wrapper, status chips, modal workspace, compact validation summary, and lookup fields for item type, item group/category, stock UOM, make/buy/subcontract, lifecycle, traceability, warehouse, reorder policy, UOM conversion values, measurement profile, and packaging UOM.
- Item Master disabled actions now include business-safe reasons where the workflow is not available.
- Company Master now uses governed action bar, filter bar, grid wrapper, and disabled reasons for unsupported actions.
- MRP Run Console now uses governed action bar, filter bar, grid wrapper, and disabled reasons for unsupported launch/snapshot actions.

## Governance Documents

- Created `docs/design/erp-ui-interaction-standards.md`.
- Created `07-ux-governance/global_screen_ux_violation_matrix.csv` with 95 audited web/mobile screen rows.
- Created `07-ux-governance/master_lookup_field_rules.md`.

## Validation

- `npm run typecheck`: PASS
- `npm test`: PASS, 22 files / 88 tests
- `npm run build`: PASS
- `npm run build:host`: PASS

No backend validation was required because backend code was not touched.

## Reverification

- 2026-04-22: Re-ran Wave UX-GLOBAL-01 verification after repeated prompt. Scope remained unchanged; no backend, database, auth, sidebar, or domain-feature changes were made.

## Remaining Top UX Violations

1. Customer master requires a deep governed editor.
2. Supplier master requires a deep governed editor.
3. BOM detail editor still uses master-linked free-text patterns.
4. Routing library requires work-center and machine lookup enforcement.
5. Work order editor needs real action gating and lookup controls.
6. Job card editor needs operator, machine, and routing lookups.
7. Shift production entry needs controlled item, machine, and operator values.
8. Material issue requires item, lot, bin, and work-order lookup enforcement.
9. Purchase order workflow needs supplier, item, currency, and payment term lookups.
10. QC plan setup should become the quality lookup source reference implementation.

## Next Recommended Wave

Wave 4B: Customer Master Deep Rework.
