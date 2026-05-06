# P028 — Purchase requisition, purchase order, and subcontract schema

## Phase
Phase 1 - Database

## Objective
Model procurement actions.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/database/P027-planning.md`
- `/docs/database/P021-suppliers.md`

## Work to do
- Design PurchaseRequisitions, PurchaseRequisitionLines, RequestsForQuote, PurchaseOrders, PurchaseOrderLines, and SubcontractOrders.
- Support linkage back to MRP/BOQ exceptions and work orders.
## Deliverables for this prompt
- `/docs/database/P028-procurement.md`

## Definition of done
- Keys, constraints, and relationships are documented.
- The design supports multi-company, branch, warehouse, bin, and role scoping.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P029_inventory-lots-serials-and-stock-ledger-schema.md`
