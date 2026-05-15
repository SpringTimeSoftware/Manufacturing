# Inventory / Warehouse / Traceability Completion Pack v1

Pack: `inventory_warehouse_traceability_completion_pack_v1`

## Purpose

This pack defines the completion contract for the Manufacturing ERP Inventory, Warehouse, Bin, Stock Ledger, Lot/Serial/License Plate traceability, material movement, cycle count, physical inventory, barcode/mobile scan, exception, and audit/RBAC areas.

This is not a UI beautification prompt and not a sample feature list. The benchmark workbook is the binding implementation contract. The module is incomplete until field-level, action-level, workflow-level, test-level, screenshot-level, and review-evidence gates are met.

## Source-backed ERP expectations

The workbook benchmarks expected behavior against SAP S/4HANA EWM/Inventory Management, Oracle Fusion Cloud SCM Inventory, Microsoft Dynamics 365 Supply Chain Management, NetSuite Inventory/WMS documentation, and Epicor Kinetic/WMS sources. Source URLs are in the `Source_References` and `Vendor_Benchmark` sheets.

Key source-backed expectations used in the pack:

- SAP_EWM_BIN: SAP Help Portal - Storage Bin — https://help.sap.com/docs/SAP_EXTENDED_WAREHOUSE_MANAGEMENT/3d97bec9bf1649099384bb8167df3cf2/55c8cb53ad377114e10000000a174cb4.html
- SAP_EWM_PI: SAP Help Portal - Physical Inventory — https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/9832125c23154a179bfa1784cdc9577a/4cb4e7d54c1f1921e10000000a15822b.html
- SAP_EWM_SERIAL: SAP Help Portal - Serial Number — https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/9832125c23154a179bfa1784cdc9577a/6ac8cb53ad377114e10000000a174cb4.html
- SAP_IM_HU: SAP Help Portal - Handling Units in Inventory Management — https://help.sap.com/docs/SAP_S4HANA_CLOUD/32da8359c8ee4e8b8e8c5e15cacba5aa/deb44d96aa234bada7d5893f1802ab63.html
- ORACLE_LOT_SERIAL: Oracle Docs - Lot and Serial Numbers — https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25d/famml/lot-and-serial-numbers.html
- ORACLE_INV_IMPL: Oracle Docs - Overview of Implementing Inventory Management — https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25c/faims/overview-of-implementing-inventory-management.html#s20054447
- ORACLE_LOT_TXN: Oracle Docs - Lot Details for Inventory Transactions — https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/oadsc/InvTransactionLotDetailExtractPVO.html
- ORACLE_SERIAL_TXN: Oracle Docs - Serial Number Details for Inventory Transactions — https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26a/oadsc/InvTransactionSerialDetailExtractPVO.html
- MS_CYCLE: Microsoft Learn - Cycle counting — https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/cycle-counting
- MS_CONFIRM: Microsoft Learn - Batch, serial, license plate, and location confirmation — https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/batch-and-license-plate-confirmation
- MS_STATUS: Microsoft Learn - Inventory statuses — https://learn.microsoft.com/en-us/dynamics365/supply-chain/inventory/inventory-statuses
- MS_LOCATION: Microsoft Learn - Warehouse location status — https://learn.microsoft.com/en-us/dynamics365/supply-chain/warehousing/warehouse-location-status
- NS_BIN: NetSuite Help - Bin Management — https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2270284.html
- NS_LOT_SERIAL: NetSuite Help - Lot, Serial, and Bin Numbering — https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1504285820.html
- NS_INV_TRACE: NetSuite Inventory Management — https://www.netsuite.com/portal/products/erp/warehouse-fulfillment/inventory-management.shtml
- EPI_KINETIC_WH: Epicor Kinetic Warehouse — https://www.epicor.com/en-us/products/enterprise-resource-planning-erp/kinetic/supply-chain-management/ptw-warehouse/
- EPI_WMS: Epicor Warehouse Management — https://www.epicor.com/en-us/products/enterprise-resource-planning-erp/warehouse-management-wms/

## Workbook summary

- Vendor benchmark rows: 250
- Target field rules: 505
- Action contract rows: 164
- Workflow contract rows: 44
- Lookup / numeric truth rows: 420
- Test cases: 753
- Anti-pattern rows: 40
- Screenshot gates: 28
- Completion gates: 26
- Invalid output rules: 42

## Required ERP scope

### Inventory and on-hand truth

Implement real on-hand visibility by:

- company
- site / plant
- warehouse
- zone / aisle / rack / shelf / bin or locator
- item / product
- item revision
- base UOM and display UOM
- lot / batch
- serial number
- license plate / handling unit / PCID / pallet
- owner / consignment partner where applicable
- inventory status
- quality status
- physical quantity
- available quantity
- reserved quantity
- allocated quantity
- picked quantity
- blocked quantity
- quality hold quantity
- quarantine quantity
- in-transit quantity
- WIP quantity
- stock value / costing handoff status

Available quantity must be derived from real stock ledger and status/reservation dimensions. It must not be a hardcoded or user-entered number.

### Warehouse and bin structure

Implement governed warehouse/location structure:

- warehouse master
- zone master
- aisle, rack, bay, shelf, level
- bin / locator master
- bin barcode
- bin status
- bin capacity by weight, volume, pallet count, and quantity where applicable
- item/lot/status/owner mixing policy
- pick, putaway, and count sequence
- default receiving, inspection, quarantine, scrap, issue, production receipt, and dispatch bins
- warehouse-level WMS, reservation, negative stock, cycle count, and status policies

