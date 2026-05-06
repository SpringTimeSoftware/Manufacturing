# Wave UX-GLOBAL-02 Master Data Enforcement Output

Date: 2026-04-22

## Scope

Applied the already-created ERP UI governance patterns across the Master Data domain without redesigning the sidebar, adding unrelated modules, or changing backend/database/auth behavior.

## Screens Corrected

- Items: removed the confusing setup/source-style badge text from the primary list actions and preserved governed Item Master modal, filters, grid, validation, lookup, and disabled-action behavior.
- Item Groups, Item Attributes, Reason Codes, Item Variants, and Barcodes: moved list actions to `ErpActionBar`, filters to `ErpFilterBar`, registries to `ErpGrid`/`ErpStatusChip`, and detail editors to `ErpModalWorkspace`.
- Customers and Suppliers: replaced right-side deep drawers with governed centered modal workspaces and added minimum serious master sections for Core Info, Sites/Addresses, Contacts, Terms/Commercial, References, Documents, and Audit/History.
- Supplier Lead Times: moved the matrix to governed action/filter/grid patterns and converted the detail editor to an `ErpModalWorkspace`.
- UOM Classes, UOM Conversions, and Measurement Profiles: moved lists and editors to governed patterns and enforced UOM/UOM-class selectors.

## Lookup Enforcement

- Enforced controlled lookup/select controls for reason-code category/type, variant item/template selector, barcode item selector, customer/supplier type, lifecycle status, payment terms, base UOM, from/to UOM, stock UOM class, supplier lead-time item selector, supplier, and order policy.
- Item Master retained governed lookup/select behavior for item type, lifecycle/status, item group/category, UOM, warehouse, make/buy/subcontract, traceability, reorder policy, measurement profile, and packaging UOM.
- Where a mutation or full source lookup is not yet available, the UI keeps the action disabled with business-safe copy and records the dependency in the enforcement matrix.

## Dead Action Handling

- Disabled unsupported new/export/save/audit actions in the affected Master Data screens with explicit business-safe reasons.
- Kept New Item Draft and implemented Item Master save/profile behavior from Wave 4A.1 intact.
- Kept Upload Media disabled where media storage/upload workflow is not available.

## Backend And Database

- No backend code changed.
- No database or seed scripts changed.
- Backend validation was not required for this wave.

## Audit Matrix

- Created `/07-ux-governance/master_data_ux_enforcement_matrix.csv` with one row for each Master Data screen in scope.
- All rows are marked `PARTIAL`, not `PASS`, because mutation endpoints, document/media storage, or deeper customer/supplier domain models remain future wave scope.

## Validation

- `npm run typecheck`: PASS
- `npm test`: PASS
- `npm run build`: PASS
- `npm run build:host`: PASS

No backend validation was required because backend code was not touched.

## Local Run Verification

- Backend health `https://localhost:7042/health`: PASS, HTTP 200.
- Web dev server `http://127.0.0.1:5173`: PASS, HTTP 200.
- Mobile Metro `http://127.0.0.1:8081/status`: PASS, running.
- Login through Vite proxy for `platform.admin`: PASS, HTTP 200 with access and refresh tokens.

## Remaining Master Data UX Gaps

1. Customer Master still needs full Wave 4B data model, create/edit save, address/contact persistence, document storage, and audit history backing.
2. Supplier Master still needs full Wave 4C data model, approved supplier lists, compliance documents, lead-time mutation, and save endpoints.
3. Item Attribute and Item Variant editing remain read-oriented until mutation endpoints and attribute-value sources are added.
4. Barcode setup cannot create labels or print templates until a barcode/label mutation and print workflow exists.
5. UOM Class, UOM Conversion, and Measurement Profile edits are governed visually but still need mutation endpoints.
6. Supplier Lead Times still display supplier IDs when the endpoint does not hydrate supplier names.
7. Media upload/storage remains unavailable in Item Master and must remain disabled until implemented.
8. Customer/supplier references in Item Master need live lookup sources once the customer/supplier deep waves are complete.

## Next Recommended Wave

Wave 4B: Customer Master Deep Rework.
