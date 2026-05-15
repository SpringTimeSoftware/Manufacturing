# Production Shop Floor Completion Spec v1

## Binding objective

Implement the Manufacturing ERP production/shop-floor layer at a commercially credible level.

This is not a dashboard-only or demo-only module. It must support the real production execution path:

**production order creation/conversion → release checks → dispatch/job card → material issue/backflush → operation start/confirm → labor/machine time → scrap/rework/reject → production receipt → cost/WIP review → close/correction.**

The workbook `production_shop_floor_benchmark_workbook_v1.xlsx` is the binding contract.

## Non-negotiable rules

1. No visible action may be dead.
   - It must be working.
   - Or disabled with a clear reason.
   - Or hidden.

2. Governed fields must not be free text.
   - Item, BOM, routing, work center, machine, operator, UOM, warehouse, bin/location, lot, serial, cost center, QC plan, reason code, status and source reference must be selected from governed records.

3. Numeric/date/time fields must not be unrestricted text.
   - Quantity, scrap, rework, setup minutes, run minutes, machine minutes, labor minutes, cost, percent, capacity, duration and dates must use typed controls, DTO validation and DB types.

4. Production transactions with lines must support multiple lines on desktop.
   - Component issue/backflush/return must be a compact editable grid.
   - Operation/component grids must support multiple records.
   - Add Line, Remove Line, Validate All and Save/Post All must work where applicable.

5. No `lines[0]`, `firstLine`, first-row-only calculation or first-row-only save.
   - All transaction rows must validate, post, persist and reopen.

6. Live authenticated mode must not show seeded or fake operational production data.
   - Empty database means an empty state, not demo work orders/jobs.

7. Deep create/edit/detail screens must use full-page workspace or centered modal workspace.
   - Right drawers are invalid for deep production order editing.

8. Upload/media/document/print/label actions must be real or disabled/hidden.
   - No fake traveler, no blank generated PDF, no inert attachment icon.

## Required module areas

### Production order header

Must include governed fields for order type, source type/source reference, item, BOM, routing, revision/version, company, plant, work area, scheduler, priority, status, quantities, dates, warehouse, WIP location, production storage location, cost collector, customer/SO link, configuration, tracking policy, QC plan, document set, material/capacity availability, hold flags and audit.

### Operation execution lines

Must support multiple operations and operation status flow.

Required operation concepts:

- sequence / operation code / operation name
- count point / optional operation
- predecessor/successor dependency
- work center / machine / machine group
- tooling / labor grade / shift
- planned and actual setup, run, labor and machine time
- planned and actual start/finish
- yield, scrap, rework, reject and remaining quantity
- confirmation number/type/final flag
- inspection required, safety and operation instructions
- outside processing classification
- hold reason and notes

### Material consumption

Must include component lines copied from BOM and support issue/backflush/return.

Required material concepts:

- component line number, item, revision and assigned operation
- required quantity per, scrap factor and total required quantity
- UOM, issue method, reservation/staging/issued/returned/shortage quantities
- source warehouse/bin, production storage, WIP location
- lot, serial and license plate
- consume quantity and actual UOM
- final issue/end flag
- substitute item and reason
- variance reason
- issue document, posting date, posted by
- backflush source rule, phantom flag, quality restricted flag and expiry

### Dispatch board and terminal

Must support production supervisor/operator execution from real released operations.

Required concepts:

- ready, in-process, completed, scrapped and rejected quantities
- work area/work center/machine filters
- attention reasons and visual cues
- queue position and resequence controls
- assigned/current operator
- traveler/label/document status
- terminal device/configuration
- can-start/can-complete/can-scrap/can-issue computed action flags

### Job card / traveler

Must be generated from persisted order data and include:

- order and operation identity
- item/revision/BOM/routing/version
- work center, machine, setup/run details
- component/material list
- documents, drawing, SOP and QC sheet
- barcode/QR scan token
- print log, print version and reprint reason
- safety/setup/quality notes

### Labor and machine time

Must support real registrations, not UI-only time fields.

Required concepts:

- registration ID
- worker/operator/badge
- resource type/resource/machine
- start/end/elapsed time
- setup, run, machine, labor, indirect and downtime minutes
- time source
- approval status, approved by/at
- transfer status/error
- bundling, allocation key, assistant/crew group where enabled
- clock in/out and break/indirect activity where visible

### Downtime and OEE inputs

Must capture downtime events if visible:

- machine status
- downtime type and reason
- event start/end/duration
- OEE relevance
- availability/performance/quality loss
- root cause and maintenance request handoff

### Scrap, rework, receipt and close

Must post structured production transactions:

- yield/scrap/rework/reject
- production receipt
- partial receipt
- lot/serial/bin controlled output
- inventory movement document
- WIP/cost effect
- reversal/correction
- close readiness
- cost review

### Traceability handoff

This pack does not replace the later inventory/warehouse/traceability pack, but it must not break traceability.

It must create or preserve:

- parent finished lot/serial
- consumed component lot/serial
- consumption transaction
- receipt transaction
- genealogy link
- trace audit

### Quality handoff

This pack does not replace the later quality/NCR/CoA pack, but it must support handoff:

- inspection required flag
- inspection lot/check ID
- QC plan/revision
- hold/release status
- quality decision
- defect quantity/severity
- NCR/quality notification reference
- quality attachments truth

## Required implementation sequence for Codex

1. Scan repo routes, pages, API controllers, services, DTOs, models, DB migrations and seed data.
2. Update workbook `Current_Mapping`.
3. Populate `Gap_Template`.
4. Write failing tests first for P0 fields/actions/workflows and anti-pattern scans.
5. Implement P0 production order header, operations, components, dispatch, terminal, material issue/backflush, confirmations, receipt and close gates.
6. Implement lookup truth and numeric/date truth in UI, API and DB.
7. Remove or fix dead/fake actions.
8. Remove seeded operational live-data leakage.
9. Capture screenshot gates.
10. Run tests/build/lint/static scans.
11. Update workbook evidence and status columns.
12. Create review pack.
13. Commit/push only after P0 gates pass.

## Invalid completion

The module is not complete if any of these remain:

- production order is just a static dashboard
- operation lines are missing or single-operation only
- material issue/backflush is single-line only
- component grid saves only first line
- start/complete actions only mutate React state
- issue/receipt has no inventory/WIP/cost transaction
- lot/serial fields are free text
- quantities/time/cost fields are text
- traveler/label/document buttons are fake
- no save/reopen/API tests
- no screenshots
- no scan logs
- live mode shows fake operational data
