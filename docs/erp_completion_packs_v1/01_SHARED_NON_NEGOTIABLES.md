# Shared Non-Negotiables for Remaining ERP Completion Packs

These rules apply to every pack in this folder. They are written to prevent another round of shallow "looks complete" fixes that still leave product gaps.

## 1. Truth Rule

Every visible action must be one of the following:

1. Fully implemented against real persisted data, with API/service/data-model/UI/test coverage.
2. Disabled or unavailable with a precise business-safe reason, only when the action is outside the pack's declared P0 scope.
3. Hidden if the user role or record state should not expose it.

Do not leave dead buttons, fake modals, static previews, dummy success toasts, placeholder sample tables, seeded-live fallbacks, or local-only state.

## 2. Field Truth

Every field added or changed must satisfy all of these:

- persisted to the correct entity or snapshot table;
- reopens with the same value after refresh;
- validated by type, range, lifecycle status, and role;
- searchable/reportable where business users would expect it;
- included in import/export/reporting only through governed metadata;
- audited when commercially or operationally important.

## 3. Transaction Grid Truth

Editable transaction lines must use the repository's standard compact transaction line-grid pattern where applicable. Avoid card-only line entry for desktop transaction screens.

Each line grid must handle:

- add/remove lines;
- keyboard-friendly entry;
- item/UOM/location/bin/lot/serial selectors where required;
- numeric quantity/price/discount/tax/charge fields;
- line-level remarks and UDFs where relevant;
- recalculation across all lines, not first-line-only;
- save/reopen/approval/posting tests.

## 4. Commercial Truth

Quote, sales order, invoice, purchase order, dispatch, and service billing flows must not silently lose or recalculate commercial values.

Required checks:

- salesperson/sales owner exists on quote and sales order header, and line-level owner where needed;
- internal remarks and customer-facing remarks exist and persist;
- price list, price source, discount source, and override reason are traceable;
- tax code, tax rate, charge taxability, rounding, and total calculation are explicit;
- freight/add-less/round-off are handled by a shared commercial charge contract;
- document revisions snapshot price/discount/tax and never silently use latest setup unless repricing is explicitly requested and audited.

## 5. Warehouse Truth

All inventory-touching packs must handle warehouse control level correctly.

Required checks:

- branch/warehouse/location/bin selection where the stock policy requires it;
- lot/serial/batch/license-plate/PCID validation where applicable;
- quality-hold/quarantine/non-allocatable stock cannot be consumed or dispatched without authorised override;
- stock movements are atomic and auditable;
- mobile/barcode flows validate the same rules as desktop flows.

## 6. Revision Truth

Revision-controlled data must not be consumed by downstream transactions using an ambiguous "current latest" lookup.

Required checks:

- quote/SO/PO/work order/inspection/dispatch/service documents store explicit item/BOM/routing/document revision references where required;
- released documents are locked or revised through a revision workflow;
- downstream transactions show the revision actually used;
- revision changes do not mutate historical transactions.

## 7. Attachment and Document Output Truth

Upload, print, export, and generated-document actions are product features, not cosmetic buttons.

Required checks:

- persisted entity id before upload unless staged upload is intentionally implemented;
- document category, authorization, metadata, preview/download, audit;
- generated file storage and retention;
- template version and output parameters;
- reissue/reprint/export log with reason where business critical.

## 8. Workflow and Approval Truth

Any action that changes legal, financial, inventory, quality, or customer-facing state must use durable workflow state.

Required checks:

- status transitions are explicit;
- blocked transitions explain exact missing prerequisite;
- maker/checker and approval threshold rules are enforced where required;
- every transition stores actor, timestamp, reason, prior state, next state;
- reopened/cancelled/reversed states do not corrupt linked documents.

## 9. Integration and Runtime Truth

Provider, AI, mobile, scheduler, and external-delivery features must never fake runtime success.

Required checks:

- queued/pending/sent/delivered/failed statuses are distinct;
- provider response/callback is logged;
- credentials/secrets are never hardcoded;
- offline/mobile queues are idempotent and conflict-aware;
- AI-generated external actions require human approval unless explicitly safe.

## 10. Evidence Required from Codex

Every pack run must end with a report containing:

- files changed;
- routes/screens touched;
- APIs/services/migrations added;
- tests and audit commands run;
- manual verification steps;
- remaining disabled actions and why they are truly out of scope;
- screenshots or terminal evidence where possible;
- explicit answer to: "Did quote/SO salesman, remarks, price/discount/tax, bin selection, and revision references remain correct after this pack?"