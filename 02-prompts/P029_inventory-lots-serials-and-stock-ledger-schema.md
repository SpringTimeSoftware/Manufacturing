# P029 — Inventory, lots, serials, and stock ledger schema

## Phase
Phase 1 - Database

## Objective
Model the inventory system of record.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/database/P017-measurements.md`
- `/docs/database/P018-items-core.md`
- `/docs/database/P014-warehouse-bin.md`

## Work to do
- Design StockBalances, StockTransactions, StockReservations, Lots, and Serials.
- Support lot, serial, expiry, catch-weight, reserved, blocked, QC-hold, and in-transit states.
## Deliverables for this prompt
- `/docs/database/P029-inventory.md`

## Definition of done
- Keys, constraints, and relationships are documented.
- The design supports multi-company, branch, warehouse, bin, and role scoping.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P030_work-order-job-card-and-shift-handover-schema.md`
