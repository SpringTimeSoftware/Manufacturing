# ITEM MASTER — DETAILED CODEX PROMPT EXAMPLE

Use this prompt in **Codex App on `main`**.

## Objective
Finish the **Item Master** to an ERP-grade level. This prompt is intentionally detailed so Codex cannot satisfy it with shallow UI work.

## Prompt to give Codex

```text
Work only on branch main.

This is ITEM-MASTER-COMPLETION-EXAMPLE-01.

This is a strict, screen-level completion prompt.
Do NOT switch domains.
Do NOT stop after cosmetic improvements.
Do NOT mark the screen complete unless all critical rules are satisfied.

Goal:
Make Item Master a serious ERP-grade screen family consisting of:
1. Item List
2. New Item Draft
3. Existing Item Edit
4. Item Media / Documents
5. Item Classification
6. UOM / Packaging / Physical Specs
7. Manufacturing / Planning / Inventory / Quality sections
8. Customer / Supplier references
9. Audit / History

Read first:
- AGENTS.md
- docs/codex-progress/README.md
- docs/design/erp-ui-interaction-standards.md
- docs/design/erp-field-governance-standards.md
- 07-ux-governance/master_lookup_field_rules.md
- 07-ux-governance/action_truth_matrix.csv
- 07-governance/entity_field_schema_matrix.csv
- 07-governance/screen_field_violation_matrix.csv
- docs/final-audit/07_screen_issue_register.csv
- src/web/src/pages/ItemMasterPages.tsx
- src/web/src/masters/masterDataAdapters.ts
- src/web/src/api/contracts.ts
- src/web/src/api/hooks.ts
- src/web/src/api/http.ts
- relevant backend item/master controllers/contracts/entities/services/DbContext/configurations
- database/README.md
- relevant DDL/seed scripts already in repo

Non-negotiable rules:
1. No visible action may remain dead.
   Every visible touched action must end as:
   - WORKING
   - DISABLED WITH REASON
   - HIDDEN

2. No governed value may remain unrestricted free text where a source exists.

3. No numeric / decimal / money / quantity / weight / dimension field may remain plain unrestricted text.

4. No active upload action unless the upload workflow really exists.

5. Deep create/edit/detail must use centered modal workspace or full-page workspace.
   No right-drawer deep editors.

6. No internal/scaffold wording in production-facing UI.

7. This wave is COMPLETE only if critical Item Master violations are 0.

Scope in this wave only:
- Item List
- Item Draft / Item Edit
- Item Group / Category / Subcategory / Product Family / Business Segment / Reporting Bucket dependencies as consumed by Item Master
- Item UOM / UOM Class / Measurement Profile / Packaging / Physical Spec consumption as used by Item Master
- Item customer references
- Item vendor references
- Item media/document action truth
- Item audit/history truth

Do NOT do customer/supplier full rework here except where Item Master depends on those lookups.

PHASE 0 — Baseline inventory
Before changing code, inspect Item Master and record baseline counts:
- governed lookup violations
- numeric field violations
- dead actions
- upload truth issues
- layout/modal issues
- wording issues

Update:
- docs/final-audit/07_screen_issue_register.csv
- 07-governance/screen_field_violation_matrix.csv
- 07-ux-governance/action_truth_matrix.csv

PHASE 1 — Item List completion
The Item List must have:

A. Action bar
- New Item Draft
- Import / Export (working or disabled with reason)
- Upload Media (working or disabled with reason)
- Preview Catalog (working or disabled with reason)
- Review Audit (working or disabled with reason)

Action rules:
- do not leave any active-looking dead button
- do not use vague labels like "Workspace data"

B. KPI strip
At minimum:
- total items
- active items
- inactive items
- QC required
- make / buy / subcontract split
- media present / media missing
- catalog visible / hidden if supported

C. Filters
All compact and aligned.
At minimum:
- Search
- Active / Inactive
- Item Type
- Item Group
- Category
- Subcategory
- Product Family
- Business Segment
- Reporting Bucket
- UOM
- Make / Buy / Subcontract
- QC required
- Catalog visible
- Has media

D. Grid columns
At minimum:
- Item Code
- Item Name
- Type
- Group
- Category
- Subcategory
- UOM
- Make/Buy/Subcontract
- QC
- Catalog
- Media
- Status
- Actions aligned

Row click must open the governed Item editor workspace.

PHASE 2 — Item Draft / Edit workspace completion
Use centered ErpModalWorkspace or full-page workspace.
No right drawer.

Required header:
- Item name / Draft Item
- Item code/status chips
- primary actions
- close action

Required footer:
- Save Draft
- Save
- Save & Continue
- Inactivate / Activate where applicable
- Review Audit
- Close

Validation summary:
- compact / collapsible
- must not consume prime screen space
- first meaningful fields must be visible without excessive scroll

Required sections/tabs in this exact wave:
1. Core Info
2. Classification
3. Images & Media
4. Catalog
5. UOM & Conversions
6. Packaging
7. Physical Specs
8. Barcode & Labels
9. Variants / Templates
10. Manufacturing
11. Planning / Replenishment
12. Inventory / Warehouse Policy
13. Quality / Traceability
14. Sales / Commercial
15. Purchase / Vendor
16. Customer References
17. Attachments / Documents
18. Audit / History

Every section must contain either:
- real governed fields / grids
or
- an honest empty state
Not vague placeholders.

PHASE 3 — Exact field/control contract
Enforce these exact field rules in Item Master.

## Core Info
- Item Code → text, required, unique
- Item Name → text, required
- Short Name → text
- Item Type → governed selector
- Lifecycle Status → governed selector
- Active → boolean
- Stock UOM → governed selector, NOT free text
- Sales UOM → governed selector if source exists
- Purchase UOM → governed selector if source exists

## Classification
These must NOT be free text if sources exist:
- Item Group → governed selector
- Category → governed selector
- Subcategory → governed selector
- Product Family → governed selector
- Business Segment → governed selector
- Reporting Bucket → governed selector
If a source master does not exist yet:
- use disabled governed selector with business-safe reason
- do NOT leave as open text

## Images & Media
- Primary Image action must be:
  - working
  - or disabled with reason
- Gallery must show:
  - no media
  - metadata only
  - upload enabled
  - primary image set
- Upload button must not look active unless upload really works
- Set Primary / Retire actions must be truthful

## Catalog
- Catalog Visible → boolean
- Catalog Title → text
- Catalog Section → governed selector if source exists
- Marketing Description → text area
- Publish Status → truthful action/status
- Effective From / To → date controls

## UOM & Conversions
- Stock UOM → governed selector
- Sales UOM → governed selector
- Purchase UOM → governed selector
- Conversion Factor(s) → decimal controls, NOT text
- Catch Weight flag → boolean/governed control

## Packaging
- Inner Pack Qty → numeric
- Carton Qty → numeric
- Pallet Qty → numeric
- Packaging UOM → governed selector
- Label Count → numeric
- Packing Instructions → text area

## Physical Specs
- Net Weight → decimal, NOT text
- Gross Weight → decimal, NOT text
- Length → decimal
- Width → decimal
- Height → decimal
- Thickness → decimal
- Volume → decimal if present
- Material / Finish / Color → governed selector if source exists, else honest text only if spec says free text is allowed

## Barcode & Labels
- Primary Barcode → governed field/grid
- Additional Barcodes → grid
- Label Template → governed selector if source exists

## Manufacturing
- Make / Buy / Subcontract → governed selector
- Default BOM → governed selector if source exists
- Default Routing → governed selector if source exists
- Issue Method → governed selector
- Scrap Allowance % → decimal
- Operation linkage fields → selectors where source exists

## Planning / Replenishment
- MRP Enabled → boolean
- Safety Stock → numeric
- Reorder Point → numeric
- Min Qty → numeric
- Max Qty → numeric
- Lot Size → numeric
- Lead Time Days → numeric
- ABC Class → governed selector if source exists

## Inventory / Warehouse Policy
- Default Warehouse → governed selector
- Default Bin → governed selector
- Lot Controlled → boolean
- Serial Controlled → boolean
- Negative Stock Policy → governed selector if source exists
- Expiry Policy / Shelf Life → governed numeric/select controls

## Quality / Traceability
- QC Required → boolean
- Inspection Plan → governed selector if source exists
- Certificate Requirement → boolean/select
- Hold Rule → governed selector if source exists
- Traceability Depth → governed selector if source exists

## Sales / Commercial
- Sales Enabled → boolean
- Price Group → governed selector if source exists
- Discount Eligible → boolean
- Tax Category → governed selector if source exists
- Currency → governed selector if source exists

## Purchase / Vendor
- Buy Enabled → boolean
- Preferred Supplier → governed selector
- Approved Supplier List → governed multi-select/grid
- Purchase Lead Time → numeric
- MOQ → numeric

## Customer References
Grid must support truthful create/edit if backend exists, otherwise disable with reason.
Columns:
- Customer (lookup)
- Customer Item Code
- Drawing / Revision
- Packaging Override
- Status

## Attachments / Documents
- View/download actions truthful
- Upload truthful or disabled with reason
- document type as governed selector if source exists

## Audit / History
- show real history if available
- otherwise honest empty state
- no fake timeline

PHASE 4 — CRUD / workflow truth
For Item List and Item Editor, enforce:
- New Item Draft
- Edit existing item
- Save Draft
- Save
- Activate / Inactivate
- Upload media
- Set primary image
- Retire media
- Export / Print if present
- Review audit

Each must be:
- WORKING
- DISABLED WITH REASON
- HIDDEN

No dead button.

PHASE 5 — Additive backend / DB support
If current UI truth cannot be achieved without backend/API/DB support:
- add additive backend/API/DB support only for this wave
- update database/README.md if SQL or seed changes
- no destructive resets

PHASE 6 — Recount and wave gate
Recompute for Item Master wave:
- screens in scope
- screens fully compliant
- screens still partial
- governed lookup violations remaining
- numeric field violations remaining
- dead actions remaining
- upload truth issues remaining
- layout/modal issues remaining
- wording issues remaining

This wave is COMPLETE only if:
- screens fully compliant > 0
- critical item-master violations = 0
- touched governed lookup violations = 0
- touched numeric field violations = 0
- touched dead actions = 0

If not, mark PARTIAL/BLOCKED and report exact blockers.

PHASE 7 — Validation
Run:
- npm run typecheck
- npm test
- npm run build
- npm run build:host
- dotnet build src/server/STS.Mfg.sln
- dotnet test src/server/STS.Mfg.sln --no-build
- dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release

PHASE 8 — Screenshot evidence
Capture at minimum:
- item list
- item list filters
- new item draft modal top
- new item draft modal middle/bottom if scroll exists
- existing item edit modal top
- existing item edit modal middle/bottom if scroll exists
- Images & Media section
- Classification section
- Packaging / Physical Specs section

Store under:
- docs/codex-review-screens/ITEM-MASTER-COMPLETION-EXAMPLE-01/

PHASE 9 — Output and review pack
Create/update:
- docs/codex-progress/ITEM-MASTER-COMPLETION-EXAMPLE-01-output.md
- docs/codex-progress/README.md

Create:
- artifacts/review-packs/ITEM-MASTER-COMPLETION-EXAMPLE-01-review-pack.zip

Include:
- updated action_truth_matrix.csv
- updated entity_field_schema_matrix.csv
- updated screen_field_violation_matrix.csv
- updated 07_screen_issue_register.csv
- screenshot folder
- changed DB README / DDL / seed files if any
- ITEM-MASTER-COMPLETION-EXAMPLE-01-output.md

Before stopping:
1. commit all changes
2. push main
3. return only:
   - files changed
   - screens in scope
   - screens fully compliant
   - screens still partial
   - number of lookup violations fixed
   - number of numeric field violations fixed
   - number of dead actions removed/disabled/wired
   - number of upload truth issues fixed
   - top 20 remaining blockers
   - validation results
   - review pack path
```

## How to evaluate this example
This is the pattern to approve or reject.
Check whether it is detailed enough on:
- screens covered
- sections/tabs
- field-by-field control truth
- CRUD/action truth
- numeric truth
- upload/media truth
- stop gates
- screenshot evidence
- review pack deliverables

## Included in the zip
- this prompt file
- a short README explaining what to check in the example
