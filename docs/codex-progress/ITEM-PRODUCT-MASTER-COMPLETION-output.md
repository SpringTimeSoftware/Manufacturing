# ITEM-PRODUCT-MASTER-COMPLETION

Pack status: COMPLETE

## Files Changed
- `src/web/src/masters/masterDataAdapters.ts`
- `src/web/src/pages/ItemMasterPages.tsx`
- `tests/web/item-product-master/*`
- `docs/item-product-master-completion/*`

## Screens Touched
- Item list
- New item draft modal
- Existing item edit modal
- Classification, UOM/measurement, physical specs, and media/documents tabs

## Fields Corrected
- UOM selectors now preserve and save governed UOM IDs for stock, purchase, sales, production, packaging, and vendor reference UOMs.
- Packaging UOM now round-trips as a governed ID instead of a display-only label.
- Weight, dimension, planning, MOQ, lead-time, and quantity fields remain numeric/decimal controls.

## Actions Corrected
- Upload media uses shared attachment upload for saved live items.
- Set primary and retire media are disabled with visible business reasons instead of appearing as no-op buttons.
- Save Draft preserves edited values across tabs.

## Tests Added/Updated
- `ItemMasterGovernedClassification.test.tsx`
- `ItemMasterNumericSpecs.test.tsx`
- `ItemMasterMediaUploadTruth.test.tsx`
- `ItemMasterSaveReopenAllTabs.test.tsx`
- `ItemMasterLifecycleAndDependencyRules.test.tsx`

## Validation Results
- `npm run typecheck`: passed
- `npm test`: passed
- `npm run audit:erp-completion`: passed
- `npm run build`: passed
- `npm run build:host`: passed
- `dotnet build src/server/STS.Mfg.sln`: passed
- `dotnet test src/server/STS.Mfg.sln --no-build`: passed
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: passed

## Screenshot Folder
- `docs/codex-review-screens/ERP-COMPLETION-PACKS-V1/item-product-master/`

## Remaining Blockers
- None for touched pack scope.
