# P019 — Item variants, barcodes, and item-UOM behavior schema

## Phase
Phase 1 - Database

## Objective
Complete the item model.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/database/P018-items-core.md`

## Work to do
- Design ItemVariants, ItemUoms, and ItemBarcodes.
- Support matrix attributes and variant override values.
- Document barcode uniqueness and scan preference rules.
## Deliverables for this prompt
- `/docs/database/P019-item-variants.md`

## Definition of done
- Keys, constraints, and relationships are documented.
- The design supports multi-company, branch, warehouse, bin, and role scoping.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P020_customer-and-address-schema.md`
