# ERP Quality Gates

`QUALITY-GATES-01` adds static audits and focused web tests that must be used by future completion waves before a screen is marked complete. These gates are intended to fail when ERP-critical implementation gaps remain.

## Commands

- `npm run audit:transaction-lines`
- `npm run audit:governed-fields`
- `npm run audit:numeric-fields`
- `npm run audit:action-truth`
- `npm run audit:live-data-truth`
- `npm run audit:upload-truth`
- `npm run audit:menu-route-truth`
- `npm run audit:erp-completion`
- `npm test`

`audit:erp-completion` runs the audit commands in sequence and stops at the first failing gate. Run the individual audit commands when a full defect inventory is needed.

## Audit Gates

### Transaction Line Depth

Script: `scripts/audit-transaction-line-depth.mjs`

This gate scans transaction screens and contracts for first-line-only transaction handling. It fails on direct `lines[0]` access, `firstLine` workspaces, "First quote line" copy, `index === 0` line-only updates, save payloads that preserve only the first line, and DTOs with `lines[]` or schedules where the page lacks Add Line or Remove Line controls.

Covered transaction families include Quote, Sales Order, Blanket Order, Forecast, Purchase Requisition, Purchase Order, Subcontract Order, Material Issue, Material Return, Stock Transfer, Production Receipt, Scrap/Rework, and Dispatch/Pack List where present.

Failure means the transaction is not safe to mark complete until users can maintain all required lines or the action is explicitly disabled with a business-safe reason.

### Governed Fields

Script: `scripts/audit-governed-fields.mjs`

This gate fails when governed master-linked fields are rendered as unrestricted text inputs. Governed examples include category, subcategory, item group, product family, business segment, reporting bucket, UOM, warehouse, bin, customer, supplier, tax category, currency, payment term, price list, discount scheme, work center, machine, QC plan, and reason code.

Failure means the field must use a governed lookup/select control, or a disabled governed selector with a clear reason when the source master is unavailable.

### Numeric Fields

Script: `scripts/audit-numeric-fields.mjs`

This gate fails when measurable values use unrestricted text inputs instead of numeric, decimal, money, quantity, or date-aware controls. Covered labels include weight, dimensions, quantity, rate, price, discount, tax percent, exchange rate, lead time, conversion factor, MOQ, cycle time, setup minutes, and run minutes.

Failure means the field must be moved to `ErpNumberField`, `ErpDecimalField`, `ErpMoneyField`, an equivalent governed numeric control, or an HTML number/date input where that is the established local pattern.

### Action Truth

Script: `scripts/audit-action-truth.mjs`

This gate fails when visible high-risk actions appear active without being wired, hidden, or disabled with a reason. Target labels include New, New Draft, Create, Save, Save Draft, Save & Continue, Upload, Export, Print, Clone, Run, Convert, Release, Approve, Add Line, and Remove Line.

Failure means the user can see an action that can plausibly be clicked but the code does not prove a working handler or an explicit disabled reason.

### Live Data Truth

Script: `scripts/audit-live-data-truth.mjs`

This gate fails when live authenticated operational experiences silently fall back to seeded/demo data. Covered areas include notifications, approvals, dashboards, work queues, planning alerts, production alerts, and dispatch alerts.

Failure means live users may see operational-looking rows that are not trustworthy. Demo rows must be isolated to explicit demo/no-live sessions or replaced by a business-safe empty/unavailable state.

### Upload Truth

Script: `scripts/audit-upload-truth.mjs`

This gate fails when upload, media, document, attachment, or proof actions are visible without a real handler/file control or a disabled reason. Navigation labels, KPI labels, and non-action metadata are ignored.

Failure means the UI is implying a file workflow exists when the code cannot prove storage, preview, download, or an explicit business-safe disabled state.

### Menu Route Truth

Script: `scripts/audit-menu-route-truth.mjs`

This gate compares `navigationItems` with guarded routes in `router.tsx`. It fails when a user-facing route is registered without a role-aware navigation mapping, or when navigation points to a missing route. Auth and help subroutes are excluded because they are entry or content pages reached from the Help Center.

Failure means route/menu completeness or role-aware access mapping has drifted.

## Web Tests

Focused tests under `tests/web/` enforce user-visible behavior that static audits cannot fully prove:

- `transaction-line-depth/QuoteMultilineFlow.test.tsx`
- `transaction-line-depth/SalesOrderMultilineFlow.test.tsx`
- `transaction-line-depth/PurchaseOrderMultilineFlow.test.tsx`
- `field-governance/ItemMasterGovernedFields.test.tsx`
- `action-truth/NewDraftActionTruth.test.tsx`

These tests intentionally fail when current screens still expose partial transaction editors, dead New/New Draft actions, or incorrect field controls.

## Future Wave Rule

Before future Codex waves mark ERP screens complete, they must run the relevant audit gates and focused tests. A failing gate can be accepted only when the output identifies a real current product gap and the wave explicitly records the next implementation work required.
