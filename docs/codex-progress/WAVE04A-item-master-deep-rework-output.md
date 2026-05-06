# Wave 04A Item Master Deep Rework Output

Date: 2026-04-22

## Scope

Wave 04A focused on Item Master only: list density, deep item detail sections, media/catalog/packaging/spec/reference support, and additive database foundation. Sidebar/menu cosmetics, unrelated master-data screens, and later-wave ERP modules were not reworked.

## Backend/DB Changes

- Added `database/ddl/10-master-data/020_item_master_v2_extension_tables.sql`.
- The pack is additive and idempotent. It does not replace existing item, UOM, variant, barcode, manufacturing, or execution tables.
- Added extension tables:
  - `[master].[ItemMedia]`
  - `[master].[ItemDocuments]`
  - `[master].[ItemCatalog]`
  - `[master].[ItemPackaging]`
  - `[master].[ItemPhysicalSpecs]`
  - `[master].[ItemAliases]`
  - `[master].[ItemCustomerReferences]`
  - `[master].[ItemVendorReferences]`
  - `[master].[ItemManufacturingPolicies]`
  - `[master].[ItemPlanningPolicies]`
  - `[master].[ItemInventoryPolicies]`
  - `[master].[ItemQualityPolicies]`
- Added guarded seed rows for the new Item Master extension tables in `database/seed/003_minimum_masters_seed.sql`.
- Added C# entities, EF DbSets/configurations, application DTOs, service read model, and a read-only aggregate endpoint at `GET /api/items/{id}/profile`.
- Updated the web Item Master adapter to hydrate live extension-table profile data when available while preserving the existing compatibility behavior if the profile endpoint is unavailable.
- Updated `database/README.md` execution order to run the new pack after `010_master_resource_engineering_tables.sql`.
- No appsettings or auth behavior were changed in this pass.

## Web Item List Improvements

- Reworked Item List into a denser ERP registry with KPI strip:
  - total items
  - active items
  - incomplete items
  - QC required
  - catalog visible
  - make / buy / subcontract split
- Added filters for search, status, type, lifecycle, group, make/buy/subcontract, QC required, catalog visibility, media presence, and default warehouse.
- Reworked table columns to cover item code, name, type, group/category, UOM, make/buy, QC, catalog, media/documents, and status.
- Row selection opens a wider right-side item detail editor.
- Actions are product-safe: import/export, catalog preview, upload media, and new item draft.

## Item Detail Tabs/Sections

Implemented the required 18 Item Master sections:

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

The drawer now shows validation blockers, governed policy fields, compact grids/tables, media/document empty states, customer/vendor reference tables, barcode rules, catalog preview data, packaging hierarchy, physical specs, and audit events.

## Support Status

- Media: UI supports primary image, gallery/media list, drawing/spec/photo slots, status, approval, and empty states. Additive DB table and read profile API exist. Upload/set-primary/retire mutation APIs remain a gap.
- Catalog: UI supports visibility, catalog title, section, marketing copy, customer-visible specs, publish status, effective dates, and preview. Additive DB table and read profile API exist. Catalog publish/save mutation APIs remain a gap.
- Packaging: UI supports inner pack, carton, pallet, packaging UOM, weights, dimensions, label count, and packing instructions. Additive DB table and read profile API exist.
- Physical specs: UI supports dimensions, grade, material, finish, shelf life, and storage conditions. Additive DB table and read profile API exist.
- References: UI supports customer and vendor item reference grids. Additive DB tables and read profile API exist.
- Planning, manufacturing, inventory, and quality policies: additive DB tables and read profile API exist.
- Existing live item APIs remain in use for core item, UOM, variant, and barcode data. The extension profile is read-backed where the new tables have been deployed, with compatibility-safe UI data retained for environments that have not applied the extension pack yet.

## Tests

- Added `src/web/src/pages/Wave04AItemMaster.test.tsx`.
- Covered:
  - dense ERP item list columns and filters
  - all 18 required detail sections
  - media/catalog/packaging/spec/customer/vendor/document surfaces
  - no internal/scaffold wording in Item Master list/detail
- Existing P084-P089 master-data tests still pass.

## Validation

- `npm run typecheck`: PASS
- `npm test`: PASS, 20 files / 80 tests
- `npm run build`: PASS with existing Vite chunk-size warning
- `npm run build:host`: PASS with existing Vite chunk-size warning
- `dotnet build C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln`: PASS after stopping the earlier local Debug host process that was locking build output
- `dotnet test C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln --no-build`: PASS, 12 tests
- `dotnet publish C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.Host\STS.Mfg.Host.csproj -c Release`: PASS with existing Vite chunk-size warning and existing npm audit notice

## Remaining Item Master Gaps

- Add upload/storage workflow for item media and documents.
- Add save/update endpoints for catalog, packaging, physical specs, references, and policy sections.
- Add richer seed data for extension tables after the extension pack is run in the target environment.

## Next Recommended Wave

Wave 4B: Customer, Supplier, Pricing, Discount, Tax, Currency, and Terms master-data deep rework.
