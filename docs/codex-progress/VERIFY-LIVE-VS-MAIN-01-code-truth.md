# VERIFY-LIVE-VS-MAIN-01 Code Truth

Date: 2026-05-11
Branch: `main`
Commit inspected: `0c88caf`

## Code Truth Summary

Current `main` contains the expected Item Master field-governance changes from `MASTER-COMPLETION-WAVE-01`.

| Field / action | Current control in code | Expected control | Source master exists | Code truth |
| --- | --- | --- | --- | --- |
| Category | `ErpLookupField` in `src/web/src/pages/ItemMasterPages.tsx` | Governed lookup/select | Yes, item group/category values via `listItemGroupSetup` / item setup records | Governed, not free text |
| Subcategory | `ErpLookupField` | Governed lookup/select or disabled governed selector | Partial; values are derived from available item setup records | Governed, not free text. Enabled when values exist; otherwise disabled with reason |
| Product Family | `ErpLookupField` | Governed lookup/select or disabled governed selector | Partial; classification registry route exists and options are derived from available item setup records | Governed, not free text. Enabled when values exist; otherwise disabled with reason |
| Business Segment | `ErpLookupField` | Governed lookup/select or disabled governed selector | Partial; classification registry route exists and options are derived from available item setup records | Governed, not free text. Enabled when values exist; otherwise disabled with reason |
| Reporting Bucket | `ErpLookupField` | Governed lookup/select or disabled governed selector | Partial; classification registry route exists and options are derived from available item setup records | Governed, not free text. Enabled when values exist; otherwise disabled with reason |
| Stock UOM | `ErpLookupField` | Governed lookup/select | Yes, derived from UOM-backed item setup records | Governed, not free text |
| Purchase UOM | `ErpLookupField` | Governed lookup/select | Yes/partial, derived from available UOM options | Governed, not free text |
| Sales UOM | `ErpLookupField` | Governed lookup/select | Yes/partial, derived from available UOM options | Governed, not free text |
| Net weight | `DecimalTextField`, implemented with `ErpDecimalField` | Decimal numeric control | Not a lookup field | Governed numeric, not unrestricted text |
| Gross weight | `DecimalTextField`, implemented with `ErpDecimalField` | Decimal numeric control | Not a lookup field | Governed numeric, not unrestricted text |
| Package dimensions | `ErpDecimalField` | Decimal numeric control | Not a lookup field | Governed numeric |
| Image/media upload | `ErpFileActionState` and disabled `Upload media` action | Working, disabled with reason, or hidden | Upload/storage workflow not implemented | Disabled with reason: media storage is not enabled for item records |

## Important Code Locations

- Classification options are built from `categoryOptions`, `subCategoryOptions`, `productFamilyOptions`, `businessSegmentOptions`, and `reportingBucketOptions` in `ItemMasterPages.tsx`.
- Item classification fields render as `ErpLookupField` in the `Classification` tab.
- UOM fields render as `ErpLookupField` in the core and packaging sections.
- Net/gross weights render through `DecimalTextField`, which returns `ErpDecimalField`.
- Media upload uses `ErpFileActionState` with `enabled={false}` and the page action bar keeps `Upload media` disabled with a reason.

## Code Verdict

`main` code is not the source of the reported free-text issue for the checked fields. If live still shows free-text Category/Subcategory/Product Family/Business Segment/Reporting Bucket/UOM or enabled fake upload, the likely causes are:

1. live deployment is serving an older built JS asset, or
2. browser/proxy asset cache is serving an old asset.

The first live asset check supports outdated deploy: latest `main` serves `assets/index-CVsIt348.js`, while live served `assets/index-B_NeeSYz.js`.
