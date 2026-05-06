# P020 — Customer and address schema

## Phase
Phase 1 - Database

## Objective
Model customers for order, shipment, and dashboard use cases.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/database/conventions.md`
- `/docs/demo/demo-master-data.md`

## Work to do
- Design Customers and CustomerAddresses.
- Support multiple ship-to/bill-to contacts and branch/company scope.
## Deliverables for this prompt
- `/docs/database/P020-customers.md`

## Definition of done
- Keys, constraints, and relationships are documented.
- The design supports multi-company, branch, warehouse, bin, and role scoping.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P021_supplier-address-and-lead-time-schema.md`
