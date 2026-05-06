# Wave 04A.1 Item Master Modal Draft/Edit Completion Output

Date: 2026-04-22

## Scope

Wave 04A.1 stayed inside Item Master UX and draft/edit completion. No Customer/Supplier wave work, sidebar/menu work, unrelated ERP modules, database schema, seed, or auth behavior was changed.

## New Item Draft

- Wired the Item List `New item draft` action to open the same deep Item Master editor in create mode.
- Create mode opens as `Draft Item` with empty required identity fields, validation summary, activation blockers, and save actions.
- Required create fields are enforced client-side before mutation:
  - item code
  - item name
  - short name
  - item type
  - item group/category
  - stock UOM
  - make/buy/subcontract
  - lifecycle status

## Modal Editor

- Replaced the Item Master right drawer with a large centered modal:
  - width: `min(1280px, calc(100vw - 64px))`
  - max height: `calc(100vh - 64px)`
  - internal scroll area
  - keyboard escape/Tab focus handling
- Modal header shows item/draft title, item code/status context, and close action.
- Modal footer includes:
  - Review audit
  - Save Draft
  - Save & Continue
  - Close
- Row click now opens the centered modal, not the old item drawer.

## Tab And Section Navigation

- Replaced the large bubble tab strip with compact grouped section navigation.
- All 18 required sections remain accessible:
  1. Core Info
  2. Classification
  3. Images & Media
  4. Catalog
  5. UOM & Conversions
  6. Packaging
  7. Physical Specs
  8. Barcode & Labels
  9. Variants/Templates
  10. Manufacturing
  11. Planning/Replenishment
  12. Inventory/Warehouse Policy
  13. Quality/Traceability
  14. Sales/Commercial
  15. Purchase/Vendor
  16. Customer References
  17. Attachments/Documents
  18. Audit/History
- Sections are grouped as Identity, Media & Catalog, Measurement & Packaging, Operations, Commercial, References, and Governance.

## Create/Save Backend Support

- Reused existing `POST /api/items` and `PUT /api/items/{id}` core item endpoints.
- Added compatibility-safe profile update support:
  - `PUT /api/items/{id}/profile`
  - application contracts for profile upsert
  - service method to update catalog, packaging, physical specs, manufacturing, planning, inventory, quality, aliases, customer references, and vendor references
  - audit event for profile update
- No database schema or seed script was changed in this pass; the Wave 04A additive extension tables remain the foundation.
- Save actions are guarded by live-session checks. In demo/no-live context, the user receives a clear save-state message rather than a fake success.

## Media Action Status

- Media upload remains disabled because file storage/upload mutation is not implemented.
- The Item List and Images & Media tab now show production-safe disabled-state wording instead of a dead action.

## Tests

- Updated `src/web/src/pages/Wave04AItemMaster.test.tsx`.
- Covered:
  - New Item Draft opens create modal
  - item row opens centered modal and not right drawer
  - grouped navigation renders
  - all 18 required sections remain accessible
  - Save Draft action is present and validation is wired
  - media upload action is disabled with visible reason
  - editable customer/vendor reference grids render
  - internal/scaffold terms remain absent

## Validation

- `npm run typecheck`: PASS
- `npm test`: PASS, 20 files / 81 tests
- `npm run build`: PASS with existing Vite chunk-size warning
- `npm run build:host`: PASS with existing Vite chunk-size warning
- `dotnet build C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln`: PASS
- `dotnet test C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln --no-build`: PASS, 12 tests
- `dotnet publish C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.Host\STS.Mfg.Host.csproj -c Release`: PASS after stopping the stale web dev process that was locking Rollup's native module during the first publish attempt

## Remaining Item Master Gaps

- Media/document file storage and upload APIs remain open.
- Save support is now present for the core item and extension profile sections, but sales/commercial and purchase policy data still need dedicated persisted models if they must become separately governed from item core/profile policy.
- Customer and vendor reference save requires live customer/supplier IDs; a later partner-master wave should improve lookup-based selection.

## Next Recommended Wave

Wave 4B: Customer, Supplier, Pricing, Discount, Tax, Currency, and Terms master-data deep rework.
