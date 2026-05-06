# P005 — Domain glossary and status catalog

## Phase
Phase 0 - Domain

## Objective
Create the shared domain dictionary so backend, web, mobile, SQL, and reports use the same words.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/design/design-language.md`

## Work to do
- Define document names: quote, sales order, BOM, ECO, MPS, MRP run, BOQ requirement, PR, PO, work order, job card, inspection, pack list, shipment.
- Define common statuses for each document.
- Define quantity terms: planned, issued, consumed, returned, good, reject, scrap, rework, reserved, available.
- Define machine states and delay reasons.
## Deliverables for this prompt
- `/docs/architecture/domain-glossary.md`
- `/docs/architecture/status-catalog.md`

## Definition of done
- Glossary covers all core documents and quantity terms.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P006_role-matrix-and-data-access-model.md`