Bin and warehouse fields must be lookups/selects. Free text is invalid.

### Stock ledger and movement truth

All stock-affecting actions must create persistent, auditable stock ledger/movement records. This includes:

- goods receipt / putaway handoff
- production receipt
- issue to production
- return from production
- bin-to-bin movement
- warehouse-to-warehouse transfer
- site-to-site transfer
- stock adjustment
- quality hold
- quality release
- scrap
- rework
- dispatch pick/ship handoff
- count adjustment
- status change
- license plate split/merge/move

Posted movements must not be physically deleted. Use reversal/void records with audit.

### Transaction line grid standard

Every stock document with lines must use a compact editable grid on desktop:

- material issue
- material return
- stock transfer
- bin movement
- adjustment
- cycle count entry
- physical inventory entry
- quality hold lines
- release lines
- scrap/rework lines
- production receipt lines
- license plate pack/unpack lines

Required line behavior:

- header plus compact editable line grid
- Add Line
- Remove Line
- edit all lines
- validate all lines
- save all lines
- reopen all lines
- totals from all lines
- line-level lot/serial/bin/LP/status selection
- line-level reason/status validation where applicable

Reject:

- `lines[0]`
- `firstLine`
- one-line-only saves
- card-per-line desktop entry
- totals from first line only
- no Add Line
- no Remove Line

### Lot, serial, and license plate traceability

Implement lot/batch truth:

- lot number
- supplier lot
- manufacturing date
- receipt date
- expiry date
- retest date
- lot status
- lot grade
- quality status
- CoA document
- QC inspection
- hold/release reason
- stock balance by lot/status/bin
- forward and backward trace

Implement serial truth:

- one serial per base unit where item is serialized
- no duplicate active serials
- serial lifecycle status
- current warehouse/bin/license plate
- source receipt or production order
- dispatch/customer linkage
- void/reassign only through governed transaction and audit

Implement license plate / handling unit / PCID truth:

- LP/PCID number
- parent-child hierarchy
- contained stock identities
- pack/unpack/split/merge/move
- status
- barcode label
- scan validation
- reconciliation against contained stock

### Quality hold, blocked stock, and status control

Inventory status and quality status must control allowed actions.

Blocked, damaged, quarantine, quality hold, expired, or unavailable stock must not be usable for issue, pick, dispatch, production consumption, or transfer unless an explicit policy and approval allows it.

Hold/release actions must link to:

- QC inspection
- NCR
- CoA
- reason code
- approver
- audit trail
- movement/status ledger

### Cycle count and physical inventory

Implement:

- cycle count plans
- ABC/frequency/threshold policies
- count work generation
- assigned counter / worker
- blind count mode
- mobile count entry
- book quantity
- counted quantity
- variance quantity
- variance percentage
- variance value
- recount
- tolerance approval
- adjustment posting
- physical inventory document
- freeze/control policy
- close/reopen rules where applicable

Count variances over tolerance must not post without approval and reason.

### Barcode and mobile scan truth

Barcode/mobile scan must not be a fake button.

Implement or clearly disable with reason:

- barcode template mapping
- item scan
- bin scan
- lot scan
- serial scan
- license plate scan
- UOM/quantity parse
- scan validation
- rejected scan reason
- offline queue if offline mode is visible
- conflict detection on sync
- photo evidence upload where visible

Desktop movement grids must remain compact editable tables. Mobile can use guided/card steps.

### Traceability and recall impact

Implement:

- forward trace from lot/serial/license plate to production, transfer, dispatch, customer, current stock
- backward trace from complaint/customer/lot/serial to supplier, GRN, production order, component lots/serials, QC/NCR/CoA
- clickable trace graph/list nodes
- quantities on edges/lines
- document links
- export recall impact report

A trace screen that only shows current stock is invalid.

### Reports, dashboards, and exceptions

Implement real, computed reports and exceptions:

- inventory dashboard KPIs
- stock value summary
- blocked stock
- quality hold stock
- negative stock
- expired lot
- near-expiry lot
- orphan serial
- orphan license plate
- unposted movement
- capacity breach
- slow-moving stock
- stock aging
- cycle count pending
- transfer aging

Hardcoded dashboard numbers or sample report rows are invalid.

## Required implementation order for Codex

1. Scan current repo and identify all existing inventory/warehouse/traceability screens, APIs, DTOs, DB tables, tests, seeded data, and menu entries.
2. Fill `Current_Mapping` and `Gap_Template` in the workbook before implementation.
3. Write failing tests first for P0 fields/actions/workflows.
4. Implement backend domain/API/DB validation first for stock identities, quantities, statuses, and movements.
5. Implement frontend screens and compact editable grids.
6. Implement real actions or disable/hide them with reason.
7. Implement save/reopen tests for all stock documents.
8. Implement anti-pattern scans.
9. Capture screenshots required by `Screenshot_Gates`.
10. Update workbook evidence columns and create review pack.
11. Commit and push only after every P0 `Completion_Gates` row passes.

## Invalid completion claims

Do not call this module complete if any of the following remain:

- governed master fields are free text
- quantity/date/cost/capacity fields are unrestricted text
- visible actions are dead
- upload/barcode/export buttons are fake
- on-hand uses seeded/demo values in live mode
- stock documents save only one line
- desktop stock documents use card-per-line entry
- lot/serial/LP traceability is missing or shallow
- count/variance workflows lack approval and posting
- blocked/hold/expired stock can be consumed without policy
- tests/screenshots/scan logs/review pack are missing
