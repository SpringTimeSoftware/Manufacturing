# ITEM-PRODUCT-MASTER-COMPLETION-01 Anti-Pattern Scan

Date: 2026-05-14

Scope scanned:
- `src/web/src/pages/ItemMasterPages.tsx`
- `src/web/src/masters/masterDataAdapters.ts`
- `src/web/src/api/contracts.ts`
- `src/web/src/api/http.ts`
- `src/server/STS.Mfg.Api/Controllers/MeasurementItemControllers.cs`
- `src/server/STS.Mfg.Infrastructure/Measurements/MeasurementService.cs`
- `database/ddl/10-master-data/020_item_master_v2_extension_tables.sql`
- Existing Item Master tests under `src/web/src/pages/` and `tests/web/`

## Findings

| Anti-pattern | Result | Fix |
|---|---|---|
| Classification fields rendered as unrestricted text | Not found on Item Master editor. Category, subcategory, product family, business segment, and reporting bucket render with `ErpLookupField`. | Added pack-specific governed-classification test evidence. |
| UOM fields rendered as unrestricted text | Partially found in save behavior: UOM tab label changes did not always update the saved UOM IDs. | Updated Base, Purchase, Sales, Production, Packaging, and vendor-reference UOM changes to carry governed UOM IDs into save payloads. |
| Numeric physical/packaging/planning fields rendered as text | Not found in visible Item Master editor. Existing wrappers render `ErpNumberField`/`ErpDecimalField`. | Added pack-specific numeric spec test evidence. |
| Media upload active without truthful lifecycle state | Partially found: upload used the shared attachment workflow, but set-primary and retire actions only had tooltip reasons. | Kept upload tied to saved live item attachments and added visible disabled reasons for set-primary and retire lifecycle actions. |
| Save payload omits visible tabs | Partially found around UOM ID persistence. Profile save already includes catalog, packaging, physical specs, manufacturing, planning, inventory, quality, customer refs, and vendor refs. | Added save/reopen test and corrected UOM ID persistence. |
| Item edit right drawer | Not found. Item create/edit uses `ErpModalWorkspace`. | Added lifecycle/deep-workspace test evidence. |
| Dead visible create/save/audit actions | Not found after patch. New opens workspace; Save is working in live sessions or disabled with visible reason; Review audit switches to audit tab. | Added lifecycle/action truth test evidence. |
| Silent seeded live fallback | Partially found: live item profile failures could leave generated profile fields in place. | Live Item Master now requires profile and attachment calls to succeed; API failure surfaces as unavailable instead of silently showing generated profile detail as live. |

## Current Gate Status

- Governed lookup violations in touched Item Master fields: 0
- Numeric-as-text violations in touched Item Master fields: 0
- Visible dead actions in touched Item Master actions: 0
- Upload/media truth issues in touched Item Master actions: 0 active fake actions; set-primary/retire remain disabled with visible reasons
- Deep editor violations: 0
- Internal wording leaks found in touched Item Master UI: 0
