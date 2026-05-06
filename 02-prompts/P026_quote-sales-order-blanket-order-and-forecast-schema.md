# P026 — Quote, sales order, blanket order, and forecast schema

## Phase
Phase 1 - Database

## Objective
Model commercial demand inputs.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/demo/demo-scenarios.md`
- `/docs/database/P020-customers.md`

## Work to do
- Design Quotes, QuoteLines, SalesOrders, SalesOrderLines, BlanketOrders, BlanketOrderSchedules, DemandForecasts, and DemandForecastLines.
- Support make type per line (MTS/MTO/ETO), promised date, priority, and customer spec attachment.
## Deliverables for this prompt
- `/docs/database/P026-sales-demand.md`

## Definition of done
- Keys, constraints, and relationships are documented.
- The design supports multi-company, branch, warehouse, bin, and role scoping.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P027_mps-mrp-and-boq-requirement-schema.md`
