# Workstream Order and Gates

## Mandatory order

1. WS01 Runtime / UAT / Seed Truth
2. WS02 Platform / Security / Admin / Extensibility
3. WS03 Master / Resource / Commercial Foundation
4. WS04 Engineering / Planning
5. WS05 Production / Shop Floor Execution
6. WS06 Inventory / Quality / Dispatch / Documents
7. WS07 Mobile / Integrations / AI / Reporting
8. WS08 Finance / Accounting / GL / AP / AR
9. WS09 Procure-to-Pay Deepening
10. WS10 Service / Warranty / AMC
11. WS11 Final Release / Performance / Hardening

## Why this order

- Runtime truth comes first because broken live APIs and fake seeded data make every later claim unreliable.
- Platform/security/admin comes early because approvals, audit, permissions, workflow, and UDF govern every module.
- Master data comes before transactions because every transaction depends on item/customer/supplier/UOM/tax/currency/resource truth.
- Engineering/planning comes before production because work orders and job cards depend on released BOM/routing/planning.
- Production comes before inventory/QC/dispatch finalization because stock/QC/dispatch consume production truth.
- Mobile/integrations/AI/reporting are force multipliers and must sit on stable core data.
- Finance and P2P can be built after operational transaction truth is strong enough to post/account.
- Service/AMC depends on serial/lot/customer/item/dispatch history.
- Final release comes last.

## Gate classification

### COMPLETE
A workstream can be complete only if:
- all critical screens in scope pass field/action/data/layout truth
- all critical user flows save/load/reopen correctly
- validation passes
- screenshots exist
- review pack exists
- no critical blockers remain

### PARTIAL
A workstream is partial if:
- screens are improved but not all critical functions are working
- actions are mostly disabled with reasons rather than implemented
- backend or DB is missing for major workflows
- screenshots/validation are incomplete

### BLOCKED
A workstream is blocked if:
- required upstream data model is missing
- validation fails and cannot be safely fixed
- implementing truth requires large new architecture outside the workstream
- a required provider/hardware/service is unavailable

## No-fake-completion rule

A workstream is not complete merely because:
- screens exist
- fields exist
- buttons are disabled with reasons
- matrices are updated
- tests pass but workflows are not functional

## Stop policy

Codex must stop only when:
- workstream is COMPLETE
- workstream is BLOCKED with exact reasons
- validation fails and cannot be safely repaired

Codex must not stop after only completing a few examples.
