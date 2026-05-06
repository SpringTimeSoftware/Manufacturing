# P043 — Order risk, stage-wise, and executive dashboard views

## Phase
Phase 2 - SQL Logic

## Objective
Design the dashboard read layer.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/reference-ui/W108_Stage_Wise_Dashboard.html`
- `/reference-ui/W057_Order_Delivery_Dashboard.html`

## Work to do
- Define sp_Order_RiskSnapshot and sp_StageWise_Dashboard or equivalent views.
- Document formulas for completion %, risk status, overdue windows, and blocker classification.
## Deliverables for this prompt
- `/docs/database/P043-dashboard-views.md`

## Definition of done
- The procedure/view contract is explicit: input params, output columns, side effects, and idempotency rules are documented.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P044_asp-net-solution-bootstrap.md`
