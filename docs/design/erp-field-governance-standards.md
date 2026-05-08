# ERP Field Governance Standards

Date: 2026-05-08

These standards define the global field, action, data, and layout truth rules for the STS Manufacturing ERP web application. They extend the ERP UI interaction standards and are mandatory for new or touched screens.

## Governed Field Types

| Field type | Required control | Rule |
| --- | --- | --- |
| Master lookup | `ErpLookupField` | Use for item, customer, supplier, UOM, warehouse, bin, BOM, routing, work center, machine, operator, QC plan, tax, currency, payment terms, reason code, and status-master values. Free text is forbidden unless explicitly documented. |
| Integer quantity/count | `ErpNumberField` | Use for counts, days, line numbers, priority ranks, IDs displayed in editable contexts, label counts, and whole-number quantities. |
| Decimal quantity/measure | `ErpDecimalField` | Use for weights, dimensions, percentages, scrap, run minutes, setup minutes, teardown minutes, conversion factors, and catch-weight values. |
| Money/rate | `ErpMoneyField` | Use for prices, discount amounts, exchange rates, charges, and other currency values. Currency must be visible or inherited from a controlled currency lookup. |
| Narrative text | Text input or textarea | Allowed only for names, descriptions, notes, remarks, instructions, external references, customer-visible copy, and other non-master narrative values. |
| Read-only operational field | Disabled input, lookup, status chip, grid cell, or text summary | Review-only fields must not look editable. If a field is controlled by workflow, disable it and show the dependency where useful. |
| File/media action | `ErpFileActionState` or a real upload control | Upload/link actions may be enabled only when backed by real storage/API workflow. Otherwise disable with a business-safe reason or hide. |

## Lookup / Select Rules

- Use lookup/select controls for all controlled master-linked values where a source exists.
- Do not use free text for UOM, item group, warehouse, bin, customer, supplier, currency, tax, payment terms, BOM, routing, work center, machine, operator, QC plan, inspection template, reason code, or controlled status.
- If the source is missing in the current screen, the lookup must be disabled with a reason and the gap must be recorded in `07-governance/screen_field_violation_matrix.csv`.
- A selected persisted value may be displayed even if it is not in the current option list, but the control remains governed.
- Quick create is allowed only when permission-gated and backed by a real create workflow.

## Numeric / Decimal Rules

- Numeric, quantity, weight, dimension, percentage, price, amount, exchange-rate, days, rank, and line-number fields must not be plain unrestricted text.
- Use `ErpNumberField` for integers and `ErpDecimalField` for fractional values.
- Use `ErpMoneyField` for money and rates.
- Minimum, maximum, step, precision, scale, and unit/currency must be explicit where the business meaning depends on them.
- Blank numeric input represents `null`; invalid numeric text must not be committed.

## Media / Document Action Rules

- Active upload/link buttons are allowed only when the API, storage, authorization, and save workflow exist.
- If only metadata can be saved, use an active metadata action and a disabled upload action with a reason.
- File controls must display selected file name when available.
- Document audit/version/preview actions must be disabled or hidden until backed by real document-control workflow.

## Create / Edit / Read-Only Rules

- Create/save actions must be enabled only when the backend workflow exists and validation has passed.
- Review-only modal fields must be disabled or rendered as read-only summaries.
- Deep editors must use `ErpModalWorkspace` or full-page workspace; right drawers are not allowed for deep ERP editing.
- Disabled actions must show concise business-safe reasons.
- Handlerless actions must remain disabled through `ErpActionBar`.

## Action Truth Rules

- Every visible touched action must be `WORKING`, `DISABLED WITH REASON`, or `HIDDEN`.
- No active upload, save, import, export, approve, post, release, print, convert, reserve, or launch action may render without a real handler/workflow.
- If a workflow is deferred but useful for context, keep the action disabled with a reason.
- If an action is not appropriate to the current state, hide it.

## Live Vs Demo Data Rules

- Seeded rows are allowed only for explicit demo/no-live sessions.
- Live authenticated sessions must not silently fall back to seeded operational rows when an API fails.
- Live API failure must surface as an unavailable/empty state, not fake workflow data.
- Adapters must use shared live/demo detection from `src/web/src/api/liveData.ts`.
- Live adapters must throw a business-safe unavailable error for failed API calls after authentication is established; the UI may render an empty/error state, but must not synthesize operational queue rows.
- Demo sample rows must be reachable only through explicit demo/no-live session logic and must not be used as an exception fallback for authenticated live sessions.

## Layout Rules

- Large forms and dense boards must use internal scroll containers.
- Modal workspaces keep headers/footers accessible and body content scrollable.
- Tables may scroll horizontally, but governed controls and primary actions must remain reachable.

## Overnight Correction Addendum

OVERNIGHT-CORRECTION-01 extends these rules project-wide:

- Review-only controlled values still use governed lookup/select controls when the business value is master-linked. A disabled governed control is preferred over an editable-looking text input.
- Date or horizon fields that are not yet editable through a real workflow must be disabled and business-labeled instead of being rendered as generic text.
- Numeric review fields must use the governed number/decimal/money controls even when disabled, so the user can distinguish quantity, days, rates, and money from narrative text.
- Action-truth evidence must be updated when a previously disabled workflow is wired, including create/save draft paths.
- Business-facing pages must avoid internal implementation words such as adapter, fallback, mock, seeded, source status, workspace data, governed setup, reference UI, React, TypeScript, prompt IDs, backend reachable, and guarded demo shell.
