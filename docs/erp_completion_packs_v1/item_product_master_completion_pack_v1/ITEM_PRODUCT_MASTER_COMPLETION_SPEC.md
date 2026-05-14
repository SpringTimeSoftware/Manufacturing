# Item / Product Master Benchmark and Completion Pack

Generated: 2026-05-14T07:15:30.333037+00:00

## Purpose

This pack is deliberately **Item/Product Master only**. It is the pilot control document for a better process:

**field-level benchmark → target field catalog → current mapping → anti-pattern scan → failing tests → implementation prompt.**

It should not be treated as a representative summary. If this module is not deep enough, the same method should not be scaled to the rest of the ERP.

## Benchmark evidence used

- SAP S/4HANA product/material master stores product number/name/type/UOM/descriptions/weight/dimensions and is organized into purchasing, sales, storage, MRP, costing, and accounting views.
- Oracle item attributes include main, operational, user-defined, and additional attributes; Oracle inventory/planning/purchasing/manufacturing attributes add transaction, lot, revision, MRP, supplier, receipt, invoice-match, tax, and configured-item behavior.
- Dynamics 365 product masters include product dimensions and released product setup such as storage dimension group, tracking dimension group, item model group, item group, and default order settings.
- NetSuite item records support items used on sales/purchase forms, item costing, multiple pricing, web visibility, related item information, and assembly item manufacturing behavior.
- Epicor Kinetic product data management treats product/part data as a central product history, BOM/routing/specification/change-controlled source of truth.

## Item/Product Master Definition of Done

A product/item record is not complete just because a modal opens or a few fields save. It is complete only when:

1. All governed fields are lookup/select/search controls from a valid source master.
2. All numeric/decimal/money/quantity/weight/dimension fields use governed numeric controls.
3. All visible actions are working, hidden, or disabled with reason.
4. Save/reopen proves all sections persist, not just Core Info.
5. Media upload is either fully implemented with item-specific storage/metadata/authorization, or not shown as an active action.
6. Item lifecycle, make/buy, traceability, QC, manufacturing, purchasing, sales, costing, and warehouse policies drive downstream transaction behavior.
7. Tests and screenshot evidence prove the above.

## Invalid conditions

The implementation is invalid if any of the following are true:

- Category, Subcategory, Product Family, Business Segment, Reporting Bucket, UOM, warehouse, supplier, customer reference, tax/category, price list, discount scheme, work center, machine, QC plan, or reason code is free text when a source master exists.
- Net weight, gross weight, dimensions, conversion factor, MOQ, lead time, prices, discounts, tax, setup/run minutes, or capacity values use unrestricted text.
- Upload Image appears active without working upload/list/set-primary/retire flow.
- Save only persists core fields while other tab fields are ignored.
- Existing item edit opens a weak drawer instead of a governed centered modal/full-page workspace.
- Actions look enabled but do nothing.
- Demo/seeded data is silently shown as live operational truth.

## Required target sections

This pack contains 15 target sections and 203 target field rules. The workbook is invalid if a future version collapses these into a small summary.

## How Codex should use this pack

1. Fill `Current Mapping Template` from the repo.
2. Run anti-pattern scan.
3. Write failing tests first.
4. Implement until tests and audits pass.
5. Capture screenshots.
6. Update gap status and output.
